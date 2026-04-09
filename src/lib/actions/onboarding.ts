"use server";

import { db } from "@/db";
import { buildings, organizations, properties, units, users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import slugify from "slugify";

type OnboardingPropertyInput = {
  name: string;
  address?: string;
  unitCount: number;
};

export async function submitOnboardingAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const orgName = formData.get("organizationName") as string;
  const propertiesPayload = formData.get("propertiesPayload") as string;

  if (!orgName || !propertiesPayload) {
    throw new Error("Missing required fields for onboarding.");
  }

  let parsedProperties: OnboardingPropertyInput[] = [];
  try {
    const payload = JSON.parse(propertiesPayload) as OnboardingPropertyInput[];
    parsedProperties = payload
      .map((property) => ({
        name: property.name?.trim() ?? "",
        address: property.address?.trim() ?? "",
        unitCount: Math.max(1, Math.floor(Number(property.unitCount || 1))),
      }))
      .filter((property) => property.name.length > 0);
  } catch {
    throw new Error("Invalid properties payload.");
  }

  if (parsedProperties.length === 0) {
    throw new Error("At least one property is required.");
  }

  const orgSlug = slugify(orgName, { lower: true, strict: true }) || `agency-${Date.now()}`;

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

  // 3. Create Properties + Buildings + Units
  for (let propertyIndex = 0; propertyIndex < parsedProperties.length; propertyIndex += 1) {
    const property = parsedProperties[propertyIndex];
    const propertySlugBase = slugify(property.name, { lower: true, strict: true }) || `property-${propertyIndex + 1}`;
    const propertySlug = `${propertySlugBase}-${propertyIndex + 1}`;

    const [newProperty] = await db.insert(properties).values({
      organizationId: newOrg.id,
      name: property.name,
      address: property.address,
      slug: propertySlug,
    }).returning();

    const [newBuilding] = await db.insert(buildings).values({
      organizationId: newOrg.id,
      name: property.name,
      address: property.address,
      slug: propertySlug,
    }).returning();

    const unitRows = Array.from({ length: property.unitCount }).map((_, unitIndex) => {
      const unitNumber = unitIndex + 1;
      const unitCode = `U${String(unitNumber).padStart(2, "0")}`;
      return {
        organizationId: newOrg.id,
        buildingId: newBuilding.id,
        unitCode,
        name: `${newProperty.name} Unit ${unitCode}`,
      };
    });

    if (unitRows.length > 0) {
      await db.insert(units).values(unitRows);
    }
  }

  redirect("/dashboard");
}
