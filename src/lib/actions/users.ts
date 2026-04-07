"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phoneNumber = formData.get("phoneNumber") as string;

  await db.update(users)
    .set({
      firstName,
      lastName,
      phoneNumber,
      updatedAt: new Date(),
    })
    .where(eq(users.authId, user.id));

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}
