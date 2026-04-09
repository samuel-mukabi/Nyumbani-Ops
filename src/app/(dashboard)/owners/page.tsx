import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOwnerAction, createUnitAction, generateOwnerStatementAction, getOwnersOverviewAction } from "@/lib/actions/owners";
import { getPropertiesAction } from "@/lib/actions/properties";

function getCurrentMonthDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function formatKes(value: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default async function OwnersPage() {
  const owners = await getOwnersOverviewAction();
  const properties = await getPropertiesAction();
  const statementMonth = getCurrentMonthDate();

  return (
    <div className="space-y-12">
      <section className="space-y-3 border-b border-outline-variant/20 pb-8">
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
          Owners <span className="text-primary italic font-serif">& Units.</span>
        </h1>
        <p className="text-on-surface-variant">
          Track landlords, map each unit to an owner, and generate month-end statements.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="space-y-4 border-y border-outline-variant/15 py-6">
          <h2 className="text-xl font-semibold tracking-tight">Add Owner</h2>
          <form action={createOwnerAction} className="grid grid-cols-1 gap-4 pr-0 xl:pr-8">
            <div className="space-y-2">
              <Label htmlFor="fullName">Owner Name</Label>
              <Input id="fullName" name="fullName" required placeholder="e.g. John Doe" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" placeholder="07..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payoutPhone">M-Pesa Payout Phone</Label>
              <Input id="payoutPhone" name="payoutPhone" placeholder="2547..." />
            </div>
            <Button type="submit" className="w-fit">Save Owner</Button>
          </form>
        </div>

        <div className="space-y-4 border-y border-outline-variant/15 py-6">
          <h2 className="text-xl font-semibold tracking-tight">Add Unit</h2>
          <form action={createUnitAction} className="grid grid-cols-1 gap-4 pr-0 xl:pr-8">
            <div className="space-y-2">
              <Label htmlFor="ownerId">Owner</Label>
              <select
                id="ownerId"
                name="ownerId"
                required
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                defaultValue=""
              >
                <option value="" disabled>Select owner</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitName">Unit Name</Label>
              <Input id="unitName" name="unitName" required placeholder="Sunset Apt 3A" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buildingName">Property / Building</Label>
              <select
                id="buildingName"
                name="buildingName"
                required
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                defaultValue=""
              >
                <option value="" disabled>Select property</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="listingUrl">Airbnb Listing URL</Label>
                <Input id="listingUrl" name="listingUrl" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kplcMeterNo">KPLC Meter Number</Label>
                <Input id="kplcMeterNo" name="kplcMeterNo" placeholder="0123..." />
              </div>
            </div>
            <Button type="submit" className="w-fit">Save Unit</Button>
          </form>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Owner Portfolio</h2>
          <span className="text-xs uppercase tracking-widest text-on-surface-variant">{owners.length} Owners</span>
        </div>

        <div className="overflow-x-auto border-y border-outline-variant/20">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Units</th>
                <th className="px-4 py-3 text-left">Latest Statement Month</th>
                <th className="px-4 py-3 text-left">Latest Net Payout</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <tr key={owner.id} className="border-t border-outline-variant/15">
                  <td className="px-4 py-3">
                    <div className="font-medium">{owner.fullName}</div>
                    <div className="text-xs text-on-surface-variant">{owner.email || owner.phone || "No contact set"}</div>
                  </td>
                  <td className="px-4 py-3">{owner.unitCount}</td>
                  <td className="px-4 py-3">
                    {owner.latestStatement?.statementMonth
                      ? new Date(owner.latestStatement.statementMonth).toLocaleDateString("en-KE", { month: "short", year: "numeric" })
                      : "No statements yet"}
                  </td>
                  <td className="px-4 py-3">
                    {owner.latestStatement ? formatKes(owner.latestStatement.netOwnerPayout) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={async () => {
                        "use server";
                        await generateOwnerStatementAction(owner.id, statementMonth);
                      }}
                    >
                      <Button type="submit" variant="outline" size="sm">
                        Generate {new Date(statementMonth).toLocaleDateString("en-KE", { month: "short", year: "numeric" })}
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
              {owners.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-on-surface-variant">
                    Add your first owner to start monthly owner reporting.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
