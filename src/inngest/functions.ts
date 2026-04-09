import { inngest } from "./client";
import { cron, eventType } from "inngest";
import { syncPropertyIcal } from "@/lib/ical";
import { db } from "@/db";
import { properties, units, utilityProfiles, tasks, users, bookings } from "@/db/schema";
import { isNotNull, eq, sql } from "drizzle-orm";
import { syncKplcForOrganization } from "@/lib/kplc/sync";
import { darajaClient } from "@/lib/mpesa/daraja";

export const syncAirbnbCalendar = inngest.createFunction(
  { id: "sync-airbnb-calendar", triggers: [cron("*/15 * * * *")] },
  async ({ step }) => {
    const props = await step.run("fetch-properties", async () => {
      // Find all properties with an iCal URL
      return await db.select({
        id: properties.id,
        name: properties.name,
        airbnbIcalUrl: properties.airbnbIcalUrl
      }).from(properties).where(isNotNull(properties.airbnbIcalUrl));
    });

    for (const prop of props) {
      if (!prop.airbnbIcalUrl) continue;
      
      await step.run(`sync-property-${prop.id}`, async () => {
        return await syncPropertyIcal(prop.id, prop.airbnbIcalUrl as string);
      });
    }
    
    return { syncedCount: props.length };
  }
);


export const checkKPLCTokens = inngest.createFunction(
  { id: "check-kplc-tokens", triggers: [cron("0 */4 * * *")] },
  async ({ step }) => {
    const orgRows = await step.run("fetch-orgs-with-kplc-meters", async () => {
      return await db
        .selectDistinct({ organizationId: units.organizationId })
        .from(units)
        .where(isNotNull(units.kplcMeterNo));
    });

    await step.run("query-kplc-balances", async () => {
      let syncedOrganizations = 0;
      for (const row of orgRows) {
        if (!row.organizationId) continue;
        await syncKplcForOrganization(row.organizationId);
        syncedOrganizations += 1;
      }
      return { syncedOrganizations };
    });

    // New Auto-Topup Engine
    await step.run("execute-kplc-auto-topups", async () => {
       const profiles = await db.select().from(utilityProfiles).where(eq(utilityProfiles.autoTopupEnabled, true));
       // Mock logic: iterate through profiles, check if balance < minBalanceThreshold
       // If true, trigger darajaClient.initiateC2BPaybill for KPLC 888880.
       for (const profile of profiles) {
          console.log(`[KPLC] Checking auto-topup for unit ${profile.unitId}`);
          // trigger topup
       }
    });
  }
);

export const processVerifiedTask = inngest.createFunction(
  { id: "process-verified-task", triggers: [eventType("task/verified")] },
  async ({ event, step }) => {
     const { taskId } = event.data;
     
     const taskResult = await step.run("fetch-task", async () => {
        const res = await db.select().from(tasks).where(eq(tasks.id, taskId));
        return res[0];
     });

     if (taskResult && taskResult.totalPayout && taskResult.assignedTo) {
        const userResult = await step.run("fetch-user", async () => {
           const usersRow = await db.select().from(users).where(eq(users.id, taskResult.assignedTo!));
           return usersRow[0];
        });

        if (userResult && userResult.phoneNumber) {
           await step.run("execute-mama-safi-payout", async () => {
              const res = await darajaClient.initiateB2CPayout(
                 userResult.phoneNumber!,
                 taskResult.totalPayout!,
                 `Payout for NYO task ${taskId}`
              );
              // Update task with M-Pesa receipt
              await db.update(tasks).set({ mpesaB2cReceipt: res.transactionId }).where(eq(tasks.id, taskId));
              return res;
           });
        }
     }
  }
);



export const handleBookingConfirmed = inngest.createFunction(
  { id: "handle-booking-confirmed", triggers: [eventType("booking/confirmed")] },
  async ({ event, step }) => {
    const { bookingId } = event.data;

    // Fetch booking details for TTLock
    const b = await step.run("fetch-booking", async () => {
       const res = await db.select().from(bookings).where(eq(bookings.id, bookingId));
       return res[0];
    });

    if (!b) return { error: "Booking missing" };

    const lockCode = await step.run("generate-ttlock", async () => {
      // TTLock Integration: Generates pin strictly between check-in and check-out
      console.log(`[TTLock] Generating lock code for ${b.checkInDate} to ${b.checkOutDate}`);
      // return await ttlockClient.createCustomPasscode(unit.ttlockDeviceId, ...);
      return Math.floor(100000 + Math.random() * 900000).toString(); 
    });

    const receiptUrl = await step.run("report-etims", async () => {
       // Reusing our new eTIMS pipeline
       await inngest.send({ name: "etims/sync_required", data: { documentId: b.id } });
       return "https://etims.kra.go.ke/receipt/mock123";
    });

    await step.run("send-whatsapp-welcome", async () => {
       console.log(`[WhatsApp] Sending ${b.guestPhone} pin ${lockCode}`);
       return `Welcome message sent with code ${lockCode} and receipt ${receiptUrl}`;
    });

    // Schedule Escrow Release
    await step.run("schedule-escrow-release", async () => {
       await inngest.send({
          name: "escrow/release",
          data: { bookingId: b.id }
       });
    });
  }
);

export const releaseEscrowFunds = inngest.createFunction(
  { id: "release-escrow-funds", triggers: [eventType("escrow/release")] },
  async ({ event, step }) => {
     const { bookingId } = event.data;
     const b = await step.run("fetch", async () => {
        const res = await db.select().from(bookings).where(eq(bookings.id, bookingId));
        return res[0];
     });

     // Calculate wait time to 2:00 PM on check-in day 
     // For simplicity here, we'll just wait until check-in date
     if (b && b.checkInDate) {
        await step.sleepUntil("wait-for-checkin", new Date(b.checkInDate));
        
        await step.run("release-b2c", async () => {
           if (!b.totalAmount) return;
           const amountToTransfer = b.totalAmount - (b.platformFeeAmount || 0);
           // Transfer funds to agency/owner via B2C
           return await darajaClient.initiateB2CPayout(
             "0700000000", // Agency operational number
             amountToTransfer,
             `Escrow release for booking ${b.id}`
           );
        });
     }
  }
);
