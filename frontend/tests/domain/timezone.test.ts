// T063: this suite is meaningless unless it actually runs in a non-UTC
// timezone, so it forces one regardless of how the runner was invoked.
process.env.TZ = "America/New_York";

import { describe, it, expect } from "vitest";
import { parseLocalInputAsUTC, formatDateTime } from "../../src/domain/format";

describe("T063: datetime-local inputs are parsed as UTC, under TZ=America/New_York", () => {
  it("what a parent types is what they see: 18:00 in, 18:00 out", () => {
    const iso = parseLocalInputAsUTC("2026-11-27T18:00");
    expect(iso).toBe("2026-11-27T18:00:00.000Z");
    expect(formatDateTime(iso)).toBe("Fri 27 Nov 18:00");
  });

  it("the naive new Date(value) parse would have been wrong here (sanity check of the bug)", () => {
    // America/New_York is UTC-5 in November (standard time, no DST).
    const naive = new Date("2026-11-27T18:00").toISOString();
    expect(naive).toBe("2026-11-27T23:00:00.000Z"); // the bug this fix avoids
    expect(parseLocalInputAsUTC("2026-11-27T18:00")).not.toBe(naive);
  });

  it("passes through a value that already carries a timezone unchanged in meaning", () => {
    expect(parseLocalInputAsUTC("2026-11-27T18:00:00.000Z")).toBe("2026-11-27T18:00:00.000Z");
  });

  it("returns an empty string for an empty input", () => {
    expect(parseLocalInputAsUTC("")).toBe("");
  });
});
