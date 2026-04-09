import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateProfileAction } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });

  if (!dbUser) {
    redirect('/onboarding');
  }

  return (
    <div className="max-w-6xl max-h-screen mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Narrative */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 border-b border-outline-variant/20 pb-12">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-foreground tracking-tighter leading-none">
            User <span className="text-primary italic font-serif">Settings.</span>
          </h1>
          <p className="text-lg text-on-surface-variant font-light leading-relaxed max-w-lg">
            Personal identification and secure communication channels for agency operations.
          </p>
        </div>
      </header>

      {/* Settings Manifest */}
      <form action={updateProfileAction} className="space-y-10">
        {/* Verification Section */}
        <section className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            <div className="space-y-6">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Email</Label>
              <div className="flex flex-col gap-3">
                <p className="text-xl font-light text-on-surface tabular-nums cursor-not-allowed">
                  {user.email}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-on-surface-variant italic font-serif">
                  <span className="w-1 h-1 rounded-full bg-primary" />
                  Primary authentication provider used by the system
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Details Section */}
        <section className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            <div className="space-y-6 group">
              <Label htmlFor="firstName" className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant group-focus-within:text-primary transition-colors">First Name</Label>
              <Input 
                  id="firstName" 
                  name="firstName" 
                  defaultValue={dbUser.firstName || ""} 
                  placeholder="John" 
                  className="h-16 bg-transparent border-0 border-b border-outline-variant/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-all text-3xl! font-light tracking-tight placeholder:text-on-surface-variant"
              />
            </div>
            <div className="space-y-6 group">
              <Label htmlFor="lastName" className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant group-focus-within:text-primary transition-colors">Last Name</Label>
              <Input 
                  id="lastName" 
                  name="lastName" 
                  defaultValue={dbUser.lastName || ""} 
                  placeholder="Doe" 
                  className="h-16 bg-transparent border-0 border-b border-outline-variant/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-all text-3xl! font-light tracking-tight placeholder:text-on-surface-variant"
              />
            </div>
          </div>
        </section>

        {/* Contact Manifest */}
        <section className="space-y-12">
          <div className="max-w-2xl space-y-6 group">
            <Label htmlFor="phoneNumber" className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant group-focus-within:text-primary transition-colors">Phone Number</Label>
            <Input 
              id="phoneNumber" 
              name="phoneNumber" 
              defaultValue={dbUser.phoneNumber || ""} 
              placeholder="+254 7XX XXX XXX" 
              className="h-16 bg-transparent border-0 border-b border-outline-variant/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-all text-3xl! font-light tracking-tight tabular-nums placeholder:text-on-surface-variant"
            />
            <p className="text-[10px] text-on-surface-variant font-medium font-serif italic max-w-md leading-relaxed">
              Mapped for automated guest outreach, m-pesa payment confirmation, and secure host payouts.
            </p>
          </div>
        </section>

        {/* Actions */}
        <footer className="pt-20 border-t border-outline-variant/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xs">
            </div>
            <Button type="submit" size="lg" className="">
              Commit Changes
            </Button>
          </div>
        </footer>
      </form>
    </div>
  );
}
