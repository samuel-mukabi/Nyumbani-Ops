import { getPropertiesAction } from "@/lib/actions/properties";
import { getBookingsAction } from "@/lib/actions/bookings";
import { getComplianceSummaryWithFiltersAction } from "@/lib/actions/compliance";
import { getKplcOverviewAction, syncKplcNowAction } from "@/lib/actions/kplc";
import Link from "next/link";

export default async function DashboardPage() {
  const properties = await getPropertiesAction();
  const bookings = await getBookingsAction();
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const compliance = await getComplianceSummaryWithFiltersAction({ monthKey });
  const kplcOverview = await getKplcOverviewAction();

  const activeStays = bookings.filter(b => b.status === "CHECKED_IN").length;
  const pendingCleanings = bookings.filter(b => b.status === "CHECKED_OUT").length;
  const complianceRisk =
    compliance.status !== "closed" || compliance.missingEtimsCount > 0;

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      
      {/* Editorial Header */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <h1 className="font-heading text-4xl md:text-6xl tracking-tight text-on-surface font-light leading-none">
            Your <span className="font-medium text-primary">Overview.</span>
          </h1>
          <div className="flex flex-col items-start lg:items-end gap-1">
             <p className="text-[10px] font-bold tracking-widest text-primary uppercase">Nairobi Time • {new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</p>
             <p
               className={`text-[10px] font-bold uppercase tracking-widest ${
                 complianceRisk ? "text-amber-600" : "text-emerald-600"
               }`}
             >
               Compliance {complianceRisk ? "Attention Needed" : "Healthy"}
             </p>
          </div>
        </div>
      </section>

      {/* Rhythmic Metrics (Zero-Card) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 border-y border-outline-variant/10 py-16">
        <div className="space-y-6 group cursor-default">
          <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase group-hover:text-primary transition-colors">Active Guests</p>
          <div className="flex items-baseline gap-4">
            <span className="text-7xl font-light text-on-surface leading-none tabular-nums">{activeStays}</span>
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest leading-none">Properties</span>
          </div>
          <p className="text-xs leading-relaxed text-on-surface-variant max-w-50">Guests currently checked into your properties.</p>
        </div>

        <div className="space-y-6 group cursor-default">
          <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase group-hover:text-primary transition-colors">Cleaning Jobs</p>
          <div className="flex items-baseline gap-4">
            <span className="text-7xl font-light text-on-surface leading-none tabular-nums">{pendingCleanings}</span>
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest leading-none">Pending</span>
          </div>
          <p className="text-xs leading-relaxed text-on-surface-variant max-w-50">Cleaning jobs waiting to be confirmed.</p>
        </div>

        <div className="space-y-6 group cursor-default">
          <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase group-hover:text-primary transition-colors">Power & Locks</p>
          <div className="flex items-baseline gap-4">
            <span className="text-7xl font-light text-on-surface leading-none tabular-nums">{kplcOverview.critical}</span>
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest leading-none">Critical</span>
          </div>
          <p className="text-xs leading-relaxed text-on-surface-variant max-w-55">
            {kplcOverview.low} low, {kplcOverview.healthy} healthy out of {kplcOverview.totalMeteredUnits} metered units.
          </p>
          <form action={syncKplcNowAction}>
            <button type="submit" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
              Refresh KPLC readings
            </button>
          </form>
        </div>

        <div className="space-y-6 group cursor-default">
          <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase group-hover:text-primary transition-colors">Tax Status</p>
          <div className="flex items-baseline gap-4">
            <span className="text-7xl font-light text-on-surface leading-none tabular-nums">A+</span>
          </div>
          <p className="text-xs leading-relaxed text-on-surface-variant max-w-50">Tax receipt status for this billing period.</p>
        </div>
      </section>

      {/* Portfolio Manifest */}
      <section className="space-y-12">
        <div className="flex items-end justify-between pb-4 border-b border-outline-variant">
           <h2 className="font-heading text-3xl font-light text-on-surface tracking-tight">Your Properties</h2>
           <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">{properties.length} Total Units</span>
        </div>

        <div className="space-y-1">
          {properties.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-lg font-light text-on-surface-variant italic font-serif">&quot;A quiet portfolio is an unmapped one.&quot;</p>
              <p className="text-[10px] font-bold tracking-widest text-primary uppercase mt-4">Add Your First Property</p>
            </div>
          ) : (
            properties.map((property) => (
              <Link 
                key={property.id} 
                href={`/properties/${property.slug}`}
                className="group flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-outline-variant/5 hover:bg-surface-container-low px-6 rounded-xl transition-all duration-500 ease-out cursor-pointer"
              >
                 <div className="flex items-center gap-8 md:gap-12">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-1">Property Name</span>
                       <p className="text-2xl font-light text-on-surface group-hover:translate-x-1 transition-transform duration-500">{property.name}</p>
                    </div>
                    <div className="hidden lg:flex flex-col">
                       <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-1">Location</span>
                       <p className="text-sm font-medium text-on-surface-variant">{property.address || "Nairobi Base"}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-12 mt-6 md:mt-0">
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-1">Status</span>
                       <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
                          <span className="text-xs font-bold text-on-surface uppercase tracking-widest">Active • Secure</span>
                       </div>
                    </div>
                    <div className="h-12 w-12 rounded-full border border-outline-variant flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 group/btn">
                       <span className="text-xl group-hover/btn:translate-x-0.5 transition-transform">&rarr;</span>
                    </div>
                 </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Narrative Footer */}
      <footer className="pt-24 opacity-20 hover:opacity-100 transition-opacity duration-1000">
         <div className="flex flex-col items-center gap-6">
            <div className="w-px h-24 bg-linear-to-b from-primary to-transparent" />
            <p className="text-[10px] font-bold tracking-[0.4em] text-on-surface-variant uppercase">Elegance in Automation</p>
         </div>
      </footer>
    </div>
  );
}
