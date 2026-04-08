import { describe, expect, it } from "vitest";
import { extractIngestToken, parseCapturedAt } from "./iotIngest";

describe("extractIngestToken", () => {
  it("reads bearer token from authorization header", () => {
    const request = new Request("https://example.com/api/utilities/iot/ingest?token=query-token", {
      headers: {
        Authorization: "Bearer header-token",
      },
    });

    expect(extractIngestToken(request, { allowQueryToken: true })).toEqual({
      token: "header-token",
      source: "header",
    });
  });

  it("falls back to token query parameter", () => {
    const request = new Request("https://example.com/api/utilities/iot/ingest?token=query-token");
    expect(extractIngestToken(request, { allowQueryToken: true })).toEqual({
      token: "query-token",
      source: "query",
    });
  });

  it("returns none when no token is present", () => {
    const request = new Request("https://example.com/api/utilities/iot/ingest");
    expect(extractIngestToken(request, { allowQueryToken: true })).toEqual({
      token: "",
      source: "none",
    });
  });

  it("blocks query token when fallback is disabled", () => {
    const request = new Request("https://example.com/api/utilities/iot/ingest?token=query-token");
    expect(extractIngestToken(request, { allowQueryToken: false })).toEqual({
      token: "",
      source: "none",
    });
  });
});

describe("parseCapturedAt", () => {
  it("parses valid ISO date", () => {
    const result = parseCapturedAt("2026-01-02T03:04:05.000Z");
    expect(result.toISOString()).toBe("2026-01-02T03:04:05.000Z");
  });

  it("throws for invalid dates", () => {
    expect(() => parseCapturedAt("definitely-not-a-date")).toThrow("Invalid capturedAt");
  });
});
