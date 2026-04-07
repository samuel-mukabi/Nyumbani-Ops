import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPropertiesAction } from "@/lib/actions/properties";
import { getBookingsAction } from "@/lib/actions/bookings";

export default async function DashboardPage() {
  const properties = await getPropertiesAction();
  const bookings = await getBookingsAction();

  const activeStays = bookings.filter(b => b.status === "CHECKED_IN").length;
  const pendingCleanings = bookings.filter(b => b.status === "CHECKED_OUT").length;

  return (
    <div className="space-y-16 max-w-[1200px]">
      
      {/* Header (No borders) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-4">
        <div>
          <span className="text-[11px] font-semibold tracking-widest text-secondary uppercase mb-4 block">System Status: Online</span>
          <h1 className="font-heading text-5xl md:text-6xl tracking-tight text-on-surface font-light">
            Command <span className="font-medium text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-container">Center.</span>
          </h1>
        </div>
        <div className="bg-surface-container-low px-6 py-3 rounded-lg border border-outline-variant/20 shadow-[0_4px_16px_rgba(28,28,24,0.02)] hidden md:block">
           <span className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">Local • {new Date().toLocaleDateString('en-KE')}</span>
        </div>
      </div>

      {/* Asymmetrical Metric Grid */}
      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] lg:grid-cols-[1.8fr_1fr_1fr]">
        
        {/* Dominant Active Stays Card */}
        <Card className="rounded-2xl border border-outline-variant/20 shadow-[0_32px_48px_rgba(28,28,24,0.03)] bg-surface-container-lowest overflow-hidden relative min-h-[220px] flex flex-col justify-end p-8">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] mix-blend-multiply" />
           <div className="flex justify-between items-start w-full relative z-10 mb-8">
              <span className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase">Occupancy Load</span>
              <span className="bg-secondary-fixed text-on-surface text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-wide shadow-sm">Live Focus</span>
           </div>
           <div className="relative z-10">
              <div className="text-7xl font-heading font-light text-on-surface leading-none mb-2">{activeStays}</div>
              <p className="text-sm font-medium text-on-surface-variant border-t border-surface-container pt-4">Properties currently hosting guests across the network.</p>
           </div>
        </Card>
        
        {/* Secondary Metrics Stacked Vertically or smaller cards */}
        <div className="flex flex-col gap-6">
           <Card className="rounded-2xl border border-outline-variant/20 shadow-[0_16px_32px_rgba(28,28,24,0.02)] bg-surface-container-low flex-1 p-6">
              <div className="flex justify-between items-center mb-6">
                 <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">KPLC Alerts</span>
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-4xl font-light text-on-surface">0</div>
              <p className="text-[10px] text-on-surface-variant mt-2 uppercase tracking-wide">Tokens Healthy</p>
           </Card>
           
           <Card className="rounded-2xl border border-outline-variant/20 shadow-[0_16px_32px_rgba(28,28,24,0.02)] bg-surface-container-lowest flex-1 p-6">
              <div className="flex justify-between items-center mb-6">
                 <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Compliance</span>
                 <span className="text-xs bg-tertiary-fixed text-on-surface px-2 py-1 rounded-sm font-bold uppercase">100%</span>
              </div>
              <p className="text-xs font-medium text-on-surface-variant mt-2 leading-relaxed">eTIMS fully reconciled against M-Pesa statements.</p>
           </Card>
        </div>

        {/* Turnovers / Dispatch Metric */}
        <Card className="rounded-2xl border border-outline-variant/20 shadow-[0_24px_48px_rgba(28,28,24,0.03)] bg-primary flex flex-col justify-end p-6 text-white relative overflow-hidden hidden lg:flex">
           <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,_white_1px,_transparent_1px),_linear-gradient(-45deg,_white_1px,_transparent_1px)] bg-[size:20px_20px]" />
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[100px]" />
           <div className="relative z-10 mb-8">
              <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase">Pending Turnovers</span>
           </div>
           <div className="relative z-10">
              <div className="text-5xl font-light leading-none mb-3">{pendingCleanings}</div>
              <p className="text-[11px] font-medium text-white/80 uppercase tracking-widest">Awaiting Staff Dispatch</p>
           </div>
        </Card>
      </div>

      <div className="pt-10">
        <h2 className="font-heading text-2xl font-light text-on-surface mb-8">Portfolio Telemetry</h2>
        <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 shadow-[0_24px_64px_rgba(28,28,24,0.02)]">
            <div className="space-y-6">
              {properties.length === 0 ? (
                <div className="p-12 text-center bg-surface-container-low rounded-2xl">
                  <p className="text-lg font-medium text-on-surface mb-2">No properties initialized.</p>
                  <p className="text-sm font-light text-on-surface-variant">Register a property to begin structural orchestration.</p>
                </div>
              ) : (
                properties.map((property) => (
                  <div key={property.id} className="group flex items-center justify-between bg-surface-container-low hover:bg-surface-container p-4 md:p-6 rounded-2xl transition-colors">
                     <div className="flex items-center gap-6">
                        <div className="hidden sm:block h-14 w-1 bg-primary rounded-full" />
                        <div>
                           <p className="text-lg font-semibold text-on-surface mb-1">{property.name}</p>
                           <p className="text-sm font-medium text-on-surface-variant">{property.address || "Nairobi, Kenya"}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="hidden md:inline-block px-3 py-1.5 bg-secondary-fixed text-on-surface text-[10px] font-bold uppercase rounded-md tracking-wider">Online & Locked</span>
                        <div className="text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-sm tracking-widest uppercase">
                           Manage &rarr;
                        </div>
                     </div>
                  </div>
                ))
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
