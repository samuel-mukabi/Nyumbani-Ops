import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users as UsersIcon } from "lucide-react";
import AddTeamMemberDialog from "@/components/staff/AddTeamMemberDialog";
import EditTeamMemberDialog from "@/components/staff/EditTeamMemberDialog";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { eq, not } from "drizzle-orm";

async function getTeamMembers() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in');

  const currentUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });

  if (!currentUser || !currentUser.organizationId) redirect('/onboarding');

  return await db.query.users.findMany({
    where: eq(users.organizationId, currentUser.organizationId),
  });
}

export default async function StaffPage() {
  const teamMembers = await getTeamMembers();

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Header Narrative */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-outline-variant/30 pb-8">
        <div className="max-w-2xl">
          <h1 className="text-5xl lg:text-7xl font-bold font-heading text-foreground mb-4 tracking-tighter">
            Your <span className="text-primary italic font-serif">Team.</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-light leading-relaxed">
            Manage your staff, assign roles, and handle seamless payouts.
          </p>
        </div>
        <div className="flex-shrink-0">
          <AddTeamMemberDialog />
        </div>
      </div>

      {/* Zero-Card Data Presentation */}
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
              <UsersIcon className="w-6 h-6 text-primary" />
              Active Team
            </h2>
            <span className="text-xs font-bold uppercase tracking-widest text-outline">
                {teamMembers.length} Members
            </span>
        </div>

        <div className="overflow-x-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm">
          <Table>
            <TableHeader className="bg-surface-container-low/50">
              <TableRow className="border-b border-outline-variant/20 hover:bg-transparent">
                <TableHead className="py-5 font-semibold text-on-surface">Name</TableHead>
                <TableHead className="py-5 font-semibold text-on-surface">Role</TableHead>
                <TableHead className="py-5 font-semibold text-on-surface">Phone Number</TableHead>
                <TableHead className="py-5 font-semibold text-on-surface">Email</TableHead>
                <TableHead className="text-right py-5 font-semibold text-on-surface">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-16">
                    <p className="text-on-surface-variant mb-2">No team members found.</p>
                    <p className="text-sm font-light italic">Add your first member to start managing.</p>
                  </TableCell>
                </TableRow>
              ) : (
                  teamMembers.map((member) => (
                    <TableRow key={member.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/30 transition-colors">
                      <TableCell className="py-5 font-medium text-foreground">
                        {member.firstName || member.email?.split('@')[0]} {member.lastName || ''}
                      </TableCell>
                      <TableCell className="py-5">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                              {member.role}
                          </span>
                      </TableCell>
                      <TableCell className="py-5 text-on-surface-variant">{member.phoneNumber || "—"}</TableCell>
                      <TableCell className="py-5 text-sm text-on-surface-variant">{member.email || "—"}</TableCell>
                      <TableCell className="py-5 text-right w-32 whitespace-nowrap">
                        <EditTeamMemberDialog member={member} />
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
