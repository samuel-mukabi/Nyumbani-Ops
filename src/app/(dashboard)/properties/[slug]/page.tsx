import { getPropertyDetailAction, getPropertyOccupancyAction } from "@/lib/actions/properties";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
   Building2,
   ChevronLeft,
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

function formatDateTime(value: Date | null) {
   if (!value) return "—";
   return new Date(value).toLocaleString("en-KE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
   });
}

export default async function PropertyDetailPage({ params }: PageProps) {
   const { slug } = await params;
   const property = await getPropertyDetailAction(slug);
   const occupancy = await getPropertyOccupancyAction(slug);

   if (!property) {
      notFound();
   }

   // Calculate metrics
   const totalRevenue = property.bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
   const totalGuests = property.bookings.length;
   const activeBooking = property.bookings.find(b => b.status === "CHECKED_IN");

   return (
      <div className="space-y-5 animate-fade-in pb-12">

         {/* Editorial Header */}
         <nav className="flex items-center gap-4 text-on-surface-variant hover:text-primary transition-colors">
            <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
               <ChevronLeft className="w-4 h-4" />
               Control Panel
            </Link>
         </nav>

         <section className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
               <div className="space-y-4">
                  <h1 className="font-heading text-4xl md:text-6xl tracking-tight text-on-surface font-light leading-none">
                     {property.name}<span className="text-primary italic font-serif">.</span>
                  </h1>
                  <p className="text-xl text-on-surface-variant font-light max-w-2xl leading-relaxed">
                     {property.address || "A sanctuary managed with precision."}
                  </p>
               </div>
               <div className="flex gap-4">
                  <Link href={activeBooking ? `/portal/${activeBooking.id}` : `/${property.slug}`} target="_blank">
                     <Button variant="default" className="">
                        <Share2 className="w-4 h-4 mr-2" /> View Guest Portal
                     </Button>
                  </Link>
               </div>
            </div>
         </section>

         {/* Fairing Metrics Grid */}
         <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 border-y border-outline-variant/10 py-10">
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
               <p className="text-xs leading-relaxed text-on-surface-variant">
                  {activeBooking ? `Guest: ${activeBooking.guestName}` : 'No active guests currently.'}
               </p>
            </div>

            <div className="space-y-6 group cursor-default">
               <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase group-hover:text-primary transition-colors flex items-center gap-2">
                  <DollarSign className="w-3 h-3" /> Total Revenue
               </p>
               <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest leading-none">KES</span>
                  <span className="text-4xl font-light text-on-surface leading-none tabular-nums">
                     {totalRevenue.toLocaleString()}
                  </span>
               </div>
               <p className="text-xs leading-relaxed text-on-surface-variant">Cumulative revenue desde registration.</p>
            </div>

            <div className="space-y-6 group cursor-default">
               <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase group-hover:text-primary transition-colors flex items-center gap-2">
                  <UsersIcon className="w-3 h-3" /> Total Guests
               </p>
               <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-light text-on-surface leading-none tabular-nums">
                     {totalGuests}
                  </span>
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest Championship leading-none">Visits</span>
               </div>
               <p className="text-xs leading-relaxed text-on-surface-variant">Total distinct check-ins recorded.</p>
            </div>

            <div className="space-y-6 group cursor-default">
               <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase group-hover:text-primary transition-colors flex items-center gap-2">
                  <Battery className="w-3 h-3" /> Infrastructure
               </p>
               <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-light text-on-surface leading-none tabular-nums">Online</span>
               </div>
               <p className="text-xs leading-relaxed text-on-surface-variant flex items-center gap-2">
                  <Wifi className="w-3 h-3" /> 5G Stable • KPLC Ready
               </p>
            </div>
         </section>

         <section className="space-y-8 border-t border-outline-variant/10 pt-16">
            <div className="flex items-end justify-between border-b border-outline-variant/10 pb-4">
               <h2 className="font-heading text-3xl font-light text-on-surface tracking-tight">
                  Property Owners & Unit Occupancy
               </h2>
               <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                  {occupancy?.units.length ?? 0} Units
               </span>
            </div>

            {!occupancy || occupancy.units.length === 0 ? (
               <div className="py-14 text-on-surface-variant">
                  Add units under this property to start occupancy tracking.
               </div>
            ) : (
               <div className="space-y-8">
                  <p className="text-sm text-on-surface-variant">
                     <span className="font-medium text-on-surface">Owners:</span>{" "}
                     {occupancy.owners.length ? occupancy.owners.join(", ") : "No owners assigned"}
                  </p>

                  <div className="overflow-x-auto">
                     <table className="w-full min-w-245 text-sm">
                        <thead>
                           <tr className="border-b border-outline-variant/15 text-on-surface-variant">
                              <th className="px-2 py-3 text-left font-semibold">Unit</th>
                              <th className="px-2 py-3 text-left font-semibold">Owner</th>
                              <th className="px-2 py-3 text-left font-semibold">Status (Now)</th>
                              <th className="px-2 py-3 text-left font-semibold">Current Occupancy Time</th>
                              <th className="px-2 py-3 text-left font-semibold">Next Occupancy Time</th>
                              <th className="px-2 py-3 text-left font-semibold">7-Day Occupancy Calendar</th>
                           </tr>
                        </thead>
                        <tbody>
                           {occupancy.units.map((unit) => (
                              <tr key={unit.id} className="border-b border-outline-variant/10 align-top">
                                 <td className="px-2 py-5">
                                    <div className="font-medium text-on-surface">{unit.name}</div>
                                    <div className="text-xs text-on-surface-variant">{unit.code}</div>
                                 </td>
                                 <td className="px-2 py-5 text-on-surface">{unit.ownerName}</td>
                                 <td className="px-2 py-5">
                                    <span
                                       className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest ${
                                          unit.isOccupiedNow ? "text-red-700" : "text-emerald-700"
                                       }`}
                                    >
                                       {unit.isOccupiedNow ? "Occupied" : "Available"}
                                    </span>
                                 </td>
                                 <td className="px-2 py-5 text-on-surface-variant">
                                    {unit.currentBooking ? (
                                       <>
                                          <div>
                                             {formatDateTime(unit.currentBooking.checkInDate)} -{" "}
                                             {formatDateTime(unit.currentBooking.checkOutDate)}
                                          </div>
                                          <div className="text-xs">Guest: {unit.currentBooking.guestName}</div>
                                       </>
                                    ) : (
                                       "Not occupied now"
                                    )}
                                 </td>
                                 <td className="px-2 py-5 text-on-surface-variant">
                                    {unit.nextBooking ? (
                                       <>
                                          <div>
                                             {formatDateTime(unit.nextBooking.checkInDate)} -{" "}
                                             {formatDateTime(unit.nextBooking.checkOutDate)}
                                          </div>
                                          <div className="text-xs">Guest: {unit.nextBooking.guestName}</div>
                                       </>
                                    ) : (
                                       "No upcoming booking (next 30 days)"
                                    )}
                                 </td>
                                 <td className="px-2 py-5">
                                    <div className="grid grid-cols-7 gap-1 min-w-85">
                                       {unit.weeklyTimeline.map((slot) => (
                                          <div
                                             key={`${unit.id}-${new Date(slot.date).toISOString()}`}
                                             className={`rounded-sm border px-1.5 py-1 text-center ${
                                                slot.occupied
                                                   ? "bg-red-500/10 border-red-500/20 text-red-700"
                                                   : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700"
                                             }`}
                                          >
                                             <div className="text-[10px] font-bold uppercase tracking-widest">
                                                {new Date(slot.date).toLocaleDateString("en-KE", { weekday: "short" })}
                                             </div>
                                             <div className="text-[10px]">
                                                {new Date(slot.date).toLocaleDateString("en-KE", { day: "2-digit", month: "short" })}
                                             </div>
                                             <div className="text-[10px]">{slot.timeWindow}</div>
                                          </div>
                                       ))}
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}
         </section>

         {/* Live Operations & Insights */}
         <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-outline-variant/10 pt-20">

            {/* Left: Intelligence & Availability (5/12) */}
            <div className="lg:col-span-5 space-y-14">
               {/* Technical Profile Grid */}
               <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-4">
                     <Building2 className="w-4 h-4 text-primary" />
                     <h2 className="text-sm font-bold tracking-widest text-on-surface uppercase">Infrastructure</h2>
                  </div>
                  <div className="space-y-5">
                     <div className="flex items-start justify-between gap-8 border-b border-outline-variant/10 pb-4">
                        <p className="text-[10px] font-bold text-on-surface! uppercase tracking-widest">Smart Lock</p>
                        <p className="text-sm font-semibold font-mono text-right">{property.ttlockLockId || "DISCONNECTED"}</p>
                     </div>
                     <div className="flex items-start justify-between gap-8 border-b border-outline-variant/10 pb-4">
                        <p className="text-[10px] font-bold text-on-surface! uppercase tracking-widest">KPLC Meter</p>
                        <p className="text-sm font-semibold font-mono text-right">{property.kplcMeterNumber || "—"}</p>
                     </div>
                     <div className="flex items-start justify-between gap-8 border-b border-outline-variant/10 pb-4">
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-on-surface! uppercase tracking-widest">WiFi Access</p>
                           <p className="text-xs text-on-surface-variant">Network and support credentials</p>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-sm font-semibold flex items-center gap-2">
                              <Wifi className="w-3 h-3 text-emerald-500" />
                              {property.wifiName || "Not configured"}
                           </span>
                           <span className="text-xs text-on-surface-variant font-mono italic">{property.wifiPassword || "No password set"}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right: Administrative Ledger (7/12) */}
            <div className="lg:col-span-7 space-y-14">
               <div className="flex items-end justify-between border-b border-outline-variant/10 pb-4">
                  <div className="space-y-1">
                     <h2 className="font-heading text-3xl font-light text-on-surface tracking-tight">House Ledger</h2>
                     <p className="text-[10px] font-bold tracking-widest text-on-surface! uppercase">Audit of all recent guest stays</p>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
                     {property.bookings.length} Registered
                  </span>
               </div>

               <div className="space-y-2">
                  {property.bookings.length === 0 ? (
                     <div className="py-20 text-center border-y border-dashed border-outline-variant/20">
                        <p className="text-lg font-light text-on-surface! italic font-serif">&#34;A quiet portfolio is an unmapped one.&#34;</p>
                        <p className="text-[10px] font-bold tracking-widest text-primary uppercase mt-4">Waiting for first invitation</p>
                     </div>
                  ) : (
                     property.bookings.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)).map((booking) => (
                        <div
                           key={booking.id}
                           className="group grid grid-cols-1 md:grid-cols-12 items-center gap-6 py-7 border-b border-outline-variant/10"
                        >
                           <div className="md:col-span-6 flex items-center gap-4">
                              <div className={`w-2 h-2 rounded-full ${booking.status === 'CHECKED_IN' ? 'bg-emerald-500' : 'bg-outline-variant'}`} />
                              <div className="flex flex-col min-w-0">
                                 <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-0.5">{booking.status}</span>
                                 <p className="text-xl font-medium text-on-surface tracking-tight">{booking.guestName}</p>
                                 <p className="text-xs text-on-surface-variant font-light mt-1">
                                    {new Date(booking.checkInDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} &mdash; {new Date(booking.checkOutDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                 </p>
                              </div>
                           </div>

                           <div className="md:col-span-3 flex flex-col md:items-end">
                                 <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-1">Source</span>
                                 <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{booking.source}</span>
                           </div>

                           <div className="md:col-span-3 flex flex-col md:items-end min-w-25">
                                 <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-1 whitespace-nowrap">Payout</span>
                                 <span className="text-lg font-semibold text-on-surface tabular-nums">KES {booking.totalAmount?.toLocaleString()}</span>
                           </div>
                        </div>
                     ))
                  )}
               </div>

               <div className="pt-6 border-t border-outline-variant/10">
                  <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                     <div className="space-y-3 max-w-xl">
                        <p className="text-[10px] font-bold tracking-[0.4em] text-on-surface-variant uppercase">House Etiquette</p>
                        <p className="text-base italic font-serif leading-relaxed text-on-surface-variant">
                           &#34;{property.houseRules || "Standard luxury etiquette applies. Enjoy your sanctuary."}&#34;
                        </p>
                     </div>
                     <Button variant="outline">
                        Edit Profile
                     </Button>
                  </div>
               </div>
            </div>
         </section>

      </div>
   );
}
