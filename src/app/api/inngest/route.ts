import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { syncAirbnbCalendar, checkKPLCTokens, handleBookingConfirmed } from "@/inngest/functions";

// Create an API that serves zero-dependency npx inngest-cli envs
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncAirbnbCalendar,
    checkKPLCTokens,
    handleBookingConfirmed,
  ],
});
