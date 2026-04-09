import AddPropertyDialog from "@/components/properties/AddPropertyDialog";
import { getPropertiesWithUnitsAction } from "@/lib/actions/properties";
import PropertiesUnitsList from "@/components/properties/PropertiesUnitsList";
import { Building2 } from "lucide-react";

export default async function PropertiesPage() {
  const { properties, owners } = await getPropertiesWithUnitsAction();

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
        <div className="shrink-0">
            <AddPropertyDialog />
        </div>
      </div>

      {/* Zero-Card Data Presentation */}
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
              <Building2 className="w-6 h-6 text-primary" />
              Properties & Units
            </h2>
            <span className="text-xs font-bold uppercase tracking-widest text-outline">
                {properties.length} Total
            </span>
        </div>
        <PropertiesUnitsList properties={properties} owners={owners} />
      </div>
    </div>
  );
}
