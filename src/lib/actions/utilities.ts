"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { and, eq, gte, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import {
  units,
  users,
  utilityDeviceBindings,
  utilityEnergyReadings,
  kplcMeterReadings,
  utilityProfiles,
} from "@/db/schema";

async function getAuthContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });

  if (!dbUser?.organizationId) redirect("/onboarding");
  return { orgId: dbUser.organizationId };
}

export async function upsertUtilityDeviceBindingAction(formData: FormData) {
  const { orgId } = await getAuthContext();
  const unitId = Number(formData.get("unitId"));
  const deviceType = String(formData.get("deviceType") || "shelly").trim();
  const deviceId = String(formData.get("deviceId") || "").trim();
  const isActive = formData.get("isActive") === "on";

  if (!unitId || Number.isNaN(unitId)) throw new Error("Invalid unit.");
  if (!deviceId) throw new Error("Device ID is required.");

  const existing = await db.query.utilityDeviceBindings.findFirst({
    where: and(eq(utilityDeviceBindings.organizationId, orgId), eq(utilityDeviceBindings.unitId, unitId)),
  });

  if (existing) {
    await db
      .update(utilityDeviceBindings)
      .set({
        deviceType,
        deviceId,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(utilityDeviceBindings.id, existing.id));
  } else {
    const ingestToken = crypto.randomBytes(24).toString("hex");
    await db.insert(utilityDeviceBindings).values({
      organizationId: orgId,
      unitId,
      deviceType,
      deviceId,
      ingestToken,
      isActive,
    });
  }

  revalidatePath("/kplc");
}

export async function rotateUtilityIngestTokenAction(formData: FormData) {
  const { orgId } = await getAuthContext();
  const unitId = Number(formData.get("unitId"));
  if (!unitId || Number.isNaN(unitId)) throw new Error("Invalid unit.");

  const binding = await db.query.utilityDeviceBindings.findFirst({
    where: and(eq(utilityDeviceBindings.organizationId, orgId), eq(utilityDeviceBindings.unitId, unitId)),
  });
  if (!binding) throw new Error("No device binding found.");

  const ingestToken = crypto.randomBytes(24).toString("hex");
  await db
    .update(utilityDeviceBindings)
    .set({ ingestToken, updatedAt: new Date() })
    .where(eq(utilityDeviceBindings.id, binding.id));

  revalidatePath("/kplc");
}

export async function getUtilityTelemetryAction() {
  const { orgId } = await getAuthContext();
  const unitRows = await db.query.units.findMany({
    where: eq(units.organizationId, orgId),
    orderBy: (table, { asc }) => [asc(table.unitCode)],
  });

  const bound = await db.query.utilityDeviceBindings.findMany({
    where: eq(utilityDeviceBindings.organizationId, orgId),
  });
  const profiles = await db.query.utilityProfiles.findMany({
    where: eq(utilityProfiles.organizationId, orgId),
  });

  const bindingByUnit = new Map(bound.map((b) => [b.unitId, b]));
  const profileByUnit = new Map(profiles.map((p) => [p.unitId, p]));

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const unitIds = unitRows.map((u) => u.id);
  const readings =
    unitIds.length > 0
      ? await db.query.utilityEnergyReadings.findMany({
          where: and(eq(utilityEnergyReadings.organizationId, orgId)),
          orderBy: (table, { desc }) => [table.capturedAt],
          limit: 2000,
        })
      : [];

  const readingsByUnit = new Map<number, typeof readings>();
  for (const r of readings) {
    const list = readingsByUnit.get(r.unitId) ?? [];
    list.push(r);
    readingsByUnit.set(r.unitId, list);
  }

  const kplcRows =
    unitIds.length > 0
      ? await db.query.kplcMeterReadings.findMany({
          where: and(eq(kplcMeterReadings.organizationId, orgId)),
          orderBy: (table, { desc }) => [desc(table.createdAt)],
          limit: 2000,
        })
      : [];
  const latestBalanceByUnit = new Map<number, number>();
  for (const r of kplcRows) {
    if (!latestBalanceByUnit.has(r.unitId)) {
      latestBalanceByUnit.set(r.unitId, Number(r.tokenBalance));
    }
  }

  return unitRows
    .filter((u) => u.kplcMeterNo && u.kplcMeterNo.trim().length > 0)
    .map((unit) => {
      const unitReadings = (readingsByUnit.get(unit.id) ?? []).slice().sort((a, b) => {
        const at = new Date(a.capturedAt).getTime();
        const bt = new Date(b.capturedAt).getTime();
        return at - bt;
      });

      const todayReadings = unitReadings.filter((r) => {
        const t = new Date(r.capturedAt).getTime();
        return t >= startOfDay.getTime() && t < endOfDay.getTime();
      });
      const todayKwh =
        todayReadings.length >= 2
          ? Number(todayReadings[todayReadings.length - 1].totalKwh) - Number(todayReadings[0].totalKwh)
          : 0;

      const last = unitReadings.length ? unitReadings[unitReadings.length - 1] : null;
      const balanceKwh = latestBalanceByUnit.get(unit.id) ?? null;

      // Simple burn rate: last 6h delta
      const sixHoursAgo = new Date(now);
      sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
      const recent = unitReadings.filter((r) => new Date(r.capturedAt) >= sixHoursAgo);
      const burnRateKwhPerHour =
        recent.length >= 2
          ? (Number(recent[recent.length - 1].totalKwh) - Number(recent[0].totalKwh)) / 6
          : null;
      const predictedHoursRemaining =
        balanceKwh != null && burnRateKwhPerHour != null && burnRateKwhPerHour > 0
          ? balanceKwh / burnRateKwhPerHour
          : null;

      const profile = profileByUnit.get(unit.id) ?? null;
      const binding = bindingByUnit.get(unit.id) ?? null;

      return {
        unitId: unit.id,
        unitCode: unit.unitCode,
        unitName: unit.name,
        meterNumber: unit.kplcMeterNo!,
        profile,
        binding,
        lastReadingAt: last?.capturedAt ?? null,
        lastPowerWatts: last?.powerWatts ? Number(last.powerWatts) : null,
        todayKwh: Number.isFinite(todayKwh) ? Number(todayKwh.toFixed(3)) : 0,
        balanceKwh,
        burnRateKwhPerHour: burnRateKwhPerHour != null ? Number(burnRateKwhPerHour.toFixed(3)) : null,
        predictedHoursRemaining:
          predictedHoursRemaining != null ? Number(predictedHoursRemaining.toFixed(1)) : null,
      };
    });
}

export async function generateUtilityTestReadingsAction(formData: FormData) {
  const { orgId } = await getAuthContext();
  const unitId = Number(formData.get("unitId"));
  if (!unitId || Number.isNaN(unitId)) throw new Error("Invalid unit.");

  const binding = await db.query.utilityDeviceBindings.findFirst({
    where: and(
      eq(utilityDeviceBindings.organizationId, orgId),
      eq(utilityDeviceBindings.unitId, unitId),
      eq(utilityDeviceBindings.isActive, true)
    ),
  });

  if (!binding) {
    throw new Error("Create an active device binding first.");
  }

  const last = await db.query.utilityEnergyReadings.findFirst({
    where: and(
      eq(utilityEnergyReadings.organizationId, orgId),
      eq(utilityEnergyReadings.unitId, unitId),
      eq(utilityEnergyReadings.deviceBindingId, binding.id)
    ),
    orderBy: (table, { desc }) => [desc(table.capturedAt)],
  });

  const baseTotal = last ? Number(last.totalKwh) : 1000;
  const now = new Date();
  const t1 = new Date(now);
  t1.setMinutes(t1.getMinutes() - 10);
  const t2 = new Date(now);
  t2.setMinutes(t2.getMinutes() - 5);

  const rows = [
    { capturedAt: t1, totalKwh: baseTotal + 0.02, powerWatts: 280 },
    { capturedAt: t2, totalKwh: baseTotal + 0.06, powerWatts: 420 },
    { capturedAt: now, totalKwh: baseTotal + 0.11, powerWatts: 510 },
  ];

  await db.insert(utilityEnergyReadings).values(
    rows.map((r) => ({
      organizationId: orgId,
      unitId,
      deviceBindingId: binding.id,
      capturedAt: r.capturedAt,
      powerWatts: String(r.powerWatts),
      totalKwh: String(r.totalKwh),
      rawPayload: {
        deviceId: binding.deviceId,
        totalKwh: r.totalKwh,
        powerWatts: r.powerWatts,
        capturedAt: r.capturedAt.toISOString(),
        generated: true,
      },
    }))
  );

  revalidatePath("/kplc");
}

