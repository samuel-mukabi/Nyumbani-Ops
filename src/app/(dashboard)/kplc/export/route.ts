import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getKplcHistory } from "@/lib/kplc/sync";

function csvEscape(value: unknown) {
  const raw = value == null ? "" : String(value);
  return `"${raw.replace(/"/g, '""')}"`;
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
  const criticalOnly = url.searchParams.get("critical") === "1";
  const rows = await getKplcHistory(dbUser.organizationId, criticalOnly);

  const csv: string[] = [];
  csv.push("unit_code,unit_name,meter_number,token_balance,status,source,checked_at");
  for (const row of rows) {
    csv.push(
      [
        csvEscape(row.unitCode),
        csvEscape(row.unitName),
        csvEscape(row.meterNumber),
        csvEscape(row.tokenBalance.toFixed(2)),
        csvEscape(row.status),
        csvEscape(row.source),
        csvEscape(row.createdAt ? new Date(row.createdAt).toISOString() : ""),
      ].join(",")
    );
  }

  return new NextResponse(csv.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kplc-readings${criticalOnly ? "-critical" : ""}.csv"`,
    },
  });
}
