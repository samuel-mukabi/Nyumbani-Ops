"use server";

import { db } from "@/db";
import { properties, users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";

async function getAuthContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch the user's organization from our DB
  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });

  if (!dbUser || !dbUser.organizationId) {
    redirect("/onboarding");
  }

  return { 
    userId: user.id, 
    orgId: dbUser.organizationId! 
  };
}

export async function getPropertiesAction() {
  const { orgId } = await getAuthContext();

  return await db.query.properties.findMany({
    where: eq(properties.organizationId, orgId),
    orderBy: (properties, { desc }) => [desc(properties.createdAt)],
  });
}

export async function createPropertyAction(formData: FormData) {
  const { orgId } = await getAuthContext();

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const kplcMeterNumber = formData.get("kplcMeterNumber") as string;
  const airbnbIcalUrl = formData.get("airbnbIcalUrl") as string;
  const wifiName = formData.get("wifiName") as string;
  const wifiPassword = formData.get("wifiPassword") as string;
  const houseRules = formData.get("houseRules") as string;

  const slug = slugify(name, { lower: true, strict: true });

  await db.insert(properties).values({
    organizationId: orgId,
    name,
    address,
    slug,
    kplcMeterNumber,
    airbnbIcalUrl,
    wifiName,
    wifiPassword,
    houseRules,
  });

  revalidatePath("/properties");
  return { success: true };
}

export async function deletePropertyAction(id: number) {
  const { orgId } = await getAuthContext();

  await db.delete(properties).where(
    and(
      eq(properties.id, id),
      eq(properties.organizationId, orgId)
    )
  );

  revalidatePath("/properties");
}

export async function getPropertyDetailAction(slug: string) {
  const { orgId } = await getAuthContext();

  const property = await db.query.properties.findFirst({
    where: and(
      eq(properties.slug, slug),
      eq(properties.organizationId, orgId)
    ),
    with: {
      bookings: true
    }
  });

  if (!property) {
    return null;
  }

  return property;
}
