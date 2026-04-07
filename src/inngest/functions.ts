import { inngest } from "./client";
import { cron, eventType } from "inngest";

export const syncAirbnbCalendar = inngest.createFunction(
  { id: "sync-airbnb-calendar", triggers: [cron("*/15 * * * *")] },
  async ({ step }) => {
    await step.run("fetch-ical", async () => {
      // Mock logic: Syncing airbnb calendar
      return "Successfully synced calendars";
    });
  }
);

export const checkKPLCTokens = inngest.createFunction(
  { id: "check-kplc-tokens", triggers: [cron("0 */4 * * *")] },
  async ({ step }) => {
    await step.run("query-kplc-balances", async () => {
      // Mock logic: Checking KPLC tokens
      return "Tokens checked. All units above 20 tokens.";
    });
  }
);

export const handleBookingConfirmed = inngest.createFunction(
  { id: "handle-booking-confirmed", triggers: [eventType("booking/confirmed")] },
  async ({ event, step }) => {
    const lockCode = await step.run("generate-ttlock", async () => {
      return "123456";
    });

    const receiptUrl = await step.run("report-etims", async () => {
       return "https://etims.kra.go.ke/receipt/mock123";
    });

    await step.run("send-whatsapp-welcome", async () => {
       return `Welcome message sent with code ${lockCode} and receipt ${receiptUrl}`;
    });
  }
);
