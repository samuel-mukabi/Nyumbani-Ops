import Link from "next/link";
import { LayoutDashboard, Building2, Users, FileCheck, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, organizations, properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // DB Checks for Auth boundaries
  let dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });

  if (!dbUser || !dbUser.organizationId) {
    redirect('/onboarding');
  }

  const currentOrg = await db.query.organizations.findFirst({
    where: eq(organizations.id, dbUser.organizationId)
  });

  if (!currentOrg) {
    redirect('/onboarding');
  }

  const propertyList = await db.query.properties.findMany({
    where: eq(properties.organizationId, dbUser.organizationId)
  });

  if (propertyList.length === 0) {
    redirect('/onboarding');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-on-surface font-sans selection:bg-primary/20">
      
      {/* Sidebar - Tonal Layering (No solid borders) */}
      <aside className="w-72 flex-shrink-0 bg-surface-container-low flex flex-col pt-8">
        <div className="px-8 pb-8 flex items-center gap-3">
           <span className="text-xl font-heading font-medium text-on-surface tracking-tight">Nyumbani<span className="opacity-40">Ops</span></span>
        </div>

        <div className="px-6 pb-6">
          <DropdownMenu>
            <DropdownMenuTrigger className="font-sans text-on-surface font-medium w-full text-left bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-3 h-12 transition-colors shadow-[0_4px_12px_rgba(28,28,24,0.02)] flex items-center justify-between hover:bg-surface-container-low focus:outline-none">
                <span className="text-sm font-semibold truncate">{currentOrg.name}</span>
                <span className="text-[10px] text-primary italic font-serif">Pro</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[228px] bg-surface-container-lowest border-outline-variant/20 rounded-xl shadow-xl p-1">
              <DropdownMenuItem className="text-sm font-semibold rounded-lg focus:bg-surface-container-low cursor-default">
                {currentOrg.name}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-outline-variant/20 my-1" />
              <Link href="/onboarding" className="block w-full">
                <DropdownMenuItem className="text-sm text-primary font-bold focus:bg-primary/10 rounded-lg cursor-pointer transition-colors">
                  + Create Workspace
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <SidebarNav />

        <div className="p-6 bg-surface-container flex flex-col gap-4 rounded-tr-[40px] mt-auto">
          <div className="flex items-center gap-3 px-2 group">
            <Link href="/settings" className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs group-hover:bg-primary/20 transition-colors uppercase">
                  {(dbUser.firstName?.[0] || user.user_metadata?.full_name?.[0] || user.email?.[0] || "U")}
              </div>
              <div className="flex flex-col">
                  <span className="text-sm font-semibold truncate max-w-[120px]">
                      {dbUser.firstName || dbUser.lastName 
                        ? `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() 
                        : user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-on-surface-variant group-hover:text-primary transition-colors">Edit Profile</span>
              </div>
            </Link>
            <form action="/auth/sign-out" method="post" className="ml-auto">
                <button type="submit" className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant hover:text-primary transition-colors">
                    <LogOut className="w-4 h-4" />
                </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background relative">
        {/* Atmospheric Layers */}
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary/3 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary/3 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto px-12 py-16 lg:px-24 lg:py-24 relative z-10">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
