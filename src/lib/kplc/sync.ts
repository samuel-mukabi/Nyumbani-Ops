import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { kplcMeterReadings, units } from "@/db/schema";
import { fetchKplcMeterBalance } from "@/lib/integrations/kplc/client";

function balanceStatus(balance: number) {
  if (balance <= 10) return "critical";
  if (balance <= 20) return "low";
  return "healthy";
}

export async function syncKplcForOrganization(orgId: number) {
  const orgUnits = await db.query.units.findMany({
    where: and(eq(units.organizationId, orgId)),
    orderBy: (table, { asc }) => [asc(table.unitCode)],
  });

  const withMeters = orgUnits.filter((unit) => unit.kplcMeterNo && unit.kplcMeterNo.trim().length > 0);
  let synced = 0;
  let failures = 0;

  for (const unit of withMeters) {
    const meterNumber = unit.kplcMeterNo!;
    try {
      const result = await fetchKplcMeterBalance(meterNumber);
      await db.insert(kplcMeterReadings).values({
        organizationId: orgId,
        unitId: unit.id,
        meterNumber,
        tokenBalance: String(result.balance),
        balanceUnit: result.unit,
        status: balanceStatus(result.balance),
        source: result.source,
        rawPayload: result.raw,
      });
      synced += 1;
    } catch {
      failures += 1;
    }
  }

  return {
    totalUnits: orgUnits.length,
    meteredUnits: withMeters.length,
    synced,
    failures,
  };
}

export async function getKplcOverview(orgId: number) {
  const orgUnits = await db.query.units.findMany({
    where: eq(units.organizationId, orgId),
    orderBy: (table, { asc }) => [asc(table.unitCode)],
  });
  const unitIds = orgUnits.map((unit) => unit.id);
  const readings =
    unitIds.length > 0
      ? await db.query.kplcMeterReadings.findMany({
          where: and(eq(kplcMeterReadings.organizationId, orgId), inArray(kplcMeterReadings.unitId, unitIds)),
          orderBy: (table, { desc }) => [desc(table.createdAt)],
          limit: 1000,
        })
      : [];

  const latestByUnit = new Map<number, (typeof readings)[number]>();
  for (const reading of readings) {
    if (!latestByUnit.has(reading.unitId)) {
      latestByUnit.set(reading.unitId, reading);
    }
  }

  const rows = orgUnits
    .filter((unit) => unit.kplcMeterNo && unit.kplcMeterNo.trim().length > 0)
    .map((unit) => {
      const reading = latestByUnit.get(unit.id);
      return {
        unitId: unit.id,
        unitName: unit.name,
        unitCode: unit.unitCode,
        meterNumber: unit.kplcMeterNo!,
        balance: reading ? Number(reading.tokenBalance) : null,
        status: reading?.status ?? "unknown",
        source: reading?.source ?? "none",
        lastCheckedAt: reading?.createdAt ?? null,
      };
    });

  const critical = rows.filter((row) => row.status === "critical").length;
  const low = rows.filter((row) => row.status === "low").length;
  const healthy = rows.filter((row) => row.status === "healthy").length;

  return {
    totalMeteredUnits: rows.length,
    critical,
    low,
    healthy,
    rows: rows.slice(0, 10),
  };
}

export async function getKplcHistory(orgId: number, criticalOnly = false) {
  const orgUnits = await db.query.units.findMany({
    where: eq(units.organizationId, orgId),
    orderBy: (table, { asc }) => [asc(table.unitCode)],
  });
  const unitById = new Map(orgUnits.map((unit) => [unit.id, unit]));
  const unitIds = orgUnits.map((unit) => unit.id);
  const readings =
    unitIds.length > 0
      ? await db.query.kplcMeterReadings.findMany({
          where: and(eq(kplcMeterReadings.organizationId, orgId), inArray(kplcMeterReadings.unitId, unitIds)),
          orderBy: (table, { desc }) => [desc(table.createdAt)],
          limit: 500,
        })
      : [];

  const rows = readings
    .map((reading) => {
      const unit = unitById.get(reading.unitId);
      return {
        id: reading.id,
        unitId: reading.unitId,
        unitCode: unit?.unitCode || "—",
        unitName: unit?.name || "Unknown Unit",
        meterNumber: reading.meterNumber,
        tokenBalance: Number(reading.tokenBalance),
        status: reading.status,
        source: reading.source,
        createdAt: reading.createdAt,
      };
    })
    .filter((row) => (criticalOnly ? row.status === "critical" : true));

  return rows;
}
