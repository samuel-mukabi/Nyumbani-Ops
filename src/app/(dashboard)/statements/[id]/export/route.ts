import { db } from "@/db";
import { bookings, ownerStatementLines, ownerStatements, owners, units, users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

function csvEscape(value: unknown) {
  const raw = value == null ? "" : String(value);
  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });

  if (!dbUser?.organizationId) {
    return NextResponse.json({ error: "No organization" }, { status: 403 });
  }

  const { id } = await context.params;
  const statementId = Number(id);
  if (!Number.isFinite(statementId)) {
    return NextResponse.json({ error: "Invalid statement id" }, { status: 400 });
  }

  const [header] = await db
    .select({
      statementId: ownerStatements.id,
      statementMonth: ownerStatements.statementMonth,
      ownerName: owners.fullName,
      status: ownerStatements.status,
      grossRevenue: ownerStatements.grossRevenue,
      netOwnerPayout: ownerStatements.netOwnerPayout,
    })
    .from(ownerStatements)
    .innerJoin(owners, eq(ownerStatements.ownerId, owners.id))
    .where(and(eq(ownerStatements.id, statementId), eq(ownerStatements.organizationId, dbUser.organizationId)))
    .limit(1);

  if (!header) {
    return NextResponse.json({ error: "Statement not found" }, { status: 404 });
  }

  const lines = await db
    .select({
      date: ownerStatementLines.occurredAt,
      lineType: ownerStatementLines.lineType,
      unitName: units.name,
      unitCode: units.unitCode,
      description: ownerStatementLines.description,
      bookingId: ownerStatementLines.bookingId,
      bookingGuest: bookings.guestName,
      referenceType: ownerStatementLines.referenceType,
      referenceId: ownerStatementLines.referenceId,
      amount: ownerStatementLines.amount,
    })
    .from(ownerStatementLines)
    .leftJoin(units, eq(ownerStatementLines.unitId, units.id))
    .leftJoin(bookings, eq(ownerStatementLines.bookingId, bookings.id))
    .where(
      and(
        eq(ownerStatementLines.statementId, statementId),
        eq(ownerStatementLines.organizationId, dbUser.organizationId)
      )
    );

  const headerRows = [
    ["statement_id", header.statementId],
    ["statement_month", header.statementMonth],
    ["owner_name", header.ownerName],
    ["status", header.status],
    ["gross_revenue", header.grossRevenue],
    ["net_owner_payout", header.netOwnerPayout],
  ];

  const csvLines: string[] = [];
  csvLines.push("section,key,value");
  headerRows.forEach(([key, value]) => {
    csvLines.push(["summary", csvEscape(key), csvEscape(value)].join(","));
  });
  csvLines.push("");
  csvLines.push(
    [
      "date",
      "line_type",
      "unit",
      "description",
      "booking_id",
      "booking_guest",
      "reference_type",
      "reference_id",
      "amount",
    ].join(",")
  );

  lines.forEach((line) => {
    const unitLabel = line.unitName
      ? `${line.unitName}${line.unitCode ? ` (${line.unitCode})` : ""}`
      : "";
    csvLines.push(
      [
        csvEscape(line.date ? new Date(line.date).toISOString() : ""),
        csvEscape(line.lineType),
        csvEscape(unitLabel),
        csvEscape(line.description ?? ""),
        csvEscape(line.bookingId ?? ""),
        csvEscape(line.bookingGuest ?? ""),
        csvEscape(line.referenceType ?? ""),
        csvEscape(line.referenceId ?? ""),
        csvEscape(line.amount),
      ].join(",")
    );
  });

  const filename = `owner-statement-${header.statementId}.csv`;
  return new NextResponse(csvLines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
