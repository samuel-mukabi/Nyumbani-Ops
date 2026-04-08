import Link from "next/link";
import { notFound } from "next/navigation";
import { getStatementDetailAction } from "@/lib/actions/owners";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatKes(value: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default async function StatementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const statementId = Number(id);

  if (!Number.isFinite(statementId)) {
    notFound();
  }

  const statement = await getStatementDetailAction(statementId);

  if (!statement) {
    notFound();
  }

  const { header, lines } = statement;
  const statementMonthLabel = new Date(header.statementMonth).toLocaleDateString("en-KE", { month: "long", year: "numeric" });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "";
  const statementUrl = appUrl ? `${appUrl}/statements/${statementId}` : `/statements/${statementId}`;
  const emailSubject = encodeURIComponent(`Monthly Owner Statement - ${statementMonthLabel}`);
  const emailBody = encodeURIComponent(
    [
      `Hi ${header.ownerName},`,
      "",
      `Please find your owner statement for ${statementMonthLabel}.`,
      `Gross revenue: ${formatKes(header.grossRevenue)}`,
      `Net payout: ${formatKes(header.netOwnerPayout)}`,
      "",
      `View statement: ${statementUrl}`,
      `Download CSV: ${statementUrl}/export`,
      "",
      "Thank you.",
    ].join("\n")
  );
  const emailHref = `mailto:${header.ownerEmail || ""}?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/statements" className="text-sm text-primary hover:underline">
            Back to statements
          </Link>
          <div className="flex items-center gap-2">
            <Link href={emailHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Email Statement
            </Link>
            <Link href={`/statements/${statementId}/export`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Download CSV
            </Link>
            <Link
              href={`/statements/${statementId}/print`}
              target="_blank"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Print / Save PDF
            </Link>
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          {header.ownerName} - {statementMonthLabel}
        </h1>
        <p className="text-on-surface-variant">
          Detailed owner statement with line-item audit for revenue and deductions.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 rounded-2xl border border-outline-variant/20 p-6 md:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-on-surface-variant">Gross</p>
          <p className="text-xl font-semibold">{formatKes(header.grossRevenue)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-on-surface-variant">Deductions</p>
          <p className="text-xl font-semibold">
            {formatKes(
              header.platformFees +
                header.cleaningFees +
                header.maintenanceCosts +
                header.utilityCosts +
                header.transactionFees +
                header.agencyCommission
            )}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-on-surface-variant">Net Payout</p>
          <p className="text-xl font-semibold text-primary">{formatKes(header.netOwnerPayout)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-on-surface-variant">Status</p>
          <p className="text-xl font-semibold uppercase">{header.status}</p>
        </div>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-outline-variant/20">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Unit</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Reference</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id} className="border-t border-outline-variant/15">
                <td className="px-4 py-3 text-on-surface-variant">
                  {line.occurredAt ? new Date(line.occurredAt).toLocaleDateString("en-KE") : "-"}
                </td>
                <td className="px-4 py-3 uppercase text-xs tracking-widest">{line.lineType}</td>
                <td className="px-4 py-3">
                  {line.unitName ? `${line.unitName}${line.unitCode ? ` (${line.unitCode})` : ""}` : "-"}
                </td>
                <td className="px-4 py-3">{line.description || "-"}</td>
                <td className="px-4 py-3 text-on-surface-variant">
                  {line.bookingId ? `Booking #${line.bookingId}` : line.referenceType && line.referenceId ? `${line.referenceType} #${line.referenceId}` : "-"}
                  {line.bookingGuest ? ` - ${line.bookingGuest}` : ""}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${line.amount < 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {formatKes(line.amount)}
                </td>
              </tr>
            ))}
            {lines.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-on-surface-variant">
                  No line items found for this statement.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
