"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, ChevronRight, ChevronLeft, MapPin, Building2, User, Phone, CalendarDays } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type MultiStepBookingFormProps = {
  properties: any[];
  units: any[];
  organizationId: number;
};

export function MultiStepBookingForm({ properties, units, organizationId }: MultiStepBookingFormProps) {
  const [step, setStep] = useState(1);
  const [propertyId, setPropertyId] = useState<number | null>(null);
  const [unitId, setUnitId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const filteredUnits = units.filter((u) => u.buildingId === propertyId);
  const selectedProperty = properties.find((p) => p.id === propertyId);
  const selectedUnit = units.find((u) => u.id === unitId);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/webhooks/mpesa/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          unitId,
          organizationId,
          guestName,
          guestPhone,
          checkInDate: dateRange?.from,
          checkOutDate: dateRange?.to,
        }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        alert("Failed to send prompt.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full relative animate-fade-in pb-20 mt-8">
      <div className="flex items-center gap-2 mb-16 max-w-xl">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-px bg-outline-variant/30 overflow-hidden relative">
            <div
              className={cn("absolute left-0 top-0 h-full bg-primary transition-all duration-500 ease-in-out", {
                "w-full": step >= i,
                "w-0": step < i,
              })}
            />
          </div>
        ))}
      </div>

      <div className="relative min-h-[400px]">
        {/* Step 1: Property */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 absolute inset-0">
            <h2 className="text-5xl md:text-7xl font-bold font-heading tracking-tighter mb-12">
              Select <span className="text-primary italic font-serif">Property.</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-12">
              {properties.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => {
                    setPropertyId(prop.id);
                    setUnitId(null);
                  }}
                  className={cn(
                    "group flex flex-col text-left transition-all border-b pb-8",
                    propertyId === prop.id
                      ? "border-primary"
                      : "border-outline-variant/20 hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-4">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant group-hover:text-primary transition-colors">
                      {prop.area || "Location"}
                    </span>
                    {propertyId === prop.id && <Check className="w-4 h-4 text-primary" />}
                  </div>
                  <span className="font-semibold text-3xl tracking-tight group-hover:translate-x-1 transition-transform">{prop.name}</span>
                  <span className="text-base text-on-surface-variant font-light mt-2 max-w-sm">
                    {prop.address}
                  </span>
                </button>
              ))}
            </div>
            {properties.length === 0 && (
              <p className="text-on-surface-variant italic text-xl">No properties configured for your organization.</p>
            )}
            <div className="absolute bottom-0 right-0 pt-8 flex justify-end w-full">
              <Button 
                disabled={!propertyId} 
                onClick={handleNext} 
                className="rounded-full px-12 h-14 font-bold text-base bg-black text-white transition-all hover:scale-[1.02] shadow-xl hover:shadow-black/10"
              >
                Continue <ChevronRight className="w-5 h-5 ml-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Unit */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 absolute inset-0">
            <div className="mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-2">Available units for {selectedProperty?.name}</p>
              <h2 className="text-5xl md:text-7xl font-bold font-heading tracking-tighter">
                Select <span className="text-primary italic font-serif">Unit.</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {filteredUnits.length > 0 ? (
                filteredUnits.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => setUnitId(unit.id)}
                    className={cn(
                      "group flex flex-col text-left transition-all border-b pb-6",
                      unitId === unit.id
                        ? "border-primary"
                        : "border-outline-variant/20 hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors">
                        {unit.unitCode}
                      </span>
                      {unitId === unit.id && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <span className="font-semibold text-xl tracking-tight group-hover:translate-x-1 transition-transform">{unit.name}</span>
                  </button>
                ))
              ) : (
                <div className="col-span-full py-12 border-y border-outline-variant/10">
                   <p className="text-xl text-on-surface-variant font-light italic">No individual units discovered for this property. If this is a standalone stay, please proceed.</p>
                </div>
              )}
            </div>
            <div className="absolute bottom-0 left-0 pt-8 flex justify-between w-full bg-background/80 backdrop-blur-sm border-t border-outline-variant/10">
              <Button variant="outline" onClick={handleBack} className="rounded-full px-10 h-14 border-outline-variant/30 font-semibold text-base transition-all hover:bg-surface-container">
                <ChevronLeft className="w-5 h-5 mr-3" /> Back
              </Button>
              <Button 
                disabled={!unitId && filteredUnits.length > 0} 
                onClick={handleNext} 
                className="rounded-full px-12 h-14 font-bold text-base bg-black text-white transition-all hover:scale-[1.02] shadow-xl hover:shadow-black/10"
              >
                Continue <ChevronRight className="w-5 h-5 ml-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Dates */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 absolute inset-0 flex flex-col">
            <h2 className="text-5xl md:text-7xl font-bold font-heading tracking-tighter mb-12">
              Select <span className="text-primary italic font-serif">Dates.</span>
            </h2>
            <div className="flex-1 flex justify-center -ml-4">
              <DayPicker
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                disabled={[{ before: new Date() }]}
                className="p-0 border-none shadow-none font-sans"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-8 sm:space-x-12 sm:space-y-0",
                  month: "space-y-8",
                  caption: "flex justify-center pt-1 relative items-center mb-8",
                  caption_label: "text-2xl font-semibold tracking-tight",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                    "h-10 w-10 bg-transparent p-0 opacity-50 hover:opacity-100 transition-all border border-outline-variant/20 rounded-full flex items-center justify-center hover:bg-surface-container"
                  ),
                  nav_button_previous: "absolute left-2",
                  nav_button_next: "absolute right-2",
                  table: "w-full border-collapse",
                  head_row: "flex mb-4",
                  head_cell: "text-on-surface-variant font-medium w-14 text-xs uppercase tracking-[0.2em]",
                  row: "flex w-full mt-1",
                  cell: "h-14 w-14 text-center text-base p-0 relative focus-within:relative focus-within:z-20",
                  day: cn(
                    "h-14 w-14 p-0 font-light aria-selected:opacity-100 hover:bg-primary/5 rounded-full transition-all flex items-center justify-center text-lg"
                  ),
                  day_range_start: "bg-black text-white rounded-full font-medium hover:bg-black",
                  day_range_end: "bg-black text-white rounded-full font-medium hover:bg-black",
                  day_selected: "bg-black text-white hover:bg-black hover:text-white rounded-full",
                  day_today: "border-2 border-primary/20 text-primary font-bold",
                  day_outside: "text-outline-variant opacity-30",
                  day_disabled: "text-outline-variant opacity-10 line-through",
                  day_range_middle: "bg-primary/5 text-primary rounded-none",
                  day_hidden: "invisible",
                }}
              />
            </div>
            <div className="absolute bottom-0 left-0 pt-8 flex justify-between w-full bg-background/80 backdrop-blur-sm border-t border-outline-variant/10">
              <Button variant="outline" onClick={handleBack} className="rounded-full px-10 h-14 border-outline-variant/30 font-semibold text-base transition-all hover:bg-surface-container">
                <ChevronLeft className="w-5 h-5 mr-3" /> Back
              </Button>
              <Button 
                disabled={!dateRange?.from || !dateRange?.to} 
                onClick={handleNext} 
                className="rounded-full px-12 h-14 font-bold text-base bg-black text-white transition-all hover:scale-[1.02] shadow-xl hover:shadow-black/10"
              >
                Continue <ChevronRight className="w-5 h-5 ml-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Guest Details */}
        {step === 4 && !success && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 absolute inset-0">
            <h2 className="text-3xl font-light tracking-tight mb-8">Guest Details</h2>
            
            <div className="border-y border-outline-variant/15 py-6 mb-8 space-y-2 max-w-xl">
              <h3 className="font-semibold text-xs uppercase tracking-widest text-on-surface-variant flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Selected Stay</h3>
              <p className="font-medium text-lg text-foreground">
                {dateRange?.from && format(dateRange.from, "PPP")} - {dateRange?.to && format(dateRange.to, "PPP")}
              </p>
              <p className="text-sm text-on-surface-variant font-light">
                {selectedProperty?.name} {selectedUnit && `• ${selectedUnit.name}`}
              </p>
            </div>

            <div className="space-y-8 max-w-xl">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-semibold text-on-surface-variant">Guest Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-transparent border-b border-outline-variant/30 px-0 py-3 text-2xl focus:outline-none focus:border-primary transition-colors placeholder:text-outline-variant/50 font-light"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-semibold text-on-surface-variant">M-Pesa Number</label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-transparent border-b border-outline-variant/30 px-0 py-3 text-2xl focus:outline-none focus:border-primary transition-colors placeholder:text-outline-variant/50 font-light"
                  placeholder="254700000000"
                />
                <p className="text-xs text-on-surface-variant mt-2 font-light">A prompt will automatically be sent to this number to secure the stay.</p>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 pt-8 flex justify-between w-full bg-background border-t border-outline-variant/10">
              <Button variant="outline" onClick={handleBack} className="rounded-full px-8 h-12 border-outline-variant/30 font-medium">
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!guestName || !guestPhone || guestPhone.length < 9 || isSubmitting}
                className="rounded-full px-8 h-12 bg-black text-white hover:bg-gray-800 font-medium px-10"
              >
                {isSubmitting ? "Dispatching..." : "Send Payment Prompt"}
              </Button>
            </div>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="animate-in zoom-in-95 fade-in duration-500 absolute inset-0 flex flex-col items-center justify-center text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-bold font-heading tracking-tighter">Prompt <span className="text-primary italic font-serif">Sent.</span></h2>
              <p className="text-lg text-on-surface-variant max-w-lg mx-auto font-light">
                An M-Pesa payment prompt was successfully dispatched to <span className="font-medium text-foreground">{guestPhone}</span>.
              </p>
            </div>
            
            <div className="w-full max-w-md text-left mt-8 border-t border-outline-variant/15 pt-8">
               <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-4 font-semibold">Guest Workflow</p>
               <ol className="text-sm space-y-4 font-light text-on-surface-variant">
                  <li className="flex gap-4"><span className="text-primary font-bold">1</span> Guest verifies amount and enters pin on phone.</li>
                  <li className="flex gap-4"><span className="text-primary font-bold">2</span> System confirms payment and reserves unit.</li>
                  <li className="flex gap-4"><span className="text-primary font-bold">3</span> Guest instantly receives TTLock pin via WhatsApp.</li>
               </ol>
            </div>
            
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-12 rounded-full h-12 px-8 font-medium border-outline-variant/30">
              Create Another Reservation
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
