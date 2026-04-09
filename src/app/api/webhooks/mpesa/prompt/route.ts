import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, properties, unitContracts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { darajaClient } from "@/lib/mpesa/daraja";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { propertyId, unitId, organizationId, guestName, guestPhone, checkInDate, checkOutDate } = body;

    if (!propertyId || !guestName || !guestPhone || !checkInDate || !checkOutDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Determine rent/price based on property/unit.
    // For now, let's use a mock totalamount or fetch from contract
    let amount = 8500; // default
    if (unitId) {
      const contract = await db.query.unitContracts.findFirst({
        where: eq(unitContracts.unitId, unitId)
      });
      if (contract?.monthlyRent) {
         // rough daily rate logic (mock)
         amount = Math.floor(contract.monthlyRent / 30);
      }
    }

    // Default reference for M-Pesa STK push
    const referenceString = `NYO-${propertyId}-${Date.now().toString().slice(-4)}`;

    let checkoutRequestId = `MOCK-REQ-${Date.now()}`;
    
    // Attempt real Daraja Push, fallback to mock if unconfigured/failed
    try {
      const pushRes = await darajaClient.initiateSTKPush(
        guestPhone,
        amount,
        referenceString,
        "NyumbaniOps Booking Hold"
      );
      if (pushRes.success && pushRes.data.CheckoutRequestID) {
        checkoutRequestId = pushRes.data.CheckoutRequestID;
      }
    } catch (pushErr) {
       console.warn("[M-Pesa] Using mock push. Daraja engine not fully configured:", pushErr);
    }

    // Create the pending booking record
    await db.insert(bookings).values({
      propertyId,
      unitId: unitId || null,
      organizationId,
      guestName,
      guestPhone,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      status: "PENDING",
      source: "manual",
      checkoutRequestId,
      totalAmount: amount,
      currency: "KES",
    });

    return NextResponse.json({ success: true, message: "Prompt dispatched" });
  } catch (error) {
    console.error("Booking prompt error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
