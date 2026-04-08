import Link from "next/link";
import { LayoutDashboard, Building2, Users, FileCheck, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, organizations, properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DashboardShell } from "@/components/layout/DashboardShell";

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

  const userDisplayName =
    dbUser.firstName || dbUser.lastName
      ? `${dbUser.firstName || ""} ${dbUser.lastName || ""}`.trim()
      : user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const userInitial =
    dbUser.firstName?.[0] || user.user_metadata?.full_name?.[0] || user.email?.[0] || "U";

  return (
    <DashboardShell
      orgName={currentOrg.name}
      userDisplayName={userDisplayName}
      userInitial={userInitial}
    >
      {children}
    </DashboardShell>
  );
}
