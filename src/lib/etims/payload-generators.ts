/**
 * eTIMS Payload Generators
 * Maps DB models (`compliance_expenses` and `owner_statements`) to the exact JSON struct
 * defined by the KRA OSCU specifications.
 */

interface BookingData {
  externalId?: string | null;
  guestPhone?: string | null;
  guestName?: string | null;
  grossAmount?: number | null;
}

interface ExpenseData {
  id?: number | null;
  vendorName?: string | null;
  amount?: number | null;
  category?: string | null;
}

export function generateSalesInvoicePayload(bookingData: BookingData) {
  // Mapping a booking or monthly statement to an official sales invoice struct
  return {
    trdInvcNo: bookingData.externalId || `INV-${Date.now()}`,
    invcSttsCd: "02", // 02 for Approved by default
    prchrNo: bookingData.guestPhone || "0000000000",
    prchrNm: bookingData.guestName || "Walk-in Guest",
    rcptTyCd: "S", // Sales
    items: [
      {
        itemCd: "SER123", // Shortcode for Accommodation Service
        itemNm: "Accommodation Services",
        qty: 1,
        prc: bookingData.grossAmount || 0,
        taxTyCd: "A" // Standard 16% VAT or exempt mapping based on context
      }
    ]
  };
}

export function generatePurchaseInvoicePayload(expenseData: ExpenseData) {
  // Mapping compliance_expense record
  return {
    purcNo: expenseData.id?.toString() || `PUR-${Date.now()}`,
    spplrNm: expenseData.vendorName || "Unknown Vendor",
    totAmt: expenseData.amount || 0,
    items: [
      {
        itemNm: expenseData.category || "General Expense",
        qty: 1,
        prc: expenseData.amount || 0,
      }
    ]
  };
}
