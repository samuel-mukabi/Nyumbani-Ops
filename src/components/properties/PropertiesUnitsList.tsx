"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Pencil } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { updateUnitAction } from "@/lib/actions/properties";

type OwnerOption = {
  id: number;
  fullName: string;
};

type UnitRow = {
  id: number;
  ownerId: number | null;
  unitCode: string | null;
  name: string;
  listingUrl: string | null;
  status: string;
  ownerName: string;
};

type PropertyRow = {
  id: number;
  name: string;
  address: string | null;
  area: string | null;
  units: UnitRow[];
  [key: string]: any;
};

function EditUnitDialog({ unit, owners }: { unit: UnitRow; owners: OwnerOption[] }) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    try {
      await updateUnitAction(formData);
      setOpen(false);
    } catch (error) {
      console.error("Failed to update unit", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="h-8 px-2 text-on-surface-variant hover:text-primary">
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Unit</DialogTitle>
          <DialogDescription>Update assignment and listing details for this unit.</DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 py-3">
          <input type="hidden" name="id" value={unit.id} />

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`status-${unit.id}`}>Status</Label>
              <select
                id={`status-${unit.id}`}
                name="status"
                defaultValue={unit.status}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`name-${unit.id}`}>Unit Name</Label>
            <Input id={`name-${unit.id}`} name="name" defaultValue={unit.name} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`ownerId-${unit.id}`}>Owner</Label>
            <select
              id={`ownerId-${unit.id}`}
              name="ownerId"
              defaultValue={unit.ownerId ?? ""}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Unassigned</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`listingUrl-${unit.id}`}>Listing URL</Label>
            <Input
              id={`listingUrl-${unit.id}`}
              name="listingUrl"
              type="url"
              placeholder="https://..."
              defaultValue={unit.listingUrl ?? ""}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Unit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function PropertiesUnitsList({
  properties,
  owners,
}: {
  properties: PropertyRow[];
  owners: OwnerOption[];
}) {
  const [openIds, setOpenIds] = useState<number[]>([]);
  const openSet = useMemo(() => new Set(openIds), [openIds]);

  const toggleProperty = (propertyId: number) => {
    setOpenIds((prev) =>
      prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
    );
  };

  return (
    <div className="border-y border-outline-variant/20">
      {properties.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-on-surface-variant">No properties found.</p>
          <p className="text-sm font-light italic mt-2">Add your first location to start managing units.</p>
        </div>
      ) : (
        properties.map((property) => {
          const isOpen = openSet.has(property.id);
          return (
            <div key={property.id} className="border-b border-outline-variant/10">
              <button
                type="button"
                onClick={() => toggleProperty(property.id)}
                className="w-full px-0 py-6 text-left hover:bg-surface-container-low/20 transition-colors"
              >
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-5 flex items-center gap-3">
                    {isOpen ? <ChevronDown className="w-4 h-4 text-on-surface-variant" /> : <ChevronRight className="w-4 h-4 text-on-surface-variant" />}
                    <div>
                      <p className="font-medium text-on-surface">{property.name}</p>
                      <p className="text-xs text-on-surface-variant">{property.address || "No location added"}</p>
                    </div>
                  </div>
                  <div className="col-span-3 text-sm text-on-surface-variant">{property.area || "—"}</div>
                  <div className="col-span-2 text-sm text-on-surface-variant">{property.units.length} units</div>
                  <div className="col-span-2 text-right text-[10px] font-bold uppercase tracking-widest text-primary">
                    {isOpen ? "Hide units" : "View units"}
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="pb-6">
                  {property.units.length === 0 ? (
                    <div className="py-6 text-sm text-on-surface-variant">No units mapped to this property yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[860px] text-sm">
                        <thead>
                          <tr className="border-y border-outline-variant/10 text-on-surface-variant">
                            <th className="px-2 py-3 text-left font-semibold">Unit Name</th>
                            <th className="px-2 py-3 text-left font-semibold">Owner</th>
                            <th className="px-2 py-3 text-left font-semibold">Status</th>
                            <th className="px-2 py-3 text-left font-semibold">Listing URL</th>
                            <th className="px-2 py-3 text-right font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {property.units.map((unit) => (
                            <tr key={unit.id} className="border-b border-outline-variant/10">
                              <td className="px-2 py-4">{unit.name}</td>
                              <td className="px-2 py-4 text-on-surface-variant">{unit.ownerName}</td>
                              <td className="px-2 py-4 capitalize text-on-surface-variant">{unit.status}</td>
                              <td className="px-2 py-4 text-on-surface-variant truncate max-w-[220px]">
                                {unit.listingUrl ? "Configured" : "—"}
                              </td>
                              <td className="px-2 py-4 text-right">
                                <EditUnitDialog unit={unit} owners={owners} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
