import { NextResponse } from "next/server";
import { and, eq, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { bookings, users } from "@/db/schema";
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
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
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
    eq(bookings.organizationId, dbUser.organizationId),
    gte(bookings.checkInDate, start),
    lt(bookings.checkInDate, end),
  ];
  if (propertyId) where.push(eq(bookings.propertyId, propertyId));
  if (unitId) where.push(eq(bookings.unitId, unitId));

  const rows = await db.query.bookings.findMany({
    where: and(...where),
    orderBy: (table, { asc }) => [asc(table.checkInDate)],
  });

  const csv: string[] = [];
  csv.push("month,booking_id,check_in_date,check_out_date,guest_name,total_amount,tourism_levy_2_percent,currency,status,source");
  for (const booking of rows) {
    const total = booking.totalAmount ?? 0;
    const levy = Math.round(total * 0.02);
    csv.push(
      [
        csvEscape(month),
        csvEscape(booking.id),
        csvEscape(booking.checkInDate ? new Date(booking.checkInDate).toISOString() : ""),
        csvEscape(booking.checkOutDate ? new Date(booking.checkOutDate).toISOString() : ""),
        csvEscape(booking.guestName),
        csvEscape(total),
        csvEscape(levy),
        csvEscape(booking.currency ?? "KES"),
        csvEscape(booking.status),
        csvEscape(booking.source),
      ].join(",")
    );
  }

  return new NextResponse(csv.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tourism-levy-${month}.csv"`,
    },
  });
}
