"use server";

import { db } from "@/db";
import { bookings, buildings, owners, properties, units, users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, inArray } from "drizzle-orm";
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
  const area = formData.get("area") as string;
  const sharedWifiRouterId = formData.get("sharedWifiRouterId") as string;
  const securityContact = formData.get("securityContact") as string;
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
    area,
    sharedWifiRouterId,
    securityContact,
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

export async function updatePropertyAction(formData: FormData) {
  const { orgId } = await getAuthContext();

  const id = Number(formData.get("id"));
  const name = (formData.get("name") as string)?.trim();
  const address = (formData.get("address") as string) || null;
  const area = (formData.get("area") as string) || null;
  const sharedWifiRouterId = (formData.get("sharedWifiRouterId") as string) || null;
  const securityContact = (formData.get("securityContact") as string) || null;
  const airbnbIcalUrl = (formData.get("airbnbIcalUrl") as string) || null;
  const wifiName = (formData.get("wifiName") as string) || null;
  const wifiPassword = (formData.get("wifiPassword") as string) || null;
  const houseRules = (formData.get("houseRules") as string) || null;

  if (!id || Number.isNaN(id)) {
    throw new Error("Invalid property id");
  }
  if (!name || name.length < 2) {
    throw new Error("Property name is required");
  }

  const slug = slugify(name, { lower: true, strict: true });

  await db
    .update(properties)
    .set({
      name,
      slug,
      address,
      area,
      sharedWifiRouterId,
      securityContact,
      airbnbIcalUrl,
      wifiName,
      wifiPassword,
      houseRules,
      updatedAt: new Date(),
    })
    .where(and(eq(properties.id, id), eq(properties.organizationId, orgId)));

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

export async function getPropertyOccupancyAction(slug: string) {
  const { orgId } = await getAuthContext();
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + 30);

  const property = await db.query.properties.findFirst({
    where: and(eq(properties.slug, slug), eq(properties.organizationId, orgId)),
  });

  if (!property) {
    return null;
  }

  const building = await db.query.buildings.findFirst({
    where: and(
      eq(buildings.organizationId, orgId),
      eq(buildings.slug, property.slug)
    ),
  });

  const fallbackBuilding =
    building ??
    (await db.query.buildings.findFirst({
      where: and(
        eq(buildings.organizationId, orgId),
        eq(buildings.name, property.name)
      ),
    }));

  if (!fallbackBuilding) {
    return {
      propertyId: property.id,
      propertyName: property.name,
      owners: [] as string[],
      units: [] as Array<{
        id: number;
        name: string;
        code: string;
        ownerName: string;
        isOccupiedNow: boolean;
        currentBooking: { guestName: string; checkInDate: Date | null; checkOutDate: Date | null } | null;
        nextBooking: { guestName: string; checkInDate: Date | null; checkOutDate: Date | null } | null;
        weeklyTimeline: { date: Date; occupied: boolean; timeWindow: string }[];
      }>,
    };
  }

  const unitRows = await db
    .select({
      id: units.id,
      unitName: units.name,
      unitCode: units.unitCode,
      ownerName: owners.fullName,
    })
    .from(units)
    .leftJoin(owners, eq(units.ownerId, owners.id))
    .where(
      and(eq(units.organizationId, orgId), eq(units.buildingId, fallbackBuilding.id))
    );

  const unitIds = unitRows.map((u) => u.id);
  const bookingRows =
    unitIds.length > 0
      ? await db
          .select({
            unitId: bookings.unitId,
            guestName: bookings.guestName,
            checkInDate: bookings.checkInDate,
            checkOutDate: bookings.checkOutDate,
            status: bookings.status,
          })
          .from(bookings)
          .where(
            and(eq(bookings.organizationId, orgId), inArray(bookings.unitId, unitIds))
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
      (a, b) => (a.checkInDate?.getTime() ?? 0) - (b.checkInDate?.getTime() ?? 0)
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

  const mappedUnits = unitRows.map((unit) => {
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

  return {
    propertyId: property.id,
    propertyName: property.name,
    owners: Array.from(new Set(mappedUnits.map((u) => u.ownerName).filter(Boolean))),
    units: mappedUnits,
  };
}

export async function getPropertiesWithUnitsAction() {
  const { orgId } = await getAuthContext();

  const propertyRows = await db.query.properties.findMany({
    where: eq(properties.organizationId, orgId),
    orderBy: (table, { asc }) => [asc(table.name)],
  });

  const buildingRows = await db.query.buildings.findMany({
    where: eq(buildings.organizationId, orgId),
  });

  const unitRows = await db
    .select({
      id: units.id,
      buildingId: units.buildingId,
      ownerId: units.ownerId,
      unitCode: units.unitCode,
      unitName: units.name,
      listingUrl: units.listingUrl,
      status: units.status,
      ownerName: owners.fullName,
    })
    .from(units)
    .leftJoin(owners, eq(units.ownerId, owners.id))
    .where(eq(units.organizationId, orgId));

  const ownerRows = await db.query.owners.findMany({
    where: eq(owners.organizationId, orgId),
    orderBy: (table, { asc }) => [asc(table.fullName)],
  });

  const propertiesWithUnits = propertyRows.map((property) => {
    const matchedBuilding = buildingRows.find(
      (building) => building.slug === property.slug || building.name === property.name
    );
    const mappedUnits = matchedBuilding
      ? unitRows.filter((unit) => unit.buildingId === matchedBuilding.id)
      : [];

    return {
      ...property,
      units: mappedUnits.map((unit) => ({
        id: unit.id,
        ownerId: unit.ownerId,
        unitCode: unit.unitCode,
        name: unit.unitName,
        listingUrl: unit.listingUrl,
        status: unit.status,
        ownerName: unit.ownerName ?? "Unassigned owner",
      })),
    };
  });

  return {
    properties: propertiesWithUnits,
    owners: ownerRows.map((owner) => ({
      id: owner.id,
      fullName: owner.fullName,
    })),
  };
}

export async function updateUnitAction(formData: FormData) {
  const { orgId } = await getAuthContext();

  const id = Number(formData.get("id"));
  const unitCode = String(formData.get("unitCode") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const status = String(formData.get("status") || "active").trim();
  const listingUrl = String(formData.get("listingUrl") || "").trim();
  const ownerIdRaw = String(formData.get("ownerId") || "").trim();
  const ownerId = ownerIdRaw ? Number(ownerIdRaw) : null;

  if (!id || Number.isNaN(id)) {
    throw new Error("Invalid unit id.");
  }
  if (!unitCode || !name) {
    throw new Error("Unit code and unit name are required.");
  }
  if (!["active", "inactive", "maintenance"].includes(status)) {
    throw new Error("Invalid unit status.");
  }
  if (ownerIdRaw && Number.isNaN(ownerId)) {
    throw new Error("Invalid owner.");
  }

  const existingUnit = await db.query.units.findFirst({
    where: and(eq(units.id, id), eq(units.organizationId, orgId)),
  });

  if (!existingUnit) {
    throw new Error("Unit not found.");
  }

  if (ownerId) {
    const ownerRecord = await db.query.owners.findFirst({
      where: and(eq(owners.id, ownerId), eq(owners.organizationId, orgId)),
    });
    if (!ownerRecord) {
      throw new Error("Owner not found for organization.");
    }
  }

  await db
    .update(units)
    .set({
      unitCode,
      name,
      ownerId,
      status,
      listingUrl: listingUrl || null,
      updatedAt: new Date(),
    })
    .where(and(eq(units.id, id), eq(units.organizationId, orgId)));

  revalidatePath("/properties");
  revalidatePath("/dashboard");
  return { success: true };
}
