import { inngest } from "./client";

export const syncAirbnbCalendar = inngest.createFunction(
  { id: "sync-airbnb-calendar", cron: "*/15 * * * *" } as any,
  async ({ step }: { step: any }) => {
    await step.run("fetch-ical", async () => {
      // Mock logic: Syncing airbnb calendar
      return "Successfully synced calendars";
    });
  }
);

export const checkKPLCTokens = inngest.createFunction(
  { id: "check-kplc-tokens", cron: "0 */4 * * *" } as any,
  async ({ step }: { step: any }) => {
    await step.run("query-kplc-balances", async () => {
      // Mock logic: Checking KPLC tokens
      return "Tokens checked. All units above 20 tokens.";
    });
  }
);

export const handleBookingConfirmed = inngest.createFunction(
  { id: "handle-booking-confirmed", event: "booking/confirmed" } as any,
  async ({ event, step }: { event: any; step: any }) => {
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
