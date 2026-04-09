import { getPublicPropertyDetails } from "@/lib/actions/public";
import { notFound } from "next/navigation";
import { PropertyCalendar } from "@/components/PropertyCalendar";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicPropertyPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await getPublicPropertyDetails(slug);

  if (!property) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-on-surface selection:bg-primary/20">
      
      {/* Editorial Hero */}
      <section className="relative h-[70vh] w-full flex flex-col justify-end px-6 md:px-12 pb-16 overflow-hidden">
         <div className="absolute inset-0 bg-neutral-900/40 z-10" />
         {/* Placeholder for real property image engine */}
         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-20" />
         
         <div className="relative z-30 space-y-6 max-w-5xl animate-fade-in-up">
            <div className="flex items-center gap-2 text-primary">
               <Star className="w-5 h-5 fill-primary" />
               <span className="text-xs font-bold tracking-[0.3em] uppercase">Premium Sanctuary</span>
            </div>
            <h1 className="font-heading text-5xl md:text-8xl tracking-tight font-light leading-none">
               {property.name}<span className="text-primary italic font-serif">.</span>
            </h1>
            <div className="flex flex-wrap items-center gap-6 pt-4">
               <div className="flex items-center gap-2 text-on-surface-variant font-light">
                  <MapPin className="w-4 h-4" />
                  <span>{property.address}</span>
               </div>
               <div className="w-1 h-1 rounded-full bg-on-surface-variant/30" />
               <div className="text-on-surface-variant font-light uppercase tracking-widest text-xs">
                  {property.slug}
               </div>
            </div>
         </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-20">
         
         {/* Left: Narrative & Rules (7/12) */}
         <div className="lg:col-span-7 space-y-24">
            
            <section className="space-y-10">
               <h2 className="text-xs font-bold tracking-[0.4em] uppercase text-primary border-b border-outline-variant/10 pb-4">
                  The Experience
               </h2>
               <p className="text-xl md:text-2xl font-light leading-relaxed text-on-surface-variant max-w-2xl font-serif italic">
                  "Designed for those who seek precision in comfort. Every corner reflects our commitment to seamless hospitality and architectural silence."
               </p>
            </section>

            <section className="space-y-12">
               <div className="flex items-center gap-4">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  <h3 className="text-2xl font-light tracking-tight">House Etiquette</h3>
               </div>
               <div className="prose prose-neutral max-w-none">
                  <p className="text-lg text-on-surface-variant font-light leading-relaxed whitespace-pre-line">
                     {property.houseRules || "Standard luxury etiquette applies. Enjoy your sanctuary with respect for the design and the neighborhood."}
                  </p>
               </div>
            </section>
         </div>

         {/* Right: Availability & Booking CTA (5/12) */}
         <div className="lg:col-span-12 xl:col-span-5 relative">
            <div className="lg:sticky lg:top-32 space-y-12">
               
               <div className="p-8 md:p-12 bg-surface-container-low rounded-[2rem] border border-outline-variant/10 space-y-10 shadow-2xl shadow-primary/5">
                  <div className="space-y-2 border-b border-outline-variant/10 pb-6">
                     <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-on-surface-variant">Live Availability</p>
                     <h3 className="text-3xl font-light tracking-tight">Reserve your stay</h3>
                  </div>

                  <div className="py-4">
                     <PropertyCalendar occupiedSlots={property.occupiedSlots} />
                  </div>

                  <div className="pt-6">
                     <Link href={`/${property.slug}/book`}>
                        <Button className="w-full h-16 rounded-2xl text-lg font-bold group bg-primary hover:bg-primary-hover text-on-primary border-none shadow-xl shadow-primary/20 transition-all duration-500">
                           Initialize Booking
                           <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
                        </Button>
                     </Link>
                     <p className="text-center text-[10px] text-on-surface-variant mt-6 font-bold uppercase tracking-[0.2em]">
                        Secure payment powered by Safaricom Daraja
                     </p>
                  </div>
               </div>

               <div className="px-8 flex items-center justify-between text-on-surface-variant">
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] font-bold uppercase tracking-widest">Support</span>
                     <span className="text-xs">+254 700 000 000</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className="text-[10px] font-bold uppercase tracking-widest">Managed by</span>
                     <span className="text-xs font-serif italic text-primary">Nyumbani Operations</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </main>
  );
}
