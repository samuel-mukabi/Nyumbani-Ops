import { getPublicBookingDetails } from "@/lib/actions/public";
import { notFound } from "next/navigation";
import { Wifi, KeyRound, Lightbulb, PhoneCall, ChevronLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProps {
  params: Promise<{ "booking-id": string }>;
}

export default async function GuestPortalPage({ params }: PageProps) {
  const { "booking-id": bookingId } = await params;
  const booking = await getPublicBookingDetails(bookingId);

  if (!booking) {
    notFound();
  }

  const { property, unit } = booking;

  return (
    <main className="min-h-screen bg-background text-on-surface pb-24 animate-fade-in">
      
      {/* Editorial Header */}
      <section className="px-6 md:px-12 pt-12 pb-20 space-y-12 border-b border-outline-variant/10">
         <nav className="flex items-center gap-4 text-on-surface-variant">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em]">
               Digital Concierge
            </div>
         </nav>

         <div className="space-y-6 max-w-4xl">
            <h1 className="font-heading text-4xl md:text-7xl tracking-tight font-light leading-none">
               Welcome to <span className="italic font-serif">{property?.name}</span>, {booking.guestName}<span className="text-primary">.</span>
            </h1>
            <div className="flex flex-wrap items-center gap-6">
               <div className="flex items-center gap-2 text-on-surface-variant font-light">
                  <MapPin className="w-4 h-4" />
                  <span>{property?.address || "Sanctuary Location"}</span>
               </div>
               <div className="w-1 h-1 rounded-full bg-outline-variant/30" />
               <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {booking.status}
               </div>
            </div>
         </div>
      </section>

      {/* Zero-Card Utility Stacks */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 divide-y divide-outline-variant/10">
         
         {/* Access & Security */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-16 group">
            <div className="lg:col-span-4 space-y-2">
               <div className="flex items-center gap-3 text-primary">
                  <KeyRound className="w-4 h-4" />
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em]">Entry & Access</h2>
               </div>
               <p className="text-sm text-on-surface-variant font-light">Secure code for your unit's smart lock.</p>
            </div>
            <div className="lg:col-span-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
               <div className="space-y-1">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Active Access Code</p>
                  <div className="flex items-baseline gap-4">
                     <span className="text-5xl md:text-7xl font-mono font-bold tracking-tighter text-on-surface">
                        748291
                     </span>
                     <span className="text-xs text-on-surface-variant font-light italic">Valid until checkout</span>
                  </div>
               </div>
               <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Unit Assigned</span>
                  <span className="text-xl font-medium">{unit?.name || "Premium Unit"}</span>
                  <span className="text-xs text-on-surface-variant font-light">{unit?.unitCode}</span>
               </div>
            </div>
         </div>

         {/* Connectivity */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-16 group">
            <div className="lg:col-span-4 space-y-2">
               <div className="flex items-center gap-3 text-primary">
                  <Wifi className="w-4 h-4" />
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em]">Connectivity</h2>
               </div>
               <p className="text-sm text-on-surface-variant font-light">High-speed sanctuary network.</p>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-4">
                  <div>
                     <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Network SSID</p>
                     <p className="text-2xl font-light">{property?.wifiName || "Sanctuary_5G"}</p>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/10">
                     <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Password</p>
                     <p className="text-2xl font-mono font-medium tracking-wide">{property?.wifiPassword || "hospitality_plus"}</p>
                  </div>
               </div>
               <div className="flex items-end">
                  <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex-1">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-2">Network Status</p>
                     <p className="text-sm font-light leading-relaxed">Stable 5G Connection verified for streaming and remote work.</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Utilities & Payouts */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-16 group">
            <div className="lg:col-span-4 space-y-2">
               <div className="flex items-center gap-3 text-primary">
                  <Lightbulb className="w-4 h-4" />
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em]">Sanctuary Utilities</h2>
               </div>
               <p className="text-sm text-on-surface-variant font-light">KPLC Prepaid Power management.</p>
            </div>
            <div className="lg:col-span-8 flex flex-col md:flex-row md:items-center justify-between gap-8 py-8 bg-surface-container-low/50 px-8 rounded-3xl border border-outline-variant/5">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest italic">KPLC Prepaid Meter</p>
                  <div className="flex items-baseline gap-4">
                     <span className="text-4xl font-light tabular-nums">14.2<span className="text-xl ml-1 text-on-surface-variant uppercase font-bold tracking-widest">kWh</span></span>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Heathy Balance</span>
                  </div>
               </div>
               <Button variant="outline" className="h-12 px-8 rounded-xl border-outline-variant/30 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">
                  Request Top-up
               </Button>
            </div>
         </div>

         {/* Support */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-16 group">
            <div className="lg:col-span-4 space-y-2">
               <div className="flex items-center gap-3 text-primary">
                  <PhoneCall className="w-4 h-4" />
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em]">Personal Support</h2>
               </div>
               <p className="text-sm text-on-surface-variant font-light">Direct line to your sanctuary host.</p>
            </div>
            <div className="lg:col-span-8 flex flex-col sm:flex-row gap-4">
               <Link href="https://wa.me/254700000000" target="_blank" className="flex-1">
                  <Button className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-600/20 font-bold tracking-widest uppercase text-[10px]">
                     WhatsApp Support
                  </Button>
               </Link>
               <Button variant="outline" className="flex-1 h-16 rounded-2xl border-outline-variant/20 font-bold tracking-widest uppercase text-[10px]">
                  Emergency Call
               </Button>
            </div>
         </div>

      </section>

      {/* Footer Branding */}
      <footer className="pt-24 px-6 md:px-12 text-center">
         <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-on-surface-variant italic">Managed with Nyumbani-Ops</span>
            <div className="h-px w-12 bg-outline-variant/20" />
         </div>
      </footer>

    </main>
  );
}
