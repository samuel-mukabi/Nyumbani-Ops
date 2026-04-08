type EtimsIssueInvoiceInput = {
  customerName: string;
  customerPin?: string | null;
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  currency: string;
  description: string;
};

type EtimsIssueInvoiceResult = {
  status: "issued" | "pending_manual";
  externalDocumentId?: string;
  receiptNumber?: string;
  receiptUrl?: string;
  raw?: unknown;
  errorMessage?: string;
};

function getEtimsConfig() {
  const baseUrl = process.env.ETIMS_BASE_URL;
  const apiKey = process.env.ETIMS_API_KEY;
  const mockMode = process.env.ETIMS_MOCK === "true";
  return { baseUrl, apiKey, mockMode };
}

export async function issueEtimsInvoice(
  payload: EtimsIssueInvoiceInput
): Promise<EtimsIssueInvoiceResult> {
  const { baseUrl, apiKey, mockMode } = getEtimsConfig();

  if (mockMode) {
    return {
      status: "issued",
      externalDocumentId: `mock-${payload.invoiceNumber}`,
      receiptNumber: `ETIMS-${Date.now()}`,
      receiptUrl: `https://etims.kra.go.ke/receipt/mock-${payload.invoiceNumber}`,
      raw: { mock: true },
    };
  }

  if (!baseUrl || !apiKey) {
    return {
      status: "pending_manual",
      errorMessage: "ETIMS_BASE_URL or ETIMS_API_KEY is missing.",
    };
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const raw = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        status: "pending_manual",
        raw,
        errorMessage: `eTIMS issue failed with status ${response.status}`,
      };
    }

    return {
      status: "issued",
      externalDocumentId: raw?.documentId ?? raw?.id ?? null,
      receiptNumber: raw?.receiptNumber ?? raw?.receipt_no ?? null,
      receiptUrl: raw?.receiptUrl ?? raw?.receipt_url ?? null,
      raw,
    };
  } catch (error) {
    return {
      status: "pending_manual",
      errorMessage: error instanceof Error ? error.message : "Unknown eTIMS error",
    };
  }
}
