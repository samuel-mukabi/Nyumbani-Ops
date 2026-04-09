import ical from "node-ical";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function syncPropertyIcal(propertyId: number, url: string) {
  try {
    // 1. Fetch and parse iCal
    const events = await ical.async.fromURL(url);
    const syncResults = {
      added: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    };

    for (const event of Object.values(events)) {
      if (!event || event.type !== "VEVENT") continue;
      const vevent = event as ical.VEvent;

      const externalId = typeof vevent.uid === "string" ? vevent.uid : (vevent.uid as { val: string })?.val;
      const checkInDate = vevent.start;
      const checkOutDate = vevent.end;
      const summary = typeof vevent.summary === "string" ? vevent.summary : (vevent.summary as { val: string })?.val || "Reserved";

      if (!externalId || !checkInDate || !checkOutDate) {
        syncResults.errors++;
        continue;
      }

      // 2. Check if booking already exists by externalId
      const existing = await db.query.bookings.findFirst({
        where: and(
          eq(bookings.propertyId, propertyId),
          eq(bookings.externalId, externalId)
        ),
      });

      if (existing) {
        // Update if dates changed
        if (
          existing.checkInDate.getTime() !== checkInDate.getTime() ||
          existing.checkOutDate.getTime() !== checkOutDate.getTime()
        ) {
          await db
            .update(bookings)
            .set({
              checkInDate,
              checkOutDate,
              guestName: summary,
              updatedAt: new Date(),
            })
            .where(eq(bookings.id, existing.id));
          syncResults.updated++;
        } else {
          syncResults.skipped++;
        }
      } else {
        // 3. Create new booking
        await db.insert(bookings).values({
          propertyId,
          guestName: summary,
          checkInDate,
          checkOutDate,
          source: "airbnb",
          status: "CONFIRMED",
          externalId,
          externalSource: "airbnb_ical",
        });
        syncResults.added++;
      }
    }

    return syncResults;
  } catch (error) {
    console.error(`Error syncing iCal for property ${propertyId}:`, error);
    throw error;
  }
}
