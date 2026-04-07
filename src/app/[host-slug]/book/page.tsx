import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

export default function DirectBookingPage({ params }: { params: { "host-slug": string } }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
        
        {/* Left Col: Property Summary */}
        <div className="space-y-6">
          <div>
             <h1 className="text-4xl font-bold tracking-tight text-gray-900 capitalize">
                {params["host-slug"].replace("-", " ")}
             </h1>
             <p className="text-gray-500 mt-2 text-lg">Direct Booking Portal</p>
          </div>
          
          <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-sm">
             <img 
               src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=2070&auto=format&fit=crop" 
               alt="Property placeholder" 
               className="w-full h-full object-cover"
             />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="font-semibold text-lg border-b pb-2 mb-4">Stay Summary</h3>
             <div className="space-y-3 text-gray-600">
               <div className="flex justify-between">
                 <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Dates</span>
                 <span className="font-medium text-gray-900">Apr 15 - Apr 18 (3 nights)</span>
               </div>
               <div className="flex justify-between">
                 <span>Rate per night</span>
                 <span>KES 8,000</span>
               </div>
               <div className="flex justify-between pt-3 border-t">
                 <span className="font-semibold text-gray-900">Total</span>
                 <span className="font-bold text-lg text-green-600">KES 24,000</span>
               </div>
             </div>
          </div>
        </div>

        {/* Right Col: M-Pesa Checkout */}
        <div>
          <Card className="shadow-lg border-green-100 border-t-4 border-t-green-500">
            <CardHeader>
              <CardTitle className="text-2xl">Confirm Booking</CardTitle>
              <CardDescription>
                Pay securely via Safaricom M-Pesa to instantly confirm your reservation and receive your smart lock code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guestName">Full Name</Label>
                <Input id="guestName" placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mpesaNumber">M-Pesa Phone Number</Label>
                <Input id="mpesaNumber" placeholder="07XXXXXXXX or 2547XXXXXXXX" type="tel" />
                <p className="text-xs text-gray-500">You will receive an STK Push on this number.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg h-12">
                Pay KES 24,000
              </Button>
            </CardFooter>
          </Card>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p className="mb-2">🔒 Secure check-in powered by NyumbaniOps</p>
            <p>Your KRA eTIMS receipt will be sent to your WhatsApp after payment.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
