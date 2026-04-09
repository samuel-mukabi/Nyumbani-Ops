import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, bookings} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { PlusCircle} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ReservationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });

  if (!dbUser || !dbUser.organizationId) {
    redirect('/onboarding');
  }

  const allBookings = await db.query.bookings.findMany({
    where: eq(bookings.organizationId, dbUser.organizationId),
    with: {
      property: true,
      unit: true,
    },
    orderBy: [desc(bookings.createdAt)],
  });

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 border-b border-outline-variant/30 pb-12">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-5xl lg:text-7xl font-bold font-heading text-foreground tracking-tighter">
            Stay <span className="text-primary italic font-serif">Ledger.</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-light leading-relaxed">
            Monitor all guest stays, payment statuses, and automated concierge prompts across your properties.
          </p>
        </div>
        
        <Link href="/reservations/new">
          <Button size="lg" className="font-bold shadow-lg shadow-primary/20 transition-transform">
            <PlusCircle className="w-4 h-4 mr-2" /> New Reservation
          </Button>
        </Link>
      </div>

      {/* Rhythmic Metrics (Zero-Card) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 border-y border-outline-variant/10 py-16">
        <div className="space-y-6 group cursor-default">
          <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase group-hover:text-primary transition-colors">Active Stays</p>
          <div className="flex items-baseline gap-4">
            <span className="text-7xl font-light text-on-surface leading-none tabular-nums">
              {allBookings.filter(b => b.status === "CONFIRMED" || b.status === "CHECKED_IN").length}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-on-surface-variant/70 max-w-50">Guests currently confirmed or checked in.</p>
        </div>

        <div className="space-y-6 group cursor-default">
          <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase group-hover:text-primary transition-colors">Pending Payments</p>
          <div className="flex items-baseline gap-4">
            <span className="text-7xl font-light text-on-surface leading-none tabular-nums">
              {allBookings.filter(b => b.status === "PENDING").length}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-on-surface-variant/70 max-w-50">Dispatched prompts awaiting guest action.</p>
        </div>

        <div className="space-y-6 group cursor-default">
          <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase group-hover:text-primary transition-colors">Total Volume</p>
          <div className="flex items-baseline gap-4">
            <span className="text-6xl font-light text-on-surface leading-none tabular-nums tracking-tighter mb-3">
              {(allBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0)).toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-on-surface-variant/40 uppercase tracking-widest leading-none">KES</span>
          </div>
          <p className="text-xs leading-relaxed text-on-surface-variant/70 max-w-50">Aggregate value of all processed reservations.</p>
        </div>
      </section>

      {/* Manifest (Zero-Card Row Stack) */}
      <section className="space-y-12">
        <div className="flex items-end justify-between pb-4 border-b border-outline-variant/10">
           <h2 className="font-heading text-3xl font-light text-on-surface tracking-tight">Stay Manifest</h2>
           <span className="text-[10px] font-bold tracking-widest text-on-surface-variant/40 uppercase">{allBookings.length} Total Bookings</span>
        </div>

        <div className="space-y-1">
          {allBookings.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-lg font-light text-on-surface-variant italic font-serif">&quot;A quiet ledger is an unmapped one.&quot;</p>
              <Link href="/reservations/new">
                <p className="text-[10px] font-bold tracking-widest text-primary uppercase mt-4 cursor-pointer hover:underline">Dispatch Your First Prompt</p>
              </Link>
            </div>
          ) : (
            allBookings.map((booking) => (
              <div 
                key={booking.id}
                className="group flex flex-col md:flex-row md:items-center justify-between py-10 border-b border-outline-variant/5 hover:bg-surface-container-low px-6 rounded-xl transition-all duration-500 ease-out"
              >
                  <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16 lg:gap-24">
                     {/* Guest Info */}
                     <div className="flex flex-col min-w-45">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-primary/40 uppercase mb-2">Guest</span>
                        <p className="text-2xl font-light text-on-surface group-hover:translate-x-1 transition-transform duration-500 leading-tight">
                          {booking.guestName}
                        </p>
                        <span className="text-[10px] font-medium text-on-surface-variant/40 tracking-wider mt-1">{booking.guestPhone}</span>
                     </div>

                     {/* Stay Dates */}
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/30 uppercase mb-2">Stay Duration</span>
                        <p className="text-sm font-semibold text-on-surface tracking-tight">
                          {format(booking.checkInDate, "MMM d")} — {format(booking.checkOutDate, "MMM d, yyyy")}
                        </p>
                        <span className="text-[10px] text-on-surface-variant/60 font-medium uppercase tracking-widest mt-1">
                          {Math.ceil((booking.checkOutDate.getTime() - booking.checkInDate.getTime()) / (1000 * 60 * 60 * 24))} nights
                        </span>
                     </div>

                     {/* Property Info */}
                     <div className="hidden lg:flex flex-col">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/30 uppercase mb-2">Property</span>
                        <p className="text-sm font-medium text-on-surface max-w-37.5 truncate">{booking.property?.name}</p>
                        <span className="text-[10px] text-on-surface-variant/50 font-light italic mt-0.5">
                          {booking.unit?.name || booking.unit?.unitCode || "Main Unit"}
                        </span>
                     </div>
                  </div>

                  <div className="flex items-center gap-12 mt-8 md:mt-0">
                     {/* Financial Info */}
                     <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/30 uppercase mb-2">Revenue</span>
                        <p className="text-base font-mono font-bold tracking-tight">KES {(booking.totalAmount || 0).toLocaleString()}</p>
                     </div>

                     {/* Status Badge */}
                     <div className="flex flex-col items-end min-w-25">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant/30 uppercase mb-2">Status</span>
                        <div className="flex items-center gap-2">
                           <span className={cn(
                             "w-1.5 h-1.5 rounded-full shadow-[0_0_12px_rgba(var(--status-color),0.4)]",
                             {
                               "bg-emerald-500": booking.status === "CONFIRMED" || booking.status === "CHECKED_IN",
                               "bg-amber-500": booking.status === "PENDING",
                               "bg-outline-variant": booking.status === "CHECKED_OUT" || booking.status === "CANCELLED",
                             }
                           )} />
                           <span className="text-[10px] font-bold text-on-surface uppercase tracking-widest">{booking.status}</span>
                        </div>
                     </div>

                     <div className="hidden sm:flex h-12 w-12 rounded-full border border-outline-variant/20 items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                        <span className="text-xl">&rarr;</span>
                     </div>
                  </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
