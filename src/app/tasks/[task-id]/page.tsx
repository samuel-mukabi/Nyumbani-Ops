import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Camera, CheckCircle } from "lucide-react";

export default async function StaffTaskPage({ params }: { params: Promise<{ "task-id": string }> }) {
  const resolvedParams = await params;
  const taskId = resolvedParams["task-id"];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Mobile App Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <h1 className="text-xl font-bold tracking-tight">Turnover Task</h1>
        <p className="text-blue-100 text-sm mt-1">ID: {taskId}</p>
      </div>

      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-semibold text-orange-600 flex items-center">
               In Progress
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Expected Payout</p>
            <p className="font-bold text-gray-900">KES 1,200</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Cleaning Checklist</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                <div className="flex items-start space-x-3 p-4">
                  <Checkbox id="task1" />
                  <div className="grid leading-none pt-0.5">
                    <Label htmlFor="task1" className="text-base font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Change bed linens & wash old
                    </Label>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4">
                  <Checkbox id="task2" />
                  <div className="grid leading-none pt-0.5">
                    <Label htmlFor="task2" className="text-base font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Wipe all kitchen surfaces
                    </Label>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4">
                  <Checkbox id="task3" />
                  <div className="grid leading-none pt-0.5">
                    <Label htmlFor="task3" className="text-base font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Sweep and mop all floors
                    </Label>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4">
                  <Checkbox id="task4" />
                  <div className="grid leading-none pt-0.5">
                    <Label htmlFor="task4" className="text-base font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Empty all trash bins
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Verification Photos</h2>
          <p className="text-sm text-gray-500 mb-4">Upload a photo of the main bedroom and living room to complete the task.</p>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <Camera className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 font-medium">Add Photo</span>
            </button>
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative border">
               <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop" alt="Uploaded" className="w-full h-full object-cover" />
               <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-sm">
                 <CheckCircle className="h-4 w-4" />
               </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700">
            Submit task for Approval
          </Button>
          <p className="text-center text-xs text-gray-500 mt-3">
             Your M-Pesa payout will be sent automatically once the host approves.
          </p>
        </div>
      </div>
    </div>
  );
}
