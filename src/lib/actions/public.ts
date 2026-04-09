"use server";

import { db } from "@/db";
import { properties, bookings } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function getPublicPropertyDetails(slug: string) {
  const property = await db.query.properties.findFirst({
    where: eq(properties.slug, slug),
    columns: {
      id: true,
      name: true,
      address: true,
      houseRules: true,
      slug: true,
    },
  });

  if (!property) return null;

  // Fetch only future bookings to highlight on the calendar
  // We explicitly exclude Guest Names for privacy
  const occupiedSlots = await db.query.bookings.findMany({
    where: and(
      eq(bookings.propertyId, property.id),
      gt(bookings.checkOutDate, new Date())
    ),
    columns: {
      checkInDate: true,
      checkOutDate: true,
    },
  });

  return {
    ...property,
    occupiedSlots: occupiedSlots.map(slot => ({
      from: slot.checkInDate,
      to: slot.checkOutDate,
    })),
  };
}

export async function getPublicBookingDetails(bookingId: string) {
  const id = parseInt(bookingId);
  if (isNaN(id)) return null;

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, id),
    with: {
      property: true,
      unit: true,
    },
  });

  return booking || null;
}
