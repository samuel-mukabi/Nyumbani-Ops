import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, SearchCheck, Check } from "lucide-react";
import { darajaClient } from "@/lib/mpesa/daraja";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { bookings } from "@/db/schema";

export default async function DirectBookingPage({ params }: { params: Promise<{ "host-slug": string }> | { "host-slug": string } }) {
  // Await the params for Next.js 15+ compatibility
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams["host-slug"] || "demo";
  
  async function handleCheckout(formData: FormData) {
    "use server"
    const guestName = formData.get("guestName") as string;
    const mpesaNumber = formData.get("mpesaNumber") as string;
    const amount = 24000; // Hardcoded for this mockup
    
    if (guestName && mpesaNumber) {
       // 1. Trigger Daraja API
       const pushResult = await darajaClient.initiateSTKPush(
          mpesaNumber,
          amount,
          `NYO-${slug}`,
          "Direct Booking Payment"
       );
       
       const checkoutRequestId = pushResult.data?.CheckoutRequestID;

       if (checkoutRequestId) {
           // 2. Create the pending booking record so the webhook can match it
           await db.insert(bookings).values({
               propertyId: 1, // Mocked property ID since we haven't mapped the slug perfectly
               guestName,
               guestPhone: mpesaNumber,
               checkInDate: new Date("2026-04-15"),
               checkOutDate: new Date("2026-04-18"),
               source: "direct",
               status: "PENDING",
               totalAmount: amount,
               grossAmount: amount,
               checkoutRequestId,
               createdAt: new Date(),
               updatedAt: new Date(),
               currency: "KES",
           });

           // 3. Redirect back or to a pending page
           redirect(`/${slug}`);
       }
    }
  }

  return (
    <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      {/* Top minimal Nav */}
      <nav className="border-b border-gray-100 flex items-center justify-between px-6 py-4">
         <div className="font-heading italic tracking-tight font-medium">NyumbaniOps <span className="opacity-40">Direct</span></div>
         <div className="text-xs font-medium uppercase tracking-widest text-gray-500">
           Secure Checkout
         </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-[1fr_400px] gap-16 lg:gap-24">
        
        {/* Left Col: Zero-Card Property Summary */}
        <div className="space-y-12">
          <header>
             <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">You are booking</p>
             <h1 className="text-5xl lg:text-7xl font-light tracking-tight capitalize leading-none mb-6">
                {slug.replace("-", " ")}
             </h1>
          </header>
          
          <div className="aspect-[21/9] bg-gray-100 rounded-3xl overflow-hidden">
             <img 
               src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=2070&auto=format&fit=crop" 
               alt="Property placeholder" 
               className="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply"
             />
          </div>
          
          <div className="grid sm:grid-cols-2 gap-12">
             <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Your Stay</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-end border-b border-gray-100 pb-3">
                      <span className="text-3xl font-light">3 Nights</span>
                      <span className="text-sm text-gray-500 font-medium">Apr 15 - Apr 18</span>
                   </div>
                   <div className="flex justify-between items-end border-b border-gray-100 pb-3">
                      <span className="text-gray-500">Rate per night</span>
                      <span className="text-black font-medium">KES 8,000</span>
                   </div>
                   <div className="flex justify-between items-end pb-3">
                      <span className="text-gray-500 font-medium tracking-widest uppercase text-xs">Total</span>
                      <span className="text-4xl font-light">KES 24,000</span>
                   </div>
                </div>
             </div>
             <div className="bg-gray-50 p-6 rounded-2xl flex flex-col justify-center">
                 <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4 flex items-center"><SearchCheck className="w-3 h-3 mr-2" /> Verified Included</h4>
                 <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><Check className="w-3 h-3 mr-3 text-green-600" /> Digital Smart Lock Pin</li>
                    <li className="flex items-center"><Check className="w-3 h-3 mr-3 text-green-600" /> KRA eTIMS Receipt</li>
                    <li className="flex items-center"><Check className="w-3 h-3 mr-3 text-green-600" /> Secure Daraja Escrow</li>
                 </ul>
             </div>
          </div>
        </div>

        {/* Right Col: Minimal M-Pesa Checkout */}
        <div className="pt-2">
          <div className="sticky top-12 bg-white rounded-3xl border border-gray-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="mb-8">
              <h2 className="text-2xl font-light mb-2">Finalize Payment</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Pay securely via Safaricom M-Pesa. An STK Push will be sent instantly to your phone.
              </p>
            </div>
            
            <form action={handleCheckout} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="guestName" className="text-xs font-semibold tracking-widest uppercase text-gray-500">Guest Name</Label>
                <Input 
                   id="guestName" 
                   name="guestName" 
                   placeholder="e.g. John Doe" 
                   required 
                   className="h-14 bg-gray-50 border-transparent focus:bg-white text-lg rounded-xl px-4"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="mpesaNumber" className="text-xs font-semibold tracking-widest uppercase text-gray-500">M-Pesa Number</Label>
                <Input 
                   id="mpesaNumber" 
                   name="mpesaNumber" 
                   placeholder="07XX XXX XXX" 
                   type="tel" 
                   required 
                   className="h-14 bg-gray-50 border-transparent focus:bg-white text-lg font-mono tracking-widest rounded-xl px-4"
                />
              </div>
              
              <Button type="submit" className="w-full h-16 rounded-xl bg-green-600 hover:bg-green-700 text-white text-lg font-medium tracking-wide mt-4 transition-all">
                Pay KES 24,000
              </Button>
            </form>
            
            <div className="mt-8 text-center text-xs text-gray-400 uppercase tracking-widest">
               No Booking Fees
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
