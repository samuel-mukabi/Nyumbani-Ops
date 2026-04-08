"use server";

import { db } from "@/db";
import {
  auditLogs,
  bookings,
  complianceExpenses,
  complianceMonthClosures,
  etimsDocuments,
  properties,
  units,
  users,
} from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { issueEtimsInvoice } from "@/lib/integrations/etims/client";

function monthRange(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12) {
    throw new Error("Invalid month format. Expected YYYY-MM.");
  }
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return { start, end };
}

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

  return { userId: dbUser.id, orgId: dbUser.organizationId };
}

async function isMonthClosed(orgId: number, monthKey: string) {
  try {
    const closure = await db.query.complianceMonthClosures.findFirst({
      where: and(
        eq(complianceMonthClosures.organizationId, orgId),
        eq(complianceMonthClosures.monthKey, monthKey),
        eq(complianceMonthClosures.status, "closed")
      ),
    });
    return Boolean(closure);
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "42P01") return false;
    throw error;
  }
}

async function issueEtimsForExpense(input: {
  expenseId: number;
  orgId: number;
  userId: number;
}) {
  const expense = await db.query.complianceExpenses.findFirst({
    where: and(
      eq(complianceExpenses.id, input.expenseId),
      eq(complianceExpenses.organizationId, input.orgId)
    ),
  });
  if (!expense) return;

  const invoiceNumber = `EXP-${expense.id}`;
  const invoiceDate =
    typeof expense.expenseDate === "string"
      ? expense.expenseDate
      : new Date(expense.expenseDate).toISOString().slice(0, 10);
  const payload = {
    customerName: expense.vendorName || "Operational Expense",
    invoiceNumber,
    invoiceDate,
    amount: expense.amount,
    currency: expense.currency || "KES",
    description: expense.notes || expense.category,
  };

  const issueResult = await issueEtimsInvoice(payload);
  const status = issueResult.status;

  const [document] = await db
    .insert(etimsDocuments)
    .values({
      organizationId: input.orgId,
      expenseId: expense.id,
      documentType: "expense_invoice",
      status,
      externalDocumentId: issueResult.externalDocumentId || null,
      receiptNumber: issueResult.receiptNumber || null,
      receiptUrl: issueResult.receiptUrl || null,
      payload,
      responsePayload: issueResult.raw || null,
      errorMessage: issueResult.errorMessage || null,
      createdByUserId: input.userId,
      issuedAt: status === "issued" ? new Date() : null,
    })
    .returning({ id: etimsDocuments.id });

  await db
    .update(complianceExpenses)
    .set({
      etimsReceiptNumber: issueResult.receiptNumber || expense.etimsReceiptNumber || null,
      etimsReceiptUrl: issueResult.receiptUrl || expense.etimsReceiptUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(complianceExpenses.id, expense.id));

  await db.insert(auditLogs).values({
    organizationId: input.orgId,
    actorUserId: input.userId,
    action: status === "issued" ? "etims_receipt_issued" : "etims_receipt_pending_manual",
    entityType: "etims_document",
    entityId: String(document.id),
    metadata: {
      expenseId: expense.id,
      receiptNumber: issueResult.receiptNumber || null,
      errorMessage: issueResult.errorMessage || null,
    },
  });
}

export async function createComplianceExpenseAction(formData: FormData) {
  const { orgId, userId } = await getAuthContext();

  const monthKey = String(formData.get("monthKey") || "").trim();
  const propertyIdRaw = String(formData.get("propertyId") || "").trim();
  const unitIdRaw = String(formData.get("unitId") || "").trim();
  const expenseDate = String(formData.get("expenseDate") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const amount = Number(formData.get("amount"));
  const vendorName = String(formData.get("vendorName") || "").trim();
  const etimsReceiptNumber = String(formData.get("etimsReceiptNumber") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!monthKey || !expenseDate || !category || !Number.isFinite(amount) || amount <= 0) {
    throw new Error("Missing required compliance expense fields.");
  }
  if (await isMonthClosed(orgId, monthKey)) {
    throw new Error(`Month ${monthKey} is closed. Reopen is required before edits.`);
  }

  const propertyId = propertyIdRaw ? Number(propertyIdRaw) : null;
  const unitId = unitIdRaw ? Number(unitIdRaw) : null;
  if (propertyIdRaw && Number.isNaN(propertyId)) {
    throw new Error("Invalid property filter.");
  }
  if (unitIdRaw && Number.isNaN(unitId)) {
    throw new Error("Invalid unit filter.");
  }

  const [createdExpense] = await db.insert(complianceExpenses).values({
    organizationId: orgId,
    propertyId,
    unitId,
    expenseDate,
    category,
    amount: Math.round(amount),
    vendorName: vendorName || null,
    etimsReceiptNumber: etimsReceiptNumber || null,
    notes: notes || null,
    createdByUserId: userId,
  }).returning({ id: complianceExpenses.id });

  await db.insert(auditLogs).values({
    organizationId: orgId,
    actorUserId: userId,
    action: "compliance_expense_created",
    entityType: "compliance_expense",
    metadata: { monthKey, category, amount: Math.round(amount) },
  });

  await issueEtimsForExpense({
    expenseId: createdExpense.id,
    orgId,
    userId,
  });

  revalidatePath(`/compliance?month=${monthKey}`);
}

export async function retryEtimsExpenseIssueAction(formData: FormData) {
  const { orgId, userId } = await getAuthContext();
  const expenseId = Number(formData.get("expenseId"));
  if (!expenseId || Number.isNaN(expenseId)) {
    throw new Error("Invalid expense id.");
  }
  await issueEtimsForExpense({ expenseId, orgId, userId });
  revalidatePath("/compliance");
}

export async function closeComplianceMonthAction(formData: FormData) {
  const { orgId, userId } = await getAuthContext();
  const monthKey = String(formData.get("monthKey") || "").trim();
  if (!monthKey) throw new Error("Month is required.");
  const { start, end } = monthRange(monthKey);

  const [bookingTotals] = await db
    .select({
      bookingRevenueTotal: sql<number>`coalesce(sum(${bookings.totalAmount}), 0)::int`,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.organizationId, orgId),
        gte(bookings.checkInDate, start),
        lt(bookings.checkInDate, end)
      )
    );

  const [expenseTotals] = await db
    .select({
      expenseTotal: sql<number>`coalesce(sum(${complianceExpenses.amount}), 0)::int`,
    })
    .from(complianceExpenses)
    .where(
      and(
        eq(complianceExpenses.organizationId, orgId),
        gte(complianceExpenses.expenseDate, start.toISOString().slice(0, 10)),
        lt(complianceExpenses.expenseDate, end.toISOString().slice(0, 10))
      )
    );

  const bookingRevenueTotal = bookingTotals?.bookingRevenueTotal ?? 0;
  const tourismLevyTotal = Math.round(bookingRevenueTotal * 0.02);
  const expenseTotal = expenseTotals?.expenseTotal ?? 0;

  const existingClosure = await db.query.complianceMonthClosures.findFirst({
    where: and(
      eq(complianceMonthClosures.organizationId, orgId),
      eq(complianceMonthClosures.monthKey, monthKey)
    ),
  });

  if (existingClosure) {
    await db
      .update(complianceMonthClosures)
      .set({
        status: "closed",
        tourismLevyTotal,
        bookingRevenueTotal,
        expenseTotal,
        closedByUserId: userId,
        closedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(complianceMonthClosures.id, existingClosure.id));
  } else {
    await db.insert(complianceMonthClosures).values({
      organizationId: orgId,
      monthKey,
      status: "closed",
      tourismLevyTotal,
      bookingRevenueTotal,
      expenseTotal,
      closedByUserId: userId,
      closedAt: new Date(),
    });
  }

  await db.insert(auditLogs).values({
    organizationId: orgId,
    actorUserId: userId,
    action: "compliance_month_closed",
    entityType: "compliance_month",
    entityId: monthKey,
    metadata: { tourismLevyTotal, bookingRevenueTotal, expenseTotal },
  });

  revalidatePath(`/compliance?month=${monthKey}`);
}

export async function getComplianceSummaryAction(monthKey: string) {
  return getComplianceSummaryWithFiltersAction({ monthKey });
}

export async function getComplianceSummaryWithFiltersAction(input: {
  monthKey: string;
  propertyId?: number | null;
  unitId?: number | null;
}) {
  const { orgId } = await getAuthContext();
  const { start, end } = monthRange(input.monthKey);
  const propertyId = input.propertyId ?? null;
  const unitId = input.unitId ?? null;

  const bookingWhere = [
    eq(bookings.organizationId, orgId),
    gte(bookings.checkInDate, start),
    lt(bookings.checkInDate, end),
  ];
  if (propertyId) bookingWhere.push(eq(bookings.propertyId, propertyId));
  if (unitId) bookingWhere.push(eq(bookings.unitId, unitId));

  const [bookingTotals] = await db
    .select({
      bookingRevenueTotal: sql<number>`coalesce(sum(${bookings.totalAmount}), 0)::int`,
      bookingCount: sql<number>`count(*)::int`,
    })
    .from(bookings)
    .where(and(...bookingWhere));

  const expenseWhere = [
    eq(complianceExpenses.organizationId, orgId),
    gte(complianceExpenses.expenseDate, start.toISOString().slice(0, 10)),
    lt(complianceExpenses.expenseDate, end.toISOString().slice(0, 10)),
  ];
  if (propertyId) expenseWhere.push(eq(complianceExpenses.propertyId, propertyId));
  if (unitId) expenseWhere.push(eq(complianceExpenses.unitId, unitId));

  let expenseTotals:
    | {
        expenseTotal: number;
        expenseCount: number;
        missingEtimsCount: number;
      }
    | undefined;
  let closure:
    | {
        status: string;
        closedAt: Date | null;
      }
    | null = null;
  let recentAuditLogs: Awaited<ReturnType<typeof db.query.auditLogs.findMany>> = [];

  try {
    [expenseTotals] = await db
      .select({
        expenseTotal: sql<number>`coalesce(sum(${complianceExpenses.amount}), 0)::int`,
        expenseCount: sql<number>`count(*)::int`,
        missingEtimsCount:
          sql<number>`coalesce(sum(case when ${complianceExpenses.etimsReceiptNumber} is null or ${complianceExpenses.etimsReceiptNumber} = '' then 1 else 0 end), 0)::int`,
      })
      .from(complianceExpenses)
      .where(and(...expenseWhere));

    closure = (await db.query.complianceMonthClosures.findFirst({
      where: and(
        eq(complianceMonthClosures.organizationId, orgId),
        eq(complianceMonthClosures.monthKey, input.monthKey)
      ),
      columns: {
        status: true,
        closedAt: true,
      },
    })) ?? null;

    recentAuditLogs = await db.query.auditLogs.findMany({
      where: and(eq(auditLogs.organizationId, orgId)),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 15,
    });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code !== "42P01") {
      throw error;
    }
  }

  const bookingRevenueTotal = bookingTotals?.bookingRevenueTotal ?? 0;
  const tourismLevyTotal = Math.round(bookingRevenueTotal * 0.02);

  return {
    monthKey: input.monthKey,
    status: closure?.status ?? "open",
    closedAt: closure?.closedAt ?? null,
    bookingRevenueTotal,
    bookingCount: bookingTotals?.bookingCount ?? 0,
    tourismLevyTotal,
    expenseTotal: expenseTotals?.expenseTotal ?? 0,
    expenseCount: expenseTotals?.expenseCount ?? 0,
    missingEtimsCount: expenseTotals?.missingEtimsCount ?? 0,
    recentAuditLogs,
  };
}

export async function getComplianceFilterOptionsAction() {
  const { orgId } = await getAuthContext();
  const propertyRows = await db.query.properties.findMany({
    where: eq(properties.organizationId, orgId),
    orderBy: (table, { asc }) => [asc(table.name)],
  });

  let unitRows: Awaited<ReturnType<typeof db.query.units.findMany>> = [];
  try {
    unitRows = await db.query.units.findMany({
      where: eq(units.organizationId, orgId),
      orderBy: (table, { asc }) => [asc(table.unitCode)],
    });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code !== "42P01") {
      throw error;
    }
  }

  return {
    properties: propertyRows.map((p) => ({ id: p.id, name: p.name })),
    units: unitRows.map((u) => ({
      id: u.id,
      unitCode: u.unitCode,
      unitName: u.name,
    })),
  };
}

