import { getPropertyDetailAction } from "@/lib/actions/properties";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  ChevronLeft, 
  Calendar, 
  DollarSign, 
  Users as UsersIcon, 
  Battery, 
  Wifi, 
  ShieldCheck,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await getPropertyDetailAction(slug);

  if (!property) {
    notFound();
  }

  // Calculate metrics
  const totalRevenue = property.bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalGuests = property.bookings.length;
  const activeBooking = property.bookings.find(b => b.status === "CHECKED_IN");

  return (
    <div className="space-y-16 animate-fade-in pb-24">
      
      {/* Editorial Header */}
      <nav className="flex items-center gap-4 text-on-surface-variant/40 hover:text-primary transition-colors">
         <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" />
            Control Panel
         </Link>
      </nav>

      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-[1px] bg-primary/40 block" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">Detailed Report</span>
            </div>
            <h1 className="font-heading text-6xl md:text-8xl tracking-tight text-on-surface font-light leading-none">
              {property.name}<span className="text-primary italic font-serif">.</span>
            </h1>
            <p className="text-xl text-on-surface-variant font-light max-w-2xl leading-relaxed">
               {property.address || "A sanctuary managed with precision."}
            </p>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="h-14 px-8 rounded-2xl font-bold border-outline-variant/30 text-on-surface-variant bg-transparent hover:bg-surface-container-low">
                <Share2 className="w-4 h-4 mr-2" /> Share Guest Portal
             </Button>
          </div>
        </div>
      </section>

      {/* Fairing Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 border-y border-outline-variant/10 py-16">
        <div className="space-y-6 group cursor-default">
          <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase group-hover:text-primary transition-colors flex items-center gap-2">
             <ShieldCheck className="w-3 h-3" /> Status
          </p>
          <div className="flex items-center gap-4">
            <span className={`w-2 h-2 rounded-full ${activeBooking ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-on-surface-variant/20'}`} />
            <span className="text-4xl font-light text-on-surface leading-none tabular-nums">
               {activeBooking ? 'Occupied' : 'Vacant'}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-on-surface-variant/70">
             {activeBooking ? `Guest: ${activeBooking.guestName}` : 'No active guests currently.'}
          </p>
        </div>

        <div className="space-y-6 group cursor-default">
          <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase group-hover:text-primary transition-colors flex items-center gap-2">
             <DollarSign className="w-3 h-3" /> Total Revenue
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-on-surface-variant/40 uppercase tracking-widest leading-none">KES</span>
            <span className="text-4xl font-light text-on-surface leading-none tabular-nums">
               {totalRevenue.toLocaleString()}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-on-surface-variant/70">Cumulative revenue desde registration.</p>
        </div>

        <div className="space-y-6 group cursor-default">
          <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase group-hover:text-primary transition-colors flex items-center gap-2">
             <UsersIcon className="w-3 h-3" /> Total Guests
          </p>
          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-light text-on-surface leading-none tabular-nums">
                {totalGuests}
            </span>
            <span className="text-xs font-semibold text-on-surface-variant/40 uppercase tracking-widest leading-none">Visits</span>
          </div>
          <p className="text-xs leading-relaxed text-on-surface-variant/70">Total distinct check-ins recorded.</p>
        </div>

        <div className="space-y-6 group cursor-default">
          <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase group-hover:text-primary transition-colors flex items-center gap-2">
             <Battery className="w-3 h-3" /> Infrastructure
          </p>
          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-light text-on-surface leading-none tabular-nums">Online</span>
          </div>
          <p className="text-xs leading-relaxed text-on-surface-variant/70 flex items-center gap-2">
             <Wifi className="w-3 h-3" /> 5G Stable • KPLC Ready
          </p>
        </div>
      </section>

      {/* House Ledger */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-24">
         <div className="lg:col-span-2 space-y-12">
            <div className="flex items-end justify-between pb-4 border-b border-outline-variant/10">
               <h2 className="font-heading text-3xl font-light text-on-surface tracking-tight">House Ledger</h2>
               <span className="text-[10px] font-bold tracking-widest text-on-surface-variant/40 uppercase">Recent Bookings</span>
            </div>

            <div className="space-y-1">
               {property.bookings.length === 0 ? (
                  <div className="py-12 bg-surface-container-lowest/50 rounded-3xl text-center">
                     <p className="text-sm font-light italic text-on-surface-variant/60">"Silence is golden, but a booking is platinum."</p>
                     <p className="text-[10px] font-bold tracking-widest text-primary uppercase mt-4">Waiting for first guest</p>
                  </div>
               ) : (
                  property.bookings.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)).map((booking) => (
                     <div 
                        key={booking.id} 
                        className="group flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-outline-variant/5 hover:bg-surface-container-low px-6 rounded-2xl transition-all duration-500 ease-out"
                     >
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold tracking-[0.2em] text-primary/40 uppercase mb-1">{booking.status}</span>
                           <p className="text-xl font-light text-on-surface">{booking.guestName}</p>
                           <p className="text-[10px] text-on-surface-variant/60 font-mono mt-1">
                              {new Date(booking.checkInDate).toLocaleDateString()} &mdash; {new Date(booking.checkOutDate).toLocaleDateString()}
                           </p>
                        </div>
                        <div className="flex items-center gap-12 mt-4 md:mt-0">
                           <div className="flex flex-col items-end">
                              <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/30 uppercase mb-1">Source</span>
                              <span className="text-xs font-bold text-on-surface uppercase tracking-widest">{booking.source}</span>
                           </div>
                           <div className="flex flex-col items-end">
                              <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/30 uppercase mb-1">Payout</span>
                              <span className="text-xs font-bold text-emerald-500 tabular-nums">+ {booking.totalAmount?.toLocaleString()}</span>
                           </div>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* Technical Profile */}
         <div className="space-y-12">
            <div className="flex items-end justify-between pb-4 border-b border-outline-variant/10">
               <h2 className="font-heading text-3xl font-light text-on-surface tracking-tight">Technical Profile</h2>
            </div>
            
            <div className="space-y-8 bg-surface-container-low/30 p-10 rounded-[40px]">
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-bold tracking-widest text-on-surface-variant/40 uppercase">Smart Lock ID</span>
                     <span className="text-xs font-mono text-on-surface font-semibold">{property.ttlockLockId || 'DISCONNECTED'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-bold tracking-widest text-on-surface-variant/40 uppercase">KPLC Meter</span>
                     <span className="text-xs font-mono text-on-surface font-semibold">{property.kplcMeterNumber || '—'}</span>
                  </div>
               </div>

               <div className="w-full h-[1px] bg-outline-variant/10" />

               <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                     <div className="flex items-center gap-2">
                        <Wifi className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-bold tracking-widest text-on-surface uppercase">Digital Access</span>
                     </div>
                     <div className="p-4 bg-surface-container rounded-2xl space-y-1">
                        <p className="text-xs text-on-surface-variant uppercase tracking-widest opacity-40">WiFi Credentials</p>
                        <p className="text-sm font-semibold text-on-surface">{property.wifiName || 'Not Set'}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono opacity-60 italic">{property.wifiPassword || 'No password set'}</p>
                     </div>
                  </div>

                  <div className="flex flex-col gap-2">
                     <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-bold tracking-widest text-on-surface uppercase">House Etiquette</span>
                     </div>
                     <div className="p-4 bg-surface-container rounded-2xl">
                        <p className="text-sm italic font-serif leading-relaxed text-on-surface-variant/80">
                           {property.houseRules || "Standard luxury etiquette applies. Enjoy your sanctuary."}
                        </p>
                     </div>
                  </div>
               </div>

               <Button className="w-full h-14 rounded-2xl font-bold bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-all border-none">
                  Update Technical Specs
               </Button>
            </div>
         </div>
      </section>

    </div>
  );
}
