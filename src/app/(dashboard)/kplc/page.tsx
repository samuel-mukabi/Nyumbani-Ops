import Link from "next/link";
import {
  getKplcHistoryAction,
  getKplcOverviewAction,
  getUtilityProfilesAction,
  syncKplcNowAction,
  upsertUtilityProfileAction,
} from "@/lib/actions/kplc";
import { Button } from "@/components/ui/button";
import { generateUtilityTestReadingsAction, getUtilityTelemetryAction, rotateUtilityIngestTokenAction, upsertUtilityDeviceBindingAction } from "@/lib/actions/utilities";

export default async function KplcPage({
  searchParams,
}: {
  searchParams?: Promise<{ critical?: string }>;
}) {
  const params = (await searchParams) || {};
  const criticalOnly = params.critical === "1";
  const [overview, history, utilityProfiles] = await Promise.all([
    getKplcOverviewAction(),
    getKplcHistoryAction(criticalOnly),
    getUtilityProfilesAction(),
  ]);
  const telemetry = await getUtilityTelemetryAction();

  const exportUrl = `/kplc/export${criticalOnly ? "?critical=1" : ""}`;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <section className="space-y-3 border-b border-outline-variant/20 pb-8">
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
          Utility <span className="text-primary italic font-serif">Protection.</span>
        </h1>
        <p className="text-on-surface-variant">
          Predict low-balance risk, enforce usage policies, and automate top-up workflows through provider integrations.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-8 border-y border-outline-variant/15 py-8">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Metered Units</p>
          <p className="text-4xl font-light mt-2">{overview.totalMeteredUnits}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Critical</p>
          <p className="text-4xl font-light mt-2 text-red-600">{overview.critical}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Low</p>
          <p className="text-4xl font-light mt-2 text-amber-600">{overview.low}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Healthy</p>
          <p className="text-4xl font-light mt-2 text-emerald-600">{overview.healthy}</p>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link href="/kplc">
            <Button variant={!criticalOnly ? "default" : "outline"} size="sm">
              All Readings
            </Button>
          </Link>
          <Link href="/kplc?critical=1">
            <Button variant={criticalOnly ? "default" : "outline"} size="sm">
              Critical Only
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link href={exportUrl}>
            <Button variant="outline" size="sm">Export CSV</Button>
          </Link>
          <form action={syncKplcNowAction}>
            <Button type="submit" size="sm">Refresh Readings</Button>
          </form>
        </div>
      </section>

      <section className="overflow-x-auto border-y border-outline-variant/15">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-outline-variant/10">
              <th className="px-2 py-3 text-left">Unit</th>
              <th className="px-2 py-3 text-left">Meter</th>
              <th className="px-2 py-3 text-left">Balance</th>
              <th className="px-2 py-3 text-left">Status</th>
              <th className="px-2 py-3 text-left">Source</th>
              <th className="px-2 py-3 text-left">Checked</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-2 py-10 text-center text-on-surface-variant">
                  No KPLC readings available yet. Run a refresh to fetch balances.
                </td>
              </tr>
            ) : (
              history.map((row) => (
                <tr key={row.id} className="border-b border-outline-variant/10">
                  <td className="px-2 py-4">
                    <div className="font-medium">{row.unitName}</div>
                    <div className="text-xs text-on-surface-variant">{row.unitCode}</div>
                  </td>
                  <td className="px-2 py-4 font-mono text-on-surface-variant">{row.meterNumber}</td>
                  <td className="px-2 py-4">{row.tokenBalance.toFixed(2)} tokens</td>
                  <td className="px-2 py-4">
                    <span
                      className={`text-xs font-bold uppercase tracking-widest ${
                        row.status === "critical"
                          ? "text-red-600"
                          : row.status === "low"
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-2 py-4 text-on-surface-variant">{row.source}</td>
                  <td className="px-2 py-4 text-on-surface-variant">
                    {row.createdAt ? new Date(row.createdAt).toLocaleString("en-KE") : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Unit Utility Policies</h2>
        <div className="overflow-x-auto border-y border-outline-variant/15">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-outline-variant/10">
                <th className="px-2 py-3 text-left">Unit</th>
                <th className="px-2 py-3 text-left">Meter</th>
                <th className="px-2 py-3 text-left">Provider</th>
                <th className="px-2 py-3 text-left">Min Threshold</th>
                <th className="px-2 py-3 text-left">Daily Allowance (kWh)</th>
                <th className="px-2 py-3 text-left">Top-up Amount</th>
                <th className="px-2 py-3 text-left">Alerts Phone</th>
                <th className="px-2 py-3 text-right">Save</th>
              </tr>
            </thead>
            <tbody>
              {utilityProfiles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-2 py-10 text-center text-on-surface-variant">
                    No metered units found yet. Add KPLC meter numbers to units first.
                  </td>
                </tr>
              ) : (
                utilityProfiles.map((row) => (
                  <tr key={row.unitId} className="border-b border-outline-variant/10">
                    <td className="px-2 py-4">
                      <div className="font-medium">{row.unitName}</div>
                      <div className="text-xs text-on-surface-variant">{row.unitCode}</div>
                    </td>
                    <td className="px-2 py-4 font-mono text-on-surface-variant">{row.meterNumber}</td>
                    <td className="px-2 py-4" colSpan={6}>
                      <form action={upsertUtilityProfileAction} className="grid grid-cols-7 gap-2 items-center">
                        <input type="hidden" name="unitId" value={row.unitId} />
                        <select
                          name="provider"
                          defaultValue={row.profile?.provider ?? "manual"}
                          className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                        >
                          <option value="manual">Manual</option>
                          <option value="pesapal">Pesapal</option>
                          <option value="jambopay">JamboPay</option>
                          <option value="cellulant">Cellulant</option>
                        </select>
                        <input
                          name="minBalanceThreshold"
                          type="number"
                          min={1}
                          step={0.1}
                          defaultValue={row.profile?.minBalanceThreshold ?? "20"}
                          className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                        />
                        <input
                          name="dailyAllowanceKwh"
                          type="number"
                          min={0.1}
                          step={0.1}
                          defaultValue={row.profile?.dailyAllowanceKwh ?? ""}
                          placeholder="Optional"
                          className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                        />
                        <input
                          name="topupAmount"
                          type="number"
                          min={50}
                          step={50}
                          defaultValue={row.profile?.topupAmount ?? 500}
                          className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                        />
                        <input
                          name="notificationPhone"
                          defaultValue={row.profile?.notificationPhone ?? ""}
                          placeholder="2547..."
                          className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                        />
                        <label className="inline-flex items-center gap-2 text-xs text-on-surface-variant">
                          <input
                            name="autoTopupEnabled"
                            type="checkbox"
                            defaultChecked={row.profile?.autoTopupEnabled ?? false}
                          />
                          Auto top-up
                        </label>
                        <div className="text-right">
                          <Button type="submit" size="sm" variant="outline">Save</Button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">IoT Telemetry (Shelly / Sonoff)</h2>
        <div className="overflow-x-auto border-y border-outline-variant/15">
          <table className="w-full min-w-[1200px] text-sm">
            <thead>
              <tr className="border-b border-outline-variant/10">
                <th className="px-2 py-3 text-left">Unit</th>
                <th className="px-2 py-3 text-left">Today kWh</th>
                <th className="px-2 py-3 text-left">Last Power (W)</th>
                <th className="px-2 py-3 text-left">Last Seen</th>
                <th className="px-2 py-3 text-left">Burn Rate (kWh/h)</th>
                <th className="px-2 py-3 text-left">Hours Remaining</th>
                <th className="px-2 py-3 text-left">Device Binding</th>
                <th className="px-2 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {telemetry.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-2 py-10 text-center text-on-surface-variant">
                    No metered units found yet. Add meter numbers to units first.
                  </td>
                </tr>
              ) : (
                telemetry.map((row) => (
                  <tr key={row.unitId} className="border-b border-outline-variant/10 align-top">
                    <td className="px-2 py-4">
                      <div className="font-medium">{row.unitName}</div>
                      <div className="text-xs text-on-surface-variant">{row.unitCode}</div>
                      <div className="text-xs font-mono text-on-surface-variant mt-1">{row.meterNumber}</div>
                    </td>
                    <td className="px-2 py-4">{row.todayKwh.toFixed(3)}</td>
                    <td className="px-2 py-4">{row.lastPowerWatts != null ? row.lastPowerWatts.toFixed(1) : "—"}</td>
                    <td className="px-2 py-4 text-on-surface-variant">
                      {row.lastReadingAt ? new Date(row.lastReadingAt).toLocaleString("en-KE") : "—"}
                    </td>
                    <td className="px-2 py-4 text-on-surface-variant">
                      {row.burnRateKwhPerHour != null ? row.burnRateKwhPerHour.toFixed(3) : "—"}
                    </td>
                    <td className="px-2 py-4">
                      {row.predictedHoursRemaining != null ? (
                        <span
                          className={`text-xs font-bold uppercase tracking-widest ${
                            row.predictedHoursRemaining <= 6
                              ? "text-red-600"
                              : row.predictedHoursRemaining <= 12
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {row.predictedHoursRemaining.toFixed(1)}h
                        </span>
                      ) : (
                        <span className="text-on-surface-variant">—</span>
                      )}
                    </td>
                    <td className="px-2 py-4">
                      <div className="space-y-2">
                        <form action={upsertUtilityDeviceBindingAction} className="grid grid-cols-2 gap-2">
                          <input type="hidden" name="unitId" value={row.unitId} />
                          <select
                            name="deviceType"
                            defaultValue={row.binding?.deviceType ?? "shelly"}
                            className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                          >
                            <option value="shelly">Shelly</option>
                            <option value="sonoff">Sonoff</option>
                          </select>
                          <input
                            name="deviceId"
                            defaultValue={row.binding?.deviceId ?? ""}
                            placeholder="Device ID"
                            className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                          />
                          <label className="inline-flex items-center gap-2 text-xs text-on-surface-variant col-span-2">
                            <input name="isActive" type="checkbox" defaultChecked={row.binding?.isActive ?? true} />
                            Active
                          </label>
                          <div className="col-span-2 flex items-center justify-between pt-1">
                            <Button type="submit" size="sm" variant="outline">
                              Save Binding
                            </Button>
                            {row.binding?.ingestToken ? (
                              <span className="text-[10px] text-on-surface-variant">Saved</span>
                            ) : (
                              <span className="text-[10px] text-on-surface-variant">—</span>
                            )}
                          </div>
                        </form>

                        {row.binding?.ingestToken ? (
                          <div className="space-y-2">
                            <div className="text-[10px] text-on-surface-variant font-mono break-all">
                              token: {row.binding.ingestToken}
                            </div>
                            <form action={rotateUtilityIngestTokenAction} className="flex justify-end">
                              <input type="hidden" name="unitId" value={row.unitId} />
                              <Button type="submit" size="sm" variant="ghost">
                                Rotate token
                              </Button>
                            </form>
                          </div>
                        ) : (
                          <div className="text-[10px] text-on-surface-variant">
                            Save to generate ingest token.
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-4 text-right text-xs text-on-surface-variant">
                      <div className="space-y-2">
                        <div>
                          POST <span className="font-mono">/api/utilities/iot/ingest</span>
                        </div>
                        <div className="font-mono text-[10px] break-all">
                          Authorization: Bearer {row.binding?.ingestToken ?? "..."}
                        </div>
                        <form action={generateUtilityTestReadingsAction}>
                          <input type="hidden" name="unitId" value={row.unitId} />
                          <Button type="submit" size="sm" variant="outline">
                            Generate test readings
                          </Button>
                        </form>
                      </div>
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
