"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, ChevronLeft, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getUnitBookingsAction } from "@/lib/actions/bookings";

// MUI Date Picker Imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs, { Dayjs } from "dayjs";

interface Property {
  id: number;
  name: string;
  area?: string | null;
  address?: string | null;
  units: Unit[];
  [key: string]: any;
}

interface Unit {
  id: number;
  name: string;
  unitCode?: string | null;
  ownerId?: number | null;
  listingUrl?: string | null;
  status?: string;
  ownerName?: string;
}

type MultiStepBookingFormProps = {
  properties: Property[];
  organizationId: number;
};

export function MultiStepBookingForm({ properties, organizationId }: MultiStepBookingFormProps) {
  const [step, setStep] = useState(1);
  const [propertyId, setPropertyId] = useState<number | null>(null);
  const [unitId, setUnitId] = useState<number | null>(null);
  
  // Date State
  const [checkIn, setCheckIn] = useState<Dayjs | null>(null);
  const [checkOut, setCheckOut] = useState<Dayjs | null>(null);
  const [selectionStage, setSelectionStage] = useState<"check-in" | "check-out">("check-in");

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Occupancy State
  const [unitBookings, setUnitBookings] = useState<Array<{ start: Date; end: Date }>>([]);

  useEffect(() => {
    if (unitId) {
      getUnitBookingsAction(unitId).then(setUnitBookings);
    }
  }, [unitId]);


  const selectedProperty = properties.find((p) => p.id === propertyId);
  const filteredUnits = selectedProperty?.units || [];
  const selectedUnit = filteredUnits.find((u) => u.id === unitId);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleDateChange = (value: Dayjs | null) => {
    if (!value) return;

    if (selectionStage === "check-in") {
      setCheckIn(value);
      if (checkOut && (value.isAfter(checkOut) || isRangeOccupied(value, checkOut))) {
        setCheckOut(null);
      }
      setSelectionStage("check-out");
    } else {
      if (checkIn && value.isBefore(checkIn)) {
        setCheckIn(value);
        setCheckOut(null);
        setSelectionStage("check-out");
      } else {
        if (checkIn && isRangeOccupied(checkIn, value)) {
          alert("This range overlaps with an existing booking.");
          return;
        }
        setCheckOut(value);
      }
    }
  };

  const isDateOccupied = (date: Dayjs) => {
    return unitBookings.some(booking => {
      const start = dayjs(booking.start).startOf('day');
      const end = dayjs(booking.end).endOf('day');
      return date.isAfter(start.subtract(1, 'day')) && date.isBefore(end.add(1, 'day'));
    });
  };

  const isRangeOccupied = (start: Dayjs, end: Dayjs) => {
    return unitBookings.some(booking => {
      const bStart = dayjs(booking.start);
      const bEnd = dayjs(booking.end);
      return (start.isBefore(bEnd) && end.isAfter(bStart));
    });
  };

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
          checkInDate: checkIn?.toDate(),
          checkOutDate: checkOut?.toDate(),
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

  // MUI Theme Overrides via sx
  const calendarStyles = {
    width: '100%',
    maxWidth: '600px',
    backgroundColor: 'transparent',
    '.MuiPickersCalendarHeader-root': {
      paddingLeft: '0',
      paddingRight: '0',
      marginBottom: '16px',
    },
    '.MuiPickersCalendarHeader-labelContainer': {
      fontSize: '1.25rem',
      fontWeight: 700,
      fontFamily: 'var(--font-manrope)',
      letterSpacing: '-0.02em',
    },
    '.MuiDayCalendar-weekDayLabel': {
      color: 'var(--color-on-surface-variant)',
      fontSize: '0.75rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      width: '64px',
      margin: '0 4px',
    },
    '.MuiPickersDay-root': {
      fontFamily: 'var(--font-manrope)',
      fontSize: '1.125rem',
      fontWeight: 400,
      width: '64px',
      height: '64px',
      margin: '0 4px',
      borderRadius: '50%',
      color: 'var(--color-foreground)',
      '&:hover': {
        backgroundColor: '#953a3510',
      },
      '&.Mui-selected': {
        backgroundColor: '#953a35 !important',
        color: '#ffffff !important',
        fontWeight: 700,
      },
      '&.MuiPickersDay-today': {
        borderColor: '#953a3540',
        borderWidth: '2px',
      },
      '&.Mui-disabled': {
        color: 'var(--color-outline-variant)',
        opacity: 0.3,
      }
    },
    '.MuiPickersArrowSwitcher-button': {
      color: 'var(--color-on-surface-variant)',
      border: '1px solid var(--color-outline-variant-20)',
      '&:hover': {
        backgroundColor: 'var(--color-surface-container)',
      }
    }
  };

  return (
    <div className="w-full relative animate-fade-in flex flex-col min-h-[calc(100vh-200px)]">
      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-16 px-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-1 bg-outline-variant/30 overflow-hidden relative rounded-full">
            <div
              className={cn("absolute left-0 top-0 h-full bg-primary transition-all duration-700 ease-in-out", {
                "w-full": step >= i,
                "w-0": step < i,
              })}
            />
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="flex-1 relative pb-32">
        {/* Step 1: Property */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-4xl md:text-6xl font-bold font-heading tracking-tighter mb-12">
              Select <span className="text-primary italic font-serif">Property.</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-12 mb-12">
              {properties.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => {
                    setPropertyId(prop.id);
                    setUnitId(null);
                  }}
                  className={cn(
                    "group flex flex-col text-left transition-all border-b pb-8 cursor-pointer",
                    propertyId === prop.id
                      ? "border-primary"
                      : "border-outline-variant/20 hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-on-surface-variant group-hover:text-primary transition-colors">
                      {prop.area || "Location"}
                    </span>
                    {propertyId === prop.id && <Check className="w-4 h-4 text-primary" />}
                  </div>
                  <span className="font-semibold text-3xl tracking-tight group-hover:translate-x-1 transition-transform">{prop.name}</span>
                  <span className="text-base text-on-surface-variant font-light mt-3 max-w-sm line-clamp-2">
                    {prop.address}
                  </span>
                </button>
              ))}
            </div>
            {properties.length === 0 && (
              <p className="text-on-surface-variant italic text-xl font-light">No properties configured for your organization.</p>
            )}
          </div>
        )}

        {/* Step 2: Unit */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3">Available units for {selectedProperty?.name}</p>
              <h2 className="text-4xl md:text-6xl font-bold font-heading tracking-tighter">
                Select <span className="text-primary italic font-serif">Unit.</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-12">
              {filteredUnits.length > 0 ? (
                filteredUnits.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => setUnitId(unit.id)}
                    className={cn(
                      "group flex flex-col text-left transition-all border-b pb-6 cursor-pointer",
                      unitId === unit.id
                        ? "border-primary"
                        : "border-outline-variant/20 hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors">
                        {unit.unitCode}
                      </span>
                      {unitId === unit.id && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <span className="font-semibold text-xl tracking-tight group-hover:translate-x-1 transition-transform">{unit.name}</span>
                  </button>
                ))
              ) : (
                <div className="col-span-full py-16 border-y border-outline-variant/10">
                   <p className="text-xl text-on-surface-variant font-light italic">No individual units discovered for this property. If this is a standalone stay, please proceed.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Dates */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col">
            <h2 className="text-4xl md:text-6xl font-bold font-heading tracking-tighter mb-12">
              Select <span className="text-primary italic font-serif">Dates.</span>
            </h2>
            
            <div className="flex flex-col lg:flex-row gap-20 items-start">
              <div className="flex-1 w-full max-w-2xl">
                <div className="flex items-center gap-6 mb-12">
                  <button 
                    onClick={() => setSelectionStage("check-in")}
                    className={cn("flex-1 px-8 py-6 rounded-3xl border transition-all text-left", 
                      selectionStage === "check-in" ? "border-primary bg-primary/5" : "border-outline-variant/30 opacity-60")}
                  >
                    <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">Check-in</span>
                    <span className="text-2xl font-semibold">{checkIn ? checkIn.format("MMM D, YYYY") : "Select Date"}</span>
                  </button>
                  <button 
                    onClick={() => setSelectionStage("check-out")}
                    className={cn("flex-1 px-8 py-6 rounded-3xl border transition-all text-left", 
                      selectionStage === "check-out" ? "border-primary bg-primary/5" : "border-outline-variant/30 opacity-60")}
                  >
                    <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">Check-out</span>
                    <span className="text-2xl font-semibold">{checkOut ? checkOut.format("MMM D, YYYY") : "Select Date"}</span>
                  </button>
                </div>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    value={selectionStage === "check-in" ? checkIn : checkOut}
                    onChange={handleDateChange}
                    minDate={selectionStage === "check-in" ? dayjs() : (checkIn || dayjs())}
                    shouldDisableDate={(date) => isDateOccupied(date)}
                    sx={calendarStyles}
                  />
                </LocalizationProvider>
              </div>

              <div className="hidden lg:block w-px self-stretch bg-outline-variant/10" />

              <div className="flex-1 space-y-6">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Stay Duration</p>
                {checkIn && checkOut ? (
                  <div className="space-y-2">
                    <p className="text-5xl font-bold tracking-tighter">
                      {checkOut.diff(checkIn, 'day')} <span className="font-serif italic font-light text-primary">Nights.</span>
                    </p>
                    <p className="text-on-surface-variant font-light text-lg">
                      Arriving {checkIn.format("dddd")} — Departing {checkOut.format("dddd")}
                    </p>
                  </div>
                ) : (
                  <p className="text-xl text-on-surface-variant font-light italic">Select your check-in and check-out dates to compute stay duration.</p>
                )}
              </div>
            </div>
          </div>
        )}


        {/* Step 4: Guest Details */}
        {step === 4 && !success && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-4xl md:text-6xl font-bold font-heading tracking-tighter mb-12">
              Guest <span className="text-primary italic font-serif">Details.</span>
            </h2>
            
            <div className="border-y border-outline-variant/15 py-8 mb-12 space-y-3 max-w-2xl">
              <h3 className="font-semibold text-[10px] uppercase tracking-[0.25em] text-on-surface-variant flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5" /> Selected Stay
              </h3>
              <p className="font-medium text-2xl text-foreground tracking-tight">
                {checkIn && format(checkIn.toDate(), "PPP")} — {checkOut && format(checkOut.toDate(), "PPP")}
              </p>
              <p className="text-lg text-on-surface-variant font-light flex items-center gap-2">
                {selectedProperty?.name} {selectedUnit && <><span className="">•</span> {selectedUnit.name}</>}
              </p>
            </div>

            <div className="space-y-12 max-w-xl">
              <div className="space-y-3 group">
                <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-on-surface-variant group-focus-within:text-primary transition-colors">Guest Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-transparent border-b border-outline-variant/30 px-0 py-4 text-3xl focus:outline-none focus:border-primary transition-all placeholder:text-outline-variant font-light tracking-tight"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-3 group">
                <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-on-surface-variant group-focus-within:text-primary transition-colors">M-Pesa Number</label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-transparent border-b border-outline-variant/30 px-0 py-4 text-3xl focus:outline-none focus:border-primary transition-all placeholder:text-outline-variant font-light tracking-tight"
                  placeholder="254700000000"
                  minLength={10}
                />
                <p className="text-sm text-on-surface-variant mt-4 font-light italic">A payment prompt will be dispatched to this number.</p>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="animate-in zoom-in-95 fade-in duration-700 flex flex-col items-center justify-center text-center py-12 space-y-10">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-8xl font-bold font-heading tracking-tighter">Prompt <span className="text-primary italic font-serif">Sent.</span></h2>
              <p className="text-xl text-on-surface-variant max-w-lg mx-auto font-light leading-relaxed">
                An M-Pesa payment prompt was successfully dispatched to <span className="font-semibold text-foreground">{guestPhone}</span>.
              </p>
            </div>
            
            <div className="w-full max-w-lg text-left pt-12 border-t border-outline-variant/10">
               <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant mb-12 font-bold text-center">Overview</p>
               <div className="grid grid-cols-1 gap-12">
                 <div className="space-y-4">
                    <span className="text-primary font-bold tabular-nums text-xs tracking-widest uppercase">01 / Payment</span>
                    <p className="text-xl font-light text-on-surface leading-snug">Guest verifies the amount and enters their M-Pesa PIN on their device to authorize the transaction.</p>
                 </div>
                 <div className="space-y-4">
                    <span className="text-primary font-bold tabular-nums text-xs tracking-widest uppercase">02 / Automation</span>
                    <p className="text-xl font-light text-on-surface leading-snug">System detects the successful handshake, confirms the ledger entry, and auto-reserves the specific unit.</p>
                 </div>
                 <div className="space-y-4">
                    <span className="text-primary font-bold tabular-nums text-xs tracking-widest uppercase">03 / Concierge</span>
                    <p className="text-xl font-light text-on-surface leading-snug">Guest instantly receives their TTLock PIN and digital concierge details via WhatsApp for a frictionless check-in.</p>
                 </div>
               </div>
            </div>
            
            <Button 
              onClick={() => window.location.reload()} 
              variant="secondary" 
              size="lg"
              className="rounded-full px-12 h-14 font-bold"
            >
              Create Another Reservation
            </Button>
          </div>
        )}
      </div>

      {/* Sticky Navigation Footer */}
      {!success && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-(--sidebar-width) transition-all duration-200 z-30 pointer-events-none">
          <div className="max-w-350 mx-auto px-6 pb-8 lg:px-24 pointer-events-none">
            <div className="flex justify-between items-center bg-background/80 backdrop-blur-xl border-t border-outline-variant/10 p-6 pointer-events-auto">
              <div className="flex-1">
                {step > 1 && (
                  <Button 
                    variant='link'
                    size="lg"
                    onClick={handleBack} 
                    className="h-14 px-12 font-bold"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" /> Back
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4">
                {step < 4 ? (
                  <Button 
                    variant="default"
                    disabled={
                      (step === 1 && !propertyId) || 
                      (step === 2 && !unitId && filteredUnits.length > 0) || 
                      (step === 3 && (!checkIn || !checkOut))
                    } 
                    onClick={handleNext} 
                    size="lg"
                    className="h-14 px-12 font-bold shadow-lg shadow-primary/10"
                  >
                    Continue <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    variant="default"
                    onClick={handleSubmit} 
                    disabled={!guestName || !guestPhone || guestPhone.length < 9 || isSubmitting}
                    size="lg"
                    className="h-14 px-12 font-bold shadow-lg shadow-primary/10"
                  >
                    {isSubmitting ? "Sending..." : "Send Payment Prompt"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
