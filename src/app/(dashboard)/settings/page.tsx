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
    <div className="space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-outline-variant/30 pb-8">
        <div className="max-w-2xl">
          <h1 className="text-5xl lg:text-7xl font-bold font-heading text-foreground mb-4 tracking-tighter">
            Your <span className="text-primary italic font-serif">Profile.</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-light leading-relaxed">
            Manage your personal settings and contact information.
          </p>
        </div>
      </div>

      <div className="max-w-xl">
        <form action={updateProfileAction} className="space-y-10">
          <div className="space-y-4">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.2em] text-outline">Email Address</Label>
            <Input 
              id="email" 
              value={user.email || ""} 
              disabled 
              className="h-14 bg-surface-container-low/30 text-on-surface-variant border-none opacity-60 font-medium px-6 rounded-2xl"
            />
            <p className="text-[10px] text-on-surface-variant italic">Securely managed by Supabase Auth</p>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-[0.2em] text-outline">First Name</Label>
              <Input 
                  id="firstName" 
                  name="firstName" 
                  defaultValue={dbUser.firstName || ""} 
                  placeholder="John" 
                  className="h-14 bg-transparent border-b border-outline-variant/30 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-all text-xl font-medium"
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-[0.2em] text-outline">Last Name</Label>
              <Input 
                  id="lastName" 
                  name="lastName" 
                  defaultValue={dbUser.lastName || ""} 
                  placeholder="Doe" 
                  className="h-14 bg-transparent border-b border-outline-variant/30 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-all text-xl font-medium"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="phoneNumber" className="text-xs font-bold uppercase tracking-[0.2em] text-outline">Phone Number</Label>
            <Input 
              id="phoneNumber" 
              name="phoneNumber" 
              defaultValue={dbUser.phoneNumber || ""} 
              placeholder="+254 7XX XXX XXX" 
              className="h-14 bg-transparent border-b border-outline-variant/30 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-all text-xl font-medium"
            />
            <p className="text-[10px] text-on-surface-variant italic">For automated guest communication and M-Pesa payouts</p>
          </div>

          <div className="pt-6">
            <Button type="submit" className="h-16 px-10 rounded-2xl font-bold text-lg shadow-2xl shadow-primary/20 hover:shadow-primary/30 transition-all">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
