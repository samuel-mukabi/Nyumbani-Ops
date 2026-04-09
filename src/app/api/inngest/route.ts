import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getInngestHandlers() {
  const [{ serve }, { inngest }, functionsModule, etimsFunctionsModule] = await Promise.all([
    import("inngest/next"),
    import("@/inngest/client"),
    import("@/inngest/functions"),
    import("@/inngest/etims-functions"),
  ]);

  return serve({
    client: inngest,
    functions: [
      functionsModule.syncAirbnbCalendar,
      functionsModule.checkKPLCTokens,
      functionsModule.handleBookingConfirmed,
      functionsModule.releaseEscrowFunds,
      functionsModule.processVerifiedTask,
      etimsFunctionsModule.syncEtimsReceipt,
    ],
  });
}

export async function GET(request: NextRequest, context: unknown) {
  const handler = await getInngestHandlers();
  return handler.GET(request, context);
}

export async function POST(request: NextRequest, context: unknown) {
  const handler = await getInngestHandlers();
  return handler.POST(request, context);
}

export async function PUT(request: NextRequest, context: unknown) {
  const handler = await getInngestHandlers();
  return handler.PUT(request, context);
}
