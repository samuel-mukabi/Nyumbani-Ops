type TokenSource = "header" | "query" | "none";

export function extractIngestToken(
  request: Request,
  options?: {
    allowQueryToken?: boolean;
  }
): { token: string; source: TokenSource } {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization") || "";
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (bearerMatch?.[1]) {
    return { token: bearerMatch[1].trim(), source: "header" };
  }

  const allowQueryToken = options?.allowQueryToken ?? false;
  if (!allowQueryToken) {
    return { token: "", source: "none" };
  }

  const url = new URL(request.url);
  const queryToken = (url.searchParams.get("token") || "").trim();
  if (queryToken) {
    return { token: queryToken, source: "query" };
  }

  return { token: "", source: "none" };
}

export function parseCapturedAt(value?: string): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid capturedAt");
  }
  return parsed;
}
