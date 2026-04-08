import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Safaricom Daraja STK Push Callback Payload Structure
    const body = payload.Body?.stkCallback;
    
    if (body && body.ResultCode === 0) {
      // Payment Successful
      const checkoutRequestId = body.CheckoutRequestID;
      const callbackMetadata = body.CallbackMetadata?.Item || [];
      const mpesaReceiptObj = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber');
      const receiptNumber = mpesaReceiptObj ? mpesaReceiptObj.Value : \`SIM-MPESA-\${Date.now()}\`;
      
      // Update booking status in DB to CONFIRMED
      const updatedBookings = await db.update(bookings)
        .set({ status: 'CONFIRMED', mpesaReceiptNumber: receiptNumber, updatedAt: new Date() })
        .where(eq(bookings.checkoutRequestId, checkoutRequestId))
        .returning();
        
      const booking = updatedBookings[0];
      
      if (booking) {
        // Trigger asynchronous post-booking flow (eTIMS, TTLock, WhatsApp)
        await inngest.send({
          name: "booking/confirmed",
          data: {
            bookingId: booking.id,
            propertyId: booking.propertyId,
            phoneNumber: booking.guestPhone,
          }
        });
      } else {
         console.warn(`Booking not found for CheckoutRequestID: ${checkoutRequestId}`);
      }

      return NextResponse.json({ message: "Callback processed successfully (Paid)" });
    } else {
      // Payment Failed (ResultCode !== 0)
      return NextResponse.json({ message: "Callback processed (Failed Payment)" });
    }

  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
