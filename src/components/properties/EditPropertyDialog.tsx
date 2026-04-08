"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
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
import { updatePropertyAction } from "@/lib/actions/properties";

type PropertyItem = {
  id: number;
  name: string;
  address: string | null;
  area: string | null;
  sharedWifiRouterId: string | null;
  securityContact: string | null;
  airbnbIcalUrl: string | null;
  wifiName: string | null;
  wifiPassword: string | null;
  houseRules: string | null;
};

export default function EditPropertyDialog({ property }: { property: PropertyItem }) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    try {
      await updatePropertyAction(formData);
      setOpen(false);
    } catch (error) {
      console.error("Failed to update property", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="text-on-surface-variant hover:text-primary">
            <Pencil className="w-3.5 h-3.5 mr-2" />
            Edit
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[560px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>
            Update operational and guest-support details for this property.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 py-4">
          <input type="hidden" name="id" value={property.id} />

          <div className="space-y-2">
            <Label htmlFor={`name-${property.id}`}>Property Name</Label>
            <Input
              id={`name-${property.id}`}
              name="name"
              defaultValue={property.name}
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`address-${property.id}`}>Location / Address</Label>
            <Input
              id={`address-${property.id}`}
              name="address"
              defaultValue={property.address ?? ""}
              placeholder="e.g. Westlands, Nairobi"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`area-${property.id}`}>Area</Label>
              <Input
                id={`area-${property.id}`}
                name="area"
                defaultValue={property.area ?? ""}
                placeholder="e.g. Kilimani"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`securityContact-${property.id}`}>Security Contact</Label>
              <Input
                id={`securityContact-${property.id}`}
                name="securityContact"
                defaultValue={property.securityContact ?? ""}
                placeholder="07..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`sharedWifiRouterId-${property.id}`}>Shared Wi-Fi Router ID</Label>
            <Input
              id={`sharedWifiRouterId-${property.id}`}
              name="sharedWifiRouterId"
              defaultValue={property.sharedWifiRouterId ?? ""}
              placeholder="Router serial / asset ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`airbnbIcalUrl-${property.id}`}>Airbnb iCal URL</Label>
            <Input
              id={`airbnbIcalUrl-${property.id}`}
              name="airbnbIcalUrl"
              type="url"
              defaultValue={property.airbnbIcalUrl ?? ""}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`wifiName-${property.id}`}>Wi-Fi Name</Label>
              <Input
                id={`wifiName-${property.id}`}
                name="wifiName"
                defaultValue={property.wifiName ?? ""}
                placeholder="SSID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`wifiPassword-${property.id}`}>Wi-Fi Password</Label>
              <Input
                id={`wifiPassword-${property.id}`}
                name="wifiPassword"
                defaultValue={property.wifiPassword ?? ""}
                placeholder="Password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`houseRules-${property.id}`}>House Rules</Label>
            <Textarea
              id={`houseRules-${property.id}`}
              name="houseRules"
              defaultValue={property.houseRules ?? ""}
              placeholder="Quiet hours, smoking policy, check-out notes..."
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
