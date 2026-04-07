"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createPropertyAction } from "@/lib/actions/properties";

export default function AddPropertyDialog() {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    try {
      await createPropertyAction(formData);
      setOpen(false);
    } catch (error) {
      console.error("Failed to create property", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Add Property</Button>} />
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Enter the details for your new listing. These will be used for guest portals and automation.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name</Label>
            <Input id="name" name="name" placeholder="e.g. Sunset Villa 1A" required minLength={2} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Location / Address</Label>
            <Input id="address" name="address" placeholder="e.g. Westlands, Nairobi" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kplcMeterNumber">KPLC Meter</Label>
              <Input id="kplcMeterNumber" name="kplcMeterNumber" placeholder="0123XXXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="airbnbIcalUrl">Airbnb iCal URL</Label>
              <Input id="airbnbIcalUrl" name="airbnbIcalUrl" placeholder="https://..." type="url" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wifiName">Wi-Fi Name</Label>
              <Input id="wifiName" name="wifiName" placeholder="SSID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wifiPassword">Wi-Fi Password</Label>
              <Input id="wifiPassword" name="wifiPassword" placeholder="Password" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="houseRules">House Rules</Label>
            <Textarea id="houseRules" name="houseRules" placeholder="Don't be shy..." />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Property</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
