import { getStatementsFeedAction } from "@/lib/actions/owners";
import Link from "next/link";

function formatKes(value: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default async function StatementsPage() {
  const statements = await getStatementsFeedAction();

  return (
    <div className="space-y-10">
      <section className="space-y-3 border-b border-outline-variant/20 pb-8">
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
          Owner <span className="text-primary italic font-serif">Statements.</span>
        </h1>
        <p className="text-on-surface-variant">
          Auditable month-end summary of revenue, deductions, and net owner payouts.
        </p>
      </section>

      <div className="overflow-x-auto border-y border-outline-variant/20">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left">Month</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Gross Revenue</th>
              <th className="px-4 py-3 text-left">Net Payout</th>
              <th className="px-4 py-3 text-left">Generated</th>
            </tr>
          </thead>
          <tbody>
            {statements.map((row) => (
              <tr key={row.id} className="border-t border-outline-variant/15">
                <td className="px-4 py-3">
                  <Link href={`/statements/${row.id}`} className="font-medium text-primary hover:underline">
                    {new Date(row.statementMonth).toLocaleDateString("en-KE", { month: "short", year: "numeric" })}
                  </Link>
                </td>
                <td className="px-4 py-3">{row.ownerName}</td>
                <td className="px-4 py-3 uppercase text-xs tracking-widest">{row.status}</td>
                <td className="px-4 py-3">{formatKes(row.grossRevenue)}</td>
                <td className="px-4 py-3 font-medium">{formatKes(row.netOwnerPayout)}</td>
                <td className="px-4 py-3 text-on-surface-variant">
                  {row.generatedAt ? new Date(row.generatedAt).toLocaleString("en-KE") : "—"}
                </td>
              </tr>
            ))}
            {statements.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-on-surface-variant">
                  No statements yet. Generate one from the Owners page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
