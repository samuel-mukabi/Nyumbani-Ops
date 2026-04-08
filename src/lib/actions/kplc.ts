"use server";

import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { units, users, utilityProfiles } from "@/db/schema";
import { getKplcHistory, getKplcOverview, syncKplcForOrganization } from "@/lib/kplc/sync";
import { revalidatePath } from "next/cache";

async function getAuthContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });
  if (!dbUser?.organizationId) {
    redirect("/onboarding");
  }
  return { orgId: dbUser.organizationId };
}

export async function syncKplcNowAction() {
  const { orgId } = await getAuthContext();
  await syncKplcForOrganization(orgId);
  revalidatePath("/dashboard");
  revalidatePath("/kplc");
}

export async function getKplcOverviewAction() {
  const { orgId } = await getAuthContext();
  return getKplcOverview(orgId);
}

export async function getKplcHistoryAction(criticalOnly = false) {
  const { orgId } = await getAuthContext();
  return getKplcHistory(orgId, criticalOnly);
}

export async function getUtilityProfilesAction() {
  const { orgId } = await getAuthContext();
  const [unitRows, profileRows] = await Promise.all([
    db.query.units.findMany({
      where: eq(units.organizationId, orgId),
      orderBy: (table, { asc }) => [asc(table.unitCode)],
    }),
    db.query.utilityProfiles.findMany({
      where: eq(utilityProfiles.organizationId, orgId),
    }),
  ]);

  const byUnit = new Map(profileRows.map((profile) => [profile.unitId, profile]));
  return unitRows
    .filter((unit) => unit.kplcMeterNo && unit.kplcMeterNo.trim().length > 0)
    .map((unit) => ({
      unitId: unit.id,
      unitCode: unit.unitCode,
      unitName: unit.name,
      meterNumber: unit.kplcMeterNo!,
      profile: byUnit.get(unit.id) || null,
    }));
}

export async function upsertUtilityProfileAction(formData: FormData) {
  const { orgId } = await getAuthContext();
  const unitId = Number(formData.get("unitId"));
  const provider = String(formData.get("provider") || "manual").trim();
  const minBalanceThreshold = Number(formData.get("minBalanceThreshold"));
  const dailyAllowanceKwhRaw = String(formData.get("dailyAllowanceKwh") || "").trim();
  const autoTopupEnabled = formData.get("autoTopupEnabled") === "on";
  const topupAmount = Number(formData.get("topupAmount"));
  const notificationPhone = String(formData.get("notificationPhone") || "").trim();

  if (!unitId || Number.isNaN(unitId)) {
    throw new Error("Invalid unit.");
  }
  if (!Number.isFinite(minBalanceThreshold) || minBalanceThreshold <= 0) {
    throw new Error("Invalid minimum balance threshold.");
  }
  if (!Number.isFinite(topupAmount) || topupAmount <= 0) {
    throw new Error("Invalid top-up amount.");
  }
  const dailyAllowanceKwh = dailyAllowanceKwhRaw ? Number(dailyAllowanceKwhRaw) : null;
  if (dailyAllowanceKwhRaw && (!Number.isFinite(dailyAllowanceKwh!) || dailyAllowanceKwh! <= 0)) {
    throw new Error("Invalid daily allowance.");
  }

  const existing = await db.query.utilityProfiles.findFirst({
    where: and(eq(utilityProfiles.organizationId, orgId), eq(utilityProfiles.unitId, unitId)),
  });

  if (existing) {
    await db
      .update(utilityProfiles)
      .set({
        provider,
        minBalanceThreshold: String(minBalanceThreshold),
        dailyAllowanceKwh: dailyAllowanceKwh ? String(dailyAllowanceKwh) : null,
        autoTopupEnabled,
        topupAmount: Math.round(topupAmount),
        notificationPhone: notificationPhone || null,
        updatedAt: new Date(),
      })
      .where(eq(utilityProfiles.id, existing.id));
  } else {
    await db.insert(utilityProfiles).values({
      organizationId: orgId,
      unitId,
      provider,
      minBalanceThreshold: String(minBalanceThreshold),
      dailyAllowanceKwh: dailyAllowanceKwh ? String(dailyAllowanceKwh) : null,
      autoTopupEnabled,
      topupAmount: Math.round(topupAmount),
      notificationPhone: notificationPhone || null,
    });
  }

  revalidatePath("/kplc");
}
