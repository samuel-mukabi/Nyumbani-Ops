import { NextResponse } from "next/server";
import { and, eq, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { complianceExpenses, users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

function csvEscape(value: unknown) {
  const raw = value == null ? "" : String(value);
  return `"${raw.replace(/"/g, '""')}"`;
}

function monthRange(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12) {
    throw new Error("Invalid month format.");
  }
  const start = new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 10);
  const end = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
  return { start, end };
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });
  if (!dbUser?.organizationId) {
    return NextResponse.json({ error: "No organization" }, { status: 403 });
  }

  const url = new URL(request.url);
  const month = url.searchParams.get("month");
  const propertyIdRaw = url.searchParams.get("propertyId");
  const unitIdRaw = url.searchParams.get("unitId");
  if (!month) return NextResponse.json({ error: "Missing month" }, { status: 400 });
  const propertyId = propertyIdRaw ? Number(propertyIdRaw) : null;
  const unitId = unitIdRaw ? Number(unitIdRaw) : null;
  if (propertyIdRaw && Number.isNaN(propertyId)) {
    return NextResponse.json({ error: "Invalid propertyId" }, { status: 400 });
  }
  if (unitIdRaw && Number.isNaN(unitId)) {
    return NextResponse.json({ error: "Invalid unitId" }, { status: 400 });
  }
  const { start, end } = monthRange(month);
  const where = [
    eq(complianceExpenses.organizationId, dbUser.organizationId),
    gte(complianceExpenses.expenseDate, start),
    lt(complianceExpenses.expenseDate, end),
  ];
  if (propertyId) where.push(eq(complianceExpenses.propertyId, propertyId));
  if (unitId) where.push(eq(complianceExpenses.unitId, unitId));

  const rows = await db.query.complianceExpenses.findMany({
    where: and(...where),
    orderBy: (table, { asc }) => [asc(table.expenseDate)],
  });

  const csv: string[] = [];
  csv.push("month,expense_id,expense_date,category,amount,currency,vendor_name,etims_receipt_number,etims_receipt_url,notes");
  for (const row of rows) {
    csv.push(
      [
        csvEscape(month),
        csvEscape(row.id),
        csvEscape(row.expenseDate),
        csvEscape(row.category),
        csvEscape(row.amount),
        csvEscape(row.currency),
        csvEscape(row.vendorName),
        csvEscape(row.etimsReceiptNumber),
        csvEscape(row.etimsReceiptUrl),
        csvEscape(row.notes),
      ].join(",")
    );
  }

  return new NextResponse(csv.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="etims-expenses-${month}.csv"`,
    },
  });
}
