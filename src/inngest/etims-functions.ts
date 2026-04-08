import { inngest } from "./client";
import { etimsClient } from "@/lib/etims/client";
import { generateSalesInvoicePayload, generatePurchaseInvoicePayload } from "@/lib/etims/payload-generators";
import { db } from "@/db";
import { etimsDocuments, complianceExpenses, bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const syncEtimsReceipt = inngest.createFunction(
  { id: "sync-etims-receipt", retries: 5 }, // 5 retries for brittle APIs
  { event: "etims/sync_required" },
  async ({ event, step }) => {
    const { documentId } = event.data;

    // Fetch the document record
    const document = await step.run("fetch-document", async () => {
      const docs = await db.select()
        .from(etimsDocuments)
        .where(eq(etimsDocuments.id, documentId));
      return docs[0];
    });

    if (!document) {
      return { success: false, reason: "Document not found." };
    }

    if (document.status === "synced") {
      return { success: true, reason: "Already synced." };
    }

    // Submit to KRA OSCU
    const submitResult = await step.run("submit-to-kra-oscu", async () => {
      if (document.documentType === 'expense_invoice' && document.expenseId) {
        // Fetch specific expense
        const expenses = await db.select().from(complianceExpenses).where(eq(complianceExpenses.id, document.expenseId));
        if (expenses.length > 0) {
           const payload = generatePurchaseInvoicePayload(expenses[0]);
           return await etimsClient.submitPurchase(payload);
        }
      } else if (document.documentType === 'sales_invoice' && document.bookingId) {
        // Fetch Booking
        const b = await db.select().from(bookings).where(eq(bookings.id, document.bookingId));
        if (b.length > 0) {
           const payload = generateSalesInvoicePayload(b[0]);
           return await etimsClient.submitInvoice(payload);
        }
      }
      return { success: false, error: "Invalid document type or missing relations." };
    });

    if (submitResult.success) {
      await step.run("update-document-status", async () => {
        await db.update(etimsDocuments)
          .set({ 
            status: "synced", 
            receiptNumber: submitResult.data?.rcptNo,
            responsePayload: submitResult.data,
            updatedAt: new Date()
          })
          .where(eq(etimsDocuments.id, document.id));
      });
      return { success: true, receiptNo: submitResult.data?.rcptNo };
    }

    throw new Error(`eTIMS Submission Failed`);
  }
);
