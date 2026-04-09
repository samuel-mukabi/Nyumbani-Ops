type KplcBalanceResult = {
  balance: number;
  unit: "token";
  source: "live" | "mock";
  raw: unknown;
};

function seededBalance(meterNumber: string) {
  let seed = 0;
  for (let i = 0; i < meterNumber.length; i += 1) {
    seed = (seed * 31 + meterNumber.charCodeAt(i)) % 1000;
  }
  return Number(((seed % 120) + 5 + Math.random() * 3).toFixed(2));
}

export async function fetchKplcMeterBalance(meterNumber: string): Promise<KplcBalanceResult> {
  const baseUrl = process.env.KPLC_BASE_URL;
  const apiKey = process.env.KPLC_API_KEY;
  const mockMode = process.env.KPLC_MOCK === "true" || !baseUrl || !apiKey;

  if (mockMode) {
    const balance = seededBalance(meterNumber);
    return {
      balance,
      unit: "token",
      source: "mock",
      raw: { meterNumber, mock: true, balance },
    };
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/meters/${encodeURIComponent(meterNumber)}/balance`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  const raw = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`KPLC balance fetch failed (${response.status})`);
  }

  const balance = Number(raw?.balance ?? raw?.tokenBalance ?? 0);
  if (!Number.isFinite(balance)) {
    throw new Error("Invalid KPLC balance payload.");
  }

  return {
    balance,
    unit: "token",
    source: "live",
    raw,
  };
}
