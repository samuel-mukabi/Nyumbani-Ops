"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getAuthContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });

  if (!dbUser || !dbUser.organizationId) {
    throw new Error("Missing organization context");
  }

  return { 
    userId: user.id, 
    orgId: dbUser.organizationId! 
  };
}

export async function createTeamMemberAction(formData: FormData) {
  const { orgId } = await getAuthContext();

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const role = formData.get("role") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  
  // Dummy email for headless staff since 'email' is literally required by schema
  const email = `staff-${Date.now()}@${orgId}.com`;

  await db.insert(users).values({
    organizationId: orgId,
    email,
    firstName,
    lastName,
    role: role || 'cleaner',
    phoneNumber,
  });

  revalidatePath("/staff");
}

export async function updateTeamMemberAction(formData: FormData) {
  const { orgId } = await getAuthContext();
  
  const id = Number(formData.get("id"));
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const role = formData.get("role") as string;
  const phoneNumber = formData.get("phoneNumber") as string;

  await db.update(users).set({
    firstName,
    lastName,
    role,
    phoneNumber,
  }).where(
    and(
      eq(users.id, id),
      eq(users.organizationId, orgId)
    )
  );

  revalidatePath("/staff");
}

export async function deleteTeamMemberAction(id: number) {
  const { orgId } = await getAuthContext();

  await db.delete(users).where(
    and(
      eq(users.id, id),
      eq(users.organizationId, orgId)
    )
  );

  revalidatePath("/staff");
}
