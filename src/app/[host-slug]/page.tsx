import { getPublicPropertyDetails } from "@/lib/actions/public";
import { PropertyCalendar } from "@/components/PropertyCalendar";
import { Button } from "@/components/ui/button";
import { ChevronRight, Wifi, ShieldCheck, CreditCard, Key } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PropertyPage({ params }: { params: Promise<{ "host-slug": string }> | { "host-slug": string } }) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams["host-slug"];
  
  if (!slug) notFound();

  const data = await getPublicPropertyDetails(slug);

  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#fafafa] selection:bg-black selection:text-white">
      {/* Editorial Header */}
      <section className="px-6 pt-16 pb-12 max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-gray-400">Exclusive Stay</p>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-black lowercase leading-none">
            {data.name}
          </h1>
          <p className="text-lg text-gray-400 font-light max-w-md">
            A boutique experience curated by NyumbaniOps. Minimalist living with automated ease.
          </p>
        </div>
        
        <div className="flex flex-col items-start gap-4">
           <Link href={`/${data.slug}/book`}>
              <button className="px-8 py-4 bg-black text-white rounded-full text-sm font-medium hover:scale-105 transition-transform flex items-center group">
                Reserve Property
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
           </Link>
           <p className="text-[10px] text-gray-300 uppercase tracking-widest pl-2">Instant Confirmation</p>
        </div>
      </section>

      {/* Hero Image - Immersive Editorial Style */}
      <section className="px-6 mb-24">
        <div className="max-w-7xl mx-auto h-[60vh] md:h-[80vh] bg-gray-100 rounded-3xl overflow-hidden relative shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=2070&auto=format&fit=crop" 
            alt={data.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-8 left-8 bg-white/20 backdrop-blur-md rounded-full px-6 py-2 border border-white/30 text-white text-xs">
            {data.address}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-16 pb-32">
        {/* About & Amenities */}
        <div className="md:col-span-7 space-y-16">
          <div className="space-y-6">
            <h3 className="text-xs font-medium tracking-widest uppercase text-gray-400">The Space</h3>
            <p className="text-2xl text-gray-800 leading-relaxed font-light italic">
              "Every corner of {data.name} is designed with a focus on tranquility and digital harmony. From our automated check-in to our seamless M-Pesa payments, your stay is defined by what you don't have to carry."
            </p>
            <div className="pt-4 text-gray-500 space-y-4">
              <p>{data.houseRules}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-black">
                <Wifi className="w-5 h-5 stroke-1" />
                <span className="text-sm font-medium">Connectivity</span>
              </div>
              <p className="text-xs text-gray-400">{data.wifiName} • Fiber Optics ready for work or leisure.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-black">
                <Key className="w-5 h-5 stroke-1" />
                <span className="text-sm font-medium">Digital Access</span>
              </div>
              <p className="text-xs text-gray-400">Integrated TTLock smart security. No physical keys, no hassle.</p>
            </div>
          </div>
        </div>

        {/* Availability Calendar - The Heart of the Page */}
        <div className="md:col-span-5">
          <div className="sticky top-12 p-10 bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-gray-50 space-y-8">
            <div className="space-y-2">
              <h3 className="text-lg font-medium tracking-tight text-black italic">Live Availability</h3>
              <p className="text-xs text-gray-400">Real-time sync with Airbnb and Direct calendars.</p>
            </div>
            
            <PropertyCalendar occupiedSlots={data.occupiedSlots} />
            
            <div className="pt-6 border-t border-gray-50 space-y-4">
              <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-400">Starting from</span>
                 <span className="font-semibold text-black">KES 8,500 / night</span>
              </div>
              <Link href={`/${data.slug}/book`} className="block">
                <Button className="w-full bg-black text-white h-14 rounded-2xl hover:bg-gray-900 transition-all font-medium">
                  Instant M-Pesa Booking
                </Button>
              </Link>
              <p className="text-center text-[10px] text-gray-300">Secured with E-TIMS & M-Pesa</p>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative Footer */}
      <footer className="bg-black py-32 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center space-y-8 text-center">
            <h2 className="text-3xl font-light text-white/90 italic tracking-tight">NyumbaniOps</h2>
            <div className="h-px w-24 bg-white/10" />
            <p className="text-xs text-white/30 uppercase tracking-[0.4em]">Digital Concierge For Modern Stays</p>
        </div>
      </footer>
    </main>
  );
}
