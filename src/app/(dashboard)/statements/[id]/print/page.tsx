import { notFound } from "next/navigation";
import { getStatementDetailAction } from "@/lib/actions/owners";

function formatKes(value: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default async function StatementPrintPage({
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
  const deductions =
    header.platformFees +
    header.cleaningFees +
    header.maintenanceCosts +
    header.utilityCosts +
    header.transactionFees +
    header.agencyCommission;

  return (
    <div className="mx-auto max-w-5xl space-y-6 bg-white p-8 text-black print:p-0">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Monthly Owner Statement</h1>
          <p className="text-sm text-gray-600">
            {header.ownerName} • {new Date(header.statementMonth).toLocaleDateString("en-KE", { month: "long", year: "numeric" })}
          </p>
        </div>
        <p className="rounded border px-4 py-2 text-sm print:hidden">
          Use browser Print to save as PDF
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="rounded border p-3">
          <p className="text-gray-600">Gross Revenue</p>
          <p className="text-lg font-semibold">{formatKes(header.grossRevenue)}</p>
        </div>
        <div className="rounded border p-3">
          <p className="text-gray-600">Total Deductions</p>
          <p className="text-lg font-semibold">{formatKes(deductions)}</p>
        </div>
        <div className="rounded border p-3">
          <p className="text-gray-600">Net Owner Payout</p>
          <p className="text-lg font-semibold">{formatKes(header.netOwnerPayout)}</p>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-y bg-gray-50">
            <th className="px-2 py-2 text-left">Date</th>
            <th className="px-2 py-2 text-left">Type</th>
            <th className="px-2 py-2 text-left">Unit</th>
            <th className="px-2 py-2 text-left">Description</th>
            <th className="px-2 py-2 text-left">Reference</th>
            <th className="px-2 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id} className="border-b">
              <td className="px-2 py-2">{line.occurredAt ? new Date(line.occurredAt).toLocaleDateString("en-KE") : "-"}</td>
              <td className="px-2 py-2">{line.lineType}</td>
              <td className="px-2 py-2">{line.unitName ? `${line.unitName}${line.unitCode ? ` (${line.unitCode})` : ""}` : "-"}</td>
              <td className="px-2 py-2">{line.description || "-"}</td>
              <td className="px-2 py-2">
                {line.bookingId ? `Booking #${line.bookingId}` : line.referenceType && line.referenceId ? `${line.referenceType} #${line.referenceId}` : "-"}
              </td>
              <td className="px-2 py-2 text-right">{formatKes(line.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
