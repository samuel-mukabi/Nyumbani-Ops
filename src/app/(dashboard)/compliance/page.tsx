import Link from "next/link";
import {
  closeComplianceMonthAction,
  createComplianceExpenseAction,
  getComplianceFilterOptionsAction,
  getComplianceExpensesAction,
  getComplianceSummaryWithFiltersAction,
  retryEtimsExpenseIssueAction,
} from "@/lib/actions/compliance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function getDefaultMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export default async function CompliancePage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string; propertyId?: string; unitId?: string }>;
}) {
  const params = (await searchParams) || {};
  const monthKey = params.month || getDefaultMonthKey();
  const propertyId = params.propertyId ? Number(params.propertyId) : null;
  const unitId = params.unitId ? Number(params.unitId) : null;
  const summary = await getComplianceSummaryWithFiltersAction({
    monthKey,
    propertyId,
    unitId,
  });
  const expenses = await getComplianceExpensesAction({
    monthKey,
    propertyId,
    unitId,
  });
  const filterOptions = await getComplianceFilterOptionsAction();
  const filterQuery = new URLSearchParams();
  filterQuery.set("month", monthKey);
  if (propertyId) filterQuery.set("propertyId", String(propertyId));
  if (unitId) filterQuery.set("unitId", String(unitId));

  return (
    <div className="space-y-14 animate-fade-in pb-20">
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-outline-variant/20 pb-8">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-primary">Compliance Engine</p>
          <h1 className="text-5xl lg:text-7xl font-bold font-heading tracking-tighter mt-3">
            Tax & Audit <span className="text-primary italic font-serif">Control.</span>
          </h1>
          <p className="text-lg text-on-surface-variant mt-4 max-w-3xl">
            Export month-end KRA data in seconds, track eTIMS receipt completeness, and close a month with a tamper-evident snapshot.
          </p>
        </div>
        <form action="/compliance" className="flex items-end gap-3 flex-wrap">
          <div className="space-y-1">
            <label htmlFor="month" className="text-xs uppercase tracking-widest text-on-surface-variant">
              Reporting Month
            </label>
            <Input id="month" name="month" type="month" defaultValue={monthKey} className="w-45" />
          </div>
          <div className="space-y-1">
            <label htmlFor="propertyId" className="text-xs uppercase tracking-widest text-on-surface-variant">
              Property
            </label>
            <select
              id="propertyId"
              name="propertyId"
              defaultValue={propertyId ?? ""}
              className="h-10 w-55 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All properties</option>
              {filterOptions.properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="unitId" className="text-xs uppercase tracking-widest text-on-surface-variant">
              Unit
            </label>
            <select
              id="unitId"
              name="unitId"
              defaultValue={unitId ?? ""}
              className="h-10 w-55 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All units</option>
              {filterOptions.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unitCode} - {unit.unitName}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="outline">Load</Button>
        </form>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-10 border-y border-outline-variant/15 py-10">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Status</p>
          <p className="text-3xl font-light mt-2 capitalize">{summary.status}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Booking Revenue</p>
          <p className="text-3xl font-light mt-2">KES {summary.bookingRevenueTotal.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Tourism Levy (2%)</p>
          <p className="text-3xl font-light mt-2">KES {summary.tourismLevyTotal.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">eTIMS Missing</p>
          <p className="text-3xl font-light mt-2">{summary.missingEtimsCount}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight">Month-End Exports</h2>
          <div className="space-y-3">
            <Link href={`/compliance/export/tourism-levy?${filterQuery.toString()}`}>
              <Button className="w-full justify-start h-12">Export Tourism Levy CSV</Button>
            </Link>
            <Link href={`/compliance/export/etims-expenses?${filterQuery.toString()}`}>
              <Button variant="outline" className="w-full justify-start h-12">Export eTIMS Expenses CSV</Button>
            </Link>
            <Link href={`/compliance/export/kra-zip?${filterQuery.toString()}`}>
              <Button variant="secondary" className="w-full justify-start h-12 font-bold text-primary">Export KRA Compliance ZIP</Button>
            </Link>
          </div>
          <form action={closeComplianceMonthAction} className="pt-4">
            <input type="hidden" name="monthKey" value={monthKey} />
            <Button type="submit" variant="destructive" className="h-12">
              Close Month Snapshot
            </Button>
          </form>
          <p className="text-xs text-on-surface-variant">
            Closing stores totals + audit record for this month. Re-closing updates the snapshot and logs a new audit event.
          </p>
        </div>

        <div className="space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight">Add Compliance Expense</h2>
          <form action={createComplianceExpenseAction} className="space-y-3 border-y border-outline-variant/15 py-5">
            <input type="hidden" name="monthKey" value={monthKey} />
            <select
              name="propertyId"
              defaultValue={propertyId ?? ""}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Property (optional)</option>
              {filterOptions.properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
            <select
              name="unitId"
              defaultValue={unitId ?? ""}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Unit (optional)</option>
              {filterOptions.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unitCode} - {unit.unitName}
                </option>
              ))}
            </select>
            <Input type="date" name="expenseDate" required />
            <Input name="category" placeholder="Category (cleaning, utility, maintenance...)" required />
            <Input type="number" name="amount" placeholder="Amount (KES)" min={1} required />
            <Input name="vendorName" placeholder="Vendor name" />
            <Input name="etimsReceiptNumber" placeholder="eTIMS receipt number" />
            <Input name="notes" placeholder="Notes" />
            <Button type="submit">Save Expense</Button>
          </form>
          <p className="text-sm text-on-surface-variant">
            Total expenses this month: <span className="font-semibold text-on-surface">KES {summary.expenseTotal.toLocaleString()}</span> ({summary.expenseCount} entries)
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Recent Audit Events</h2>
        <div className="border-y border-outline-variant/15">
          {summary.recentAuditLogs.length === 0 ? (
            <p className="py-8 text-on-surface-variant">No audit events yet.</p>
          ) : (
            summary.recentAuditLogs.map((log) => (
              <div key={log.id} className="py-4 border-b border-outline-variant/10 flex items-center justify-between gap-6">
                <div>
                  <p className="font-medium">{log.action}</p>
                  <p className="text-xs text-on-surface-variant">{log.entityType}{log.entityId ? ` • ${log.entityId}` : ""}</p>
                </div>
                <p className="text-xs text-on-surface-variant">
                  {log.createdAt ? new Date(log.createdAt).toLocaleString("en-KE") : "—"}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">eTIMS Expense Queue</h2>
        <div className="overflow-x-auto border-y border-outline-variant/15">
          <table className="w-full text-sm min-w-225">
            <thead>
              <tr className="border-b border-outline-variant/10">
                <th className="px-2 py-3 text-left">Date</th>
                <th className="px-2 py-3 text-left">Category</th>
                <th className="px-2 py-3 text-left">Vendor</th>
                <th className="px-2 py-3 text-left">Amount</th>
                <th className="px-2 py-3 text-left">eTIMS Status</th>
                <th className="px-2 py-3 text-left">Receipt</th>
                <th className="px-2 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-10 text-center text-on-surface-variant">
                    No compliance expenses found for the selected filters/month.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-outline-variant/10">
                    <td className="px-2 py-4 text-on-surface-variant">{String(expense.expenseDate)}</td>
                    <td className="px-2 py-4">{expense.category}</td>
                    <td className="px-2 py-4 text-on-surface-variant">{expense.vendorName || "—"}</td>
                    <td className="px-2 py-4">KES {expense.amount.toLocaleString()}</td>
                    <td className="px-2 py-4">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-widest">
                          {expense.etimsStatus === "issued" ? "Issued" : "Pending Manual"}
                        </p>
                        {expense.etimsError ? (
                          <p className="text-xs text-destructive">{expense.etimsError}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-2 py-4 text-on-surface-variant">
                      {expense.etimsReceiptUrl ? (
                        <Link href={expense.etimsReceiptUrl} target="_blank" className="text-primary hover:underline">
                          {expense.etimsReceiptNumber || "View Receipt"}
                        </Link>
                      ) : (
                        expense.etimsReceiptNumber || "—"
                      )}
                    </td>
                    <td className="px-2 py-4 text-right">
                      {expense.etimsStatus !== "issued" ? (
                        <form action={retryEtimsExpenseIssueAction} className="inline-block">
                          <input type="hidden" name="expenseId" value={expense.id} />
                          <Button type="submit" variant="outline" size="sm">
                            Retry Issue
                          </Button>
                        </form>
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium">Done</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
