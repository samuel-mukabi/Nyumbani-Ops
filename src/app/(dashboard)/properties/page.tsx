import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import AddPropertyDialog from "@/components/properties/AddPropertyDialog";
import { getPropertiesAction } from "@/lib/actions/properties";
import { Building2 } from "lucide-react";

export default async function PropertiesPage() {
  const properties = await getPropertiesAction();

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Header Narrative */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-outline-variant/30 pb-8">
        <div className="max-w-2xl">
          <h1 className="text-5xl lg:text-7xl font-bold font-heading text-foreground mb-4 tracking-tighter">
            Your <span className="text-primary italic font-serif">Properties.</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-light leading-relaxed">
            Manage your locations, track lock access, and oversee all active properties.
          </p>
        </div>
        <div className="flex-shrink-0">
            <AddPropertyDialog />
        </div>
      </div>

      {/* Zero-Card Data Presentation */}
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
              <Building2 className="w-6 h-6 text-primary" />
              Active Locations
            </h2>
            <span className="text-xs font-bold uppercase tracking-widest text-outline">
                {properties.length} Total
            </span>
        </div>

        <div className="overflow-x-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm">
          <Table>
            <TableHeader className="bg-surface-container-low/50">
              <TableRow className="border-b border-outline-variant/20 hover:bg-transparent">
                <TableHead className="py-5 font-semibold text-on-surface">Property Name</TableHead>
                <TableHead className="py-5 font-semibold text-on-surface">Location</TableHead>
                <TableHead className="py-5 font-semibold text-on-surface">Power Meter</TableHead>
                <TableHead className="py-5 font-semibold text-on-surface">Status</TableHead>
                <TableHead className="text-right py-5 font-semibold text-on-surface">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-16">
                    <p className="text-on-surface-variant mb-2">No properties found.</p>
                    <p className="text-sm font-light italic">Add your first location to start managing.</p>
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property) => (
                  <TableRow key={property.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/30 transition-colors">
                    <TableCell className="py-5 font-medium text-foreground">{property.name}</TableCell>
                    <TableCell className="py-5 text-on-surface-variant">{property.address || "—"}</TableCell>
                    <TableCell className="py-5 font-mono text-sm text-on-surface-variant">{property.kplcMeterNumber || "—"}</TableCell>
                    <TableCell className="py-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="py-5 text-right">
                      <Button variant="ghost" size="sm" className="text-on-surface-variant hover:text-primary transition-colors">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
