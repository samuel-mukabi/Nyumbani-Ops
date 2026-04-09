"use server";

import { db } from "@/db";
import { bookings, buildings, organizations, owners, units, users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";

async function getAuthContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, user.id),
  });

  if (!dbUser?.organizationId) {
    redirect("/onboarding");
  }

  return { orgId: dbUser.organizationId };
}

export async function getAgencyOverviewAction() {
  const { orgId } = await getAuthContext();
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + 30);

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
  });

  const propertyRows = await db.query.buildings.findMany({
    where: eq(buildings.organizationId, orgId),
    orderBy: (table, { asc }) => [asc(table.name)],
  });

  const unitRows = await db
    .select({
      id: units.id,
      buildingId: units.buildingId,
      unitName: units.name,
      unitCode: units.unitCode,
      ownerName: owners.fullName,
    })
    .from(units)
    .leftJoin(owners, eq(units.ownerId, owners.id))
    .where(eq(units.organizationId, orgId));

  const unitIds = unitRows.map((u) => u.id);
  const bookingRows =
    unitIds.length > 0
      ? await db
          .select({
            id: bookings.id,
            unitId: bookings.unitId,
            guestName: bookings.guestName,
            checkInDate: bookings.checkInDate,
            checkOutDate: bookings.checkOutDate,
            status: bookings.status,
          })
          .from(bookings)
          .where(
            and(
              eq(bookings.organizationId, orgId),
              inArray(bookings.unitId, unitIds),
            )
          )
      : [];

  const bookingsByUnit = new Map<number, typeof bookingRows>();
  for (const booking of bookingRows) {
    if (!booking.unitId) continue;
    const status = (booking.status || "").toLowerCase();
    if (status === "cancelled") continue;
    const existing = bookingsByUnit.get(booking.unitId) ?? [];
    existing.push(booking);
    bookingsByUnit.set(booking.unitId, existing);
  }

  for (const list of bookingsByUnit.values()) {
    list.sort(
      (a, b) =>
        (a.checkInDate?.getTime() ?? 0) - (b.checkInDate?.getTime() ?? 0)
    );
  }

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaySlots = Array.from({ length: 7 }).map((_, index) => {
    const dayStart = new Date(startOfToday);
    dayStart.setDate(startOfToday.getDate() + index);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    return { dayStart, dayEnd };
  });

  const properties = propertyRows.map((property) => {
    const propertyUnits = unitRows
      .filter((u) => u.buildingId === property.id)
      .map((unit) => {
        const unitBookings = bookingsByUnit.get(unit.id) ?? [];
        const currentBooking = unitBookings.find(
          (b) =>
            !!b.checkInDate &&
            !!b.checkOutDate &&
            b.checkInDate <= now &&
            b.checkOutDate >= now
        );
        const nextBooking = unitBookings.find(
          (b) => !!b.checkInDate && b.checkInDate > now && b.checkInDate <= horizon
        );

        return {
          id: unit.id,
          name: unit.unitName,
          code: unit.unitCode,
          ownerName: unit.ownerName ?? "Unassigned owner",
          isOccupiedNow: Boolean(currentBooking),
          currentBooking: currentBooking
            ? {
                guestName: currentBooking.guestName,
                checkInDate: currentBooking.checkInDate,
                checkOutDate: currentBooking.checkOutDate,
              }
            : null,
          nextBooking: nextBooking
            ? {
                guestName: nextBooking.guestName,
                checkInDate: nextBooking.checkInDate,
                checkOutDate: nextBooking.checkOutDate,
              }
            : null,
          weeklyTimeline: sevenDaySlots.map(({ dayStart, dayEnd }) => {
            const overlapping = unitBookings.find(
              (b) =>
                !!b.checkInDate &&
                !!b.checkOutDate &&
                b.checkInDate < dayEnd &&
                b.checkOutDate > dayStart
            );

            if (!overlapping || !overlapping.checkInDate || !overlapping.checkOutDate) {
              return {
                date: dayStart,
                occupied: false,
                timeWindow: "Free",
              };
            }

            return {
              date: dayStart,
              occupied: true,
              timeWindow: `${overlapping.checkInDate.toLocaleTimeString("en-KE", {
                hour: "2-digit",
                minute: "2-digit",
              })} - ${overlapping.checkOutDate.toLocaleTimeString("en-KE", {
                hour: "2-digit",
                minute: "2-digit",
              })}`,
            };
          }),
        };
      });

    const ownerNames = Array.from(
      new Set(propertyUnits.map((u) => u.ownerName).filter(Boolean))
    );

    return {
      id: property.id,
      name: property.name,
      owners: ownerNames,
      units: propertyUnits,
    };
  });

  return {
    agencyName: org?.name ?? "Agency",
    properties,
  };
}
