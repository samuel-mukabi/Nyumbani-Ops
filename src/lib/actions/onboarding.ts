"use server";

import { db } from "@/db";
import { organizations, properties, users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import slugify from "slugify";

export async function submitOnboardingAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const orgName = formData.get("organizationName") as string;
  const propertyName = formData.get("propertyName") as string;
  const propertyAddress = formData.get("propertyAddress") as string;

  if (!orgName || !propertyName) {
    throw new Error(`Missing required fields. Received Organization: '${orgName}', Property: '${propertyName}'`);
  }

  const orgSlug = slugify(orgName, { lower: true, strict: true });
  const propertySlug = slugify(propertyName, { lower: true, strict: true });

  // 1. Create Organization
  const [newOrg] = await db.insert(organizations).values({
    name: orgName,
    slug: orgSlug,
  }).returning();

  // 2. Link User
  const existingUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });

  if (existingUser) {
    await db.update(users)
      .set({ organizationId: newOrg.id })
      .where(eq(users.id, existingUser.id));
  } else {
    await db.insert(users).values({
      authId: user.id,
      email: user.email!,
      organizationId: newOrg.id,
      role: 'host',
    });
  }

  // 3. Create Property
  await db.insert(properties).values({
    organizationId: newOrg.id,
    name: propertyName,
    address: propertyAddress,
    slug: propertySlug,
  });

  redirect("/dashboard");
}
