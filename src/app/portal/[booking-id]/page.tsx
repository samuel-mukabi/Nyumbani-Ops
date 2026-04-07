import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, KeyRound, Lightbulb, UserCheck, PhoneCall } from "lucide-react";

export default function GuestPortalPage({ params }: { params: { "booking-id": string } }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <HomeIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome to Sunset Villa!</h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
             Here is everything you need for your stay. You can access this portal at any time.
          </p>
        </div>

        {/* Essential Info Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          
          <Card className="border-t-4 border-t-yellow-500 shadow-sm">
            <CardHeader className="pb-3">
               <CardTitle className="flex items-center text-lg">
                 <KeyRound className="w-5 h-5 mr-2 text-yellow-500"/> Smart Lock Access
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="bg-gray-100 rounded-md p-4 text-center">
                 <span className="text-3xl font-mono tracking-widest font-bold text-gray-900">748291</span>
               </div>
               <p className="text-xs text-center text-gray-500 mt-2">Active until 10:00 AM on checkout day.</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-blue-500 shadow-sm">
             <CardHeader className="pb-3">
               <CardTitle className="flex items-center text-lg">
                 <Wifi className="w-5 h-5 mr-2 text-blue-500"/> Wi-Fi Details
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div>
                  <p className="text-sm text-gray-500">Network Name (SSID)</p>
                  <p className="font-semibold text-lg">Sunset_Villa_5G</p>
               </div>
               <div>
                  <p className="text-sm text-gray-500">Password</p>
                  <p className="font-mono font-medium tracking-wide">relax12345</p>
               </div>
             </CardContent>
          </Card>

        </div>

        {/* Actions & Upsells */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 pt-4">Stay Utilities</h3>
          
          <Card>
            <CardContent className="flex flex-col sm:flex-row items-center justify-between p-6">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                  <Lightbulb className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">KPLC Power Tokens</h4>
                  <p className="text-sm text-gray-500">Current status: Normal</p>
                </div>
              </div>
              <Button variant="outline">Request Top-Up</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col sm:flex-row items-center justify-between p-6">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <PhoneCall className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Host Communication</h4>
                  <p className="text-sm text-gray-500">WhatsApp us for direct assistance</p>
                </div>
              </div>
              <Button>Message on WhatsApp</Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

function HomeIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