export async function getComplianceExpensesAction(input: {
  monthKey: string;
  propertyId?: number | null;
  unitId?: number | null;
}) {
  const { orgId } = await getAuthContext();
  const { start, end } = monthRange(input.monthKey);
  const propertyId = input.propertyId ?? null;
  const unitId = input.unitId ?? null;

  const whereClauses = [
    eq(complianceExpenses.organizationId, orgId),
    gte(complianceExpenses.expenseDate, start.toISOString().slice(0, 10)),
    lt(complianceExpenses.expenseDate, end.toISOString().slice(0, 10)),
  ];
  if (propertyId) whereClauses.push(eq(complianceExpenses.propertyId, propertyId));
  if (unitId) whereClauses.push(eq(complianceExpenses.unitId, unitId));

  let expenses: Awaited<ReturnType<typeof db.query.complianceExpenses.findMany>> = [];
  let documents: Awaited<ReturnType<typeof db.query.etimsDocuments.findMany>> = [];

  try {
    expenses = await db.query.complianceExpenses.findMany({
      where: and(...whereClauses),
      orderBy: (table, { desc }) => [desc(table.expenseDate), desc(table.id)],
      limit: 50,
    });
    const expenseIds = expenses.map((expense) => expense.id);
    documents =
      expenseIds.length > 0
        ? await db.query.etimsDocuments.findMany({
            where: and(
              eq(etimsDocuments.organizationId, orgId),
              inArray(etimsDocuments.expenseId, expenseIds)
            ),
            orderBy: (table, { desc }) => [desc(table.createdAt)],
          })
        : [];
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code !== "42P01") {
      throw error;
    }
  }

  const docByExpense = new Map<number, (typeof documents)[number]>();
  for (const doc of documents) {
    if (!doc.expenseId) continue;
    if (!docByExpense.has(doc.expenseId)) {
      docByExpense.set(doc.expenseId, doc);
    }
  }

  return expenses.map((expense) => {
    const doc = docByExpense.get(expense.id);
    return {
      id: expense.id,
      expenseDate: expense.expenseDate,
      category: expense.category,
      amount: expense.amount,
      vendorName: expense.vendorName,
      etimsReceiptNumber: expense.etimsReceiptNumber,
      etimsReceiptUrl: expense.etimsReceiptUrl,
      etimsStatus: doc?.status ?? "pending",
      etimsError: doc?.errorMessage ?? null,
      etimsIssuedAt: doc?.issuedAt ?? null,
    };
  });
}
