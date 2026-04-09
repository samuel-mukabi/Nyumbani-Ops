import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { utilityDeviceBindings, utilityEnergyReadings } from "@/db/schema";
import { extractIngestToken, parseCapturedAt } from "@/lib/utilities/iotIngest";

type IngestPayload = {
  deviceId?: string;
  totalKwh?: number;
  powerWatts?: number;
  capturedAt?: string;
};

export async function POST(request: Request) {
  const allowQueryToken = process.env.IOT_INGEST_ALLOW_QUERY_TOKEN === "true";
  const { token, source } = extractIngestToken(request, { allowQueryToken });

  if (!token) {
    return NextResponse.json({ error: "Missing token. Use Authorization: Bearer <token>." }, { status: 401 });
  }

  let body: IngestPayload;
  try {
    body = (await request.json()) as IngestPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const deviceId = String(body.deviceId || "").trim();
  const totalKwh = Number(body.totalKwh);
  const powerWatts = body.powerWatts == null ? null : Number(body.powerWatts);
  let capturedAt: Date;
  try {
    capturedAt = parseCapturedAt(body.capturedAt);
  } catch {
    return NextResponse.json({ error: "Invalid capturedAt" }, { status: 400 });
  }

  if (!deviceId) {
    return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });
  }
  if (!Number.isFinite(totalKwh) || totalKwh < 0) {
    return NextResponse.json({ error: "Invalid totalKwh" }, { status: 400 });
  }
  if (powerWatts != null && !Number.isFinite(powerWatts)) {
    return NextResponse.json({ error: "Invalid powerWatts" }, { status: 400 });
  }

  const binding = await db.query.utilityDeviceBindings.findFirst({
    where: and(eq(utilityDeviceBindings.deviceId, deviceId), eq(utilityDeviceBindings.ingestToken, token), eq(utilityDeviceBindings.isActive, true)),
  });

  if (!binding) {
    return NextResponse.json({ error: "Unauthorized token or device" }, { status: 401 });
  }

  await db.insert(utilityEnergyReadings).values({
    organizationId: binding.organizationId,
    unitId: binding.unitId,
    deviceBindingId: binding.id,
    capturedAt,
    powerWatts: powerWatts == null ? null : String(powerWatts),
    totalKwh: String(totalKwh),
    rawPayload: body,
  });

  const response = NextResponse.json({ ok: true });
  if (source === "query") {
    response.headers.set("x-ingest-auth-deprecation", "Query token auth is deprecated; use Authorization Bearer token.");
  }
  return response;
}

