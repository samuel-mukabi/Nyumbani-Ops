import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MultiStepBookingForm } from "./MultiStepBookingForm";
import { getPropertiesWithUnitsAction } from "@/lib/actions/properties";

export default async function NewReservationPage() {
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

  const { properties: orgProperties } = await getPropertiesWithUnitsAction();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-outline-variant/30 pb-12">
        <div className="max-w-2xl">
          <h1 className="text-5xl lg:text-7xl font-bold font-heading text-foreground mb-4 tracking-tighter">
            Guest <span className="text-primary italic font-serif">Prompts.</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-light mt-2 leading-relaxed">
            Select a property, choose dates, and dispatch an instant M-Pesa STK payment prompt directly to your guest to secure their stay.
          </p>
        </div>
      </div>

      <MultiStepBookingForm 
        properties={orgProperties} 
        organizationId={dbUser.organizationId}
      />
    </div>
  );
}
