"use server";

import { db } from "@/db";
import { bookings, buildings, ownerStatementLines, ownerStatements, owners, units, users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

  if (!dbUser || !dbUser.organizationId) {
    redirect("/onboarding");
  }

  return { orgId: dbUser.organizationId };
}

export async function getOwnersOverviewAction() {
  const { orgId } = await getAuthContext();

  const ownerRows = await db.query.owners.findMany({
    where: eq(owners.organizationId, orgId),
    orderBy: (table, { asc }) => [asc(table.fullName)],
  });

  const enriched = await Promise.all(
    ownerRows.map(async (owner) => {
      const [unitCountRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(units)
        .where(and(eq(units.organizationId, orgId), eq(units.ownerId, owner.id)));

      const latestStatement = await db.query.ownerStatements.findFirst({
        where: and(eq(ownerStatements.organizationId, orgId), eq(ownerStatements.ownerId, owner.id)),
        orderBy: (table, { desc }) => [desc(table.statementMonth)],
      });

      return {
        ...owner,
        unitCount: unitCountRow?.count ?? 0,
        latestStatement,
      };
    })
  );

  return enriched;
}

export async function getStatementsFeedAction() {
  const { orgId } = await getAuthContext();

  const rows = await db
    .select({
      id: ownerStatements.id,
      statementMonth: ownerStatements.statementMonth,
      ownerName: owners.fullName,
      status: ownerStatements.status,
      grossRevenue: ownerStatements.grossRevenue,
      netOwnerPayout: ownerStatements.netOwnerPayout,
      generatedAt: ownerStatements.generatedAt,
    })
    .from(ownerStatements)
    .innerJoin(owners, eq(ownerStatements.ownerId, owners.id))
    .where(eq(ownerStatements.organizationId, orgId))
    .orderBy(desc(ownerStatements.statementMonth), desc(ownerStatements.generatedAt))
    .limit(100);

  return rows;
}

export async function getStatementDetailAction(statementId: number) {
  const { orgId } = await getAuthContext();

  const header = await db
    .select({
      id: ownerStatements.id,
      statementMonth: ownerStatements.statementMonth,
      status: ownerStatements.status,
      ownerName: owners.fullName,
      ownerEmail: owners.email,
      grossRevenue: ownerStatements.grossRevenue,
      platformFees: ownerStatements.platformFees,
      cleaningFees: ownerStatements.cleaningFees,
      maintenanceCosts: ownerStatements.maintenanceCosts,
      utilityCosts: ownerStatements.utilityCosts,
      transactionFees: ownerStatements.transactionFees,
      agencyCommission: ownerStatements.agencyCommission,
      netOwnerPayout: ownerStatements.netOwnerPayout,
      generatedAt: ownerStatements.generatedAt,
    })
    .from(ownerStatements)
    .innerJoin(owners, eq(ownerStatements.ownerId, owners.id))
    .where(and(eq(ownerStatements.id, statementId), eq(ownerStatements.organizationId, orgId)))
    .limit(1);

  if (!header.length) {
    return null;
  }

  const lines = await db
    .select({
      id: ownerStatementLines.id,
      lineType: ownerStatementLines.lineType,
      description: ownerStatementLines.description,
      amount: ownerStatementLines.amount,
      occurredAt: ownerStatementLines.occurredAt,
      unitName: units.name,
      unitCode: units.unitCode,
      bookingGuest: bookings.guestName,
      bookingId: ownerStatementLines.bookingId,
      referenceType: ownerStatementLines.referenceType,
      referenceId: ownerStatementLines.referenceId,
    })
    .from(ownerStatementLines)
    .leftJoin(units, eq(ownerStatementLines.unitId, units.id))
    .leftJoin(bookings, eq(ownerStatementLines.bookingId, bookings.id))
    .where(and(eq(ownerStatementLines.statementId, statementId), eq(ownerStatementLines.organizationId, orgId)))
    .orderBy(desc(ownerStatementLines.occurredAt), desc(ownerStatementLines.id));

  return { header: header[0], lines };
}

export async function generateOwnerStatementAction(ownerId: number, statementMonth: string) {
  const { orgId } = await getAuthContext();

  await db.execute(
    sql`select public.generate_owner_statement(${orgId}, ${ownerId}, ${statementMonth}::date)`
  );

  revalidatePath("/owners");
  revalidatePath("/statements");
}

export async function createOwnerAction(formData: FormData) {
  const { orgId } = await getAuthContext();

  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const payoutPhone = String(formData.get("payoutPhone") || "").trim();

  if (!fullName) {
    throw new Error("Owner full name is required.");
  }

  await db.insert(owners).values({
    organizationId: orgId,
    fullName,
    email: email || null,
    phone: phone || null,
    payoutMethod: "mpesa",
    payoutDetails: payoutPhone ? { phone: payoutPhone } : null,
  });

  revalidatePath("/owners");
}

export async function createUnitAction(formData: FormData) {
  const { orgId } = await getAuthContext();

  const ownerId = Number(formData.get("ownerId"));
  const unitCode = String(formData.get("unitCode") || "").trim();
  const unitName = String(formData.get("unitName") || "").trim();
  const buildingName = String(formData.get("buildingName") || "").trim();
  const listingUrl = String(formData.get("listingUrl") || "").trim();
  const kplcMeterNo = String(formData.get("kplcMeterNo") || "").trim();

  if (!ownerId || !unitCode || !unitName || !buildingName) {
    throw new Error("Owner, unit code, unit name, and building are required.");
  }

  const existingBuilding = await db.query.buildings.findFirst({
    where: and(eq(buildings.organizationId, orgId), eq(buildings.name, buildingName)),
  });

  const buildingId =
    existingBuilding?.id ??
    (
      await db
        .insert(buildings)
        .values({
          organizationId: orgId,
          name: buildingName,
          slug: null,
        })
        .returning({ id: buildings.id })
    )[0].id;

  await db.insert(units).values({
    organizationId: orgId,
    buildingId,
    ownerId,
    unitCode,
    name: unitName,
    listingUrl: listingUrl || null,
    kplcMeterNo: kplcMeterNo || null,
    status: "active",
  });

  revalidatePath("/owners");
}
