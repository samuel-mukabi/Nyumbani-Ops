"use server";

import { db } from "@/db";
import { properties } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import slugify from "slugify";

export async function getPropertiesAction() {
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("Unauthorized: No organization selected.");
  }

  return await db.query.properties.findMany({
    where: eq(properties.organizationId, orgId),
    orderBy: (properties, { desc }) => [desc(properties.createdAt)],
  });
}

export async function createPropertyAction(formData: FormData) {
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("Unauthorized: No organization selected.");
  }

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
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("Unauthorized");
  }

  await db.delete(properties).where(
    and(
      eq(properties.id, id),
      eq(properties.organizationId, orgId)
    )
  );

  revalidatePath("/properties");
}
