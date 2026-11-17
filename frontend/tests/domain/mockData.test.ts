import { describe, it, expect } from "vitest";
import { buildMockSchedule } from "../../src/domain/mockData";

describe("T060: mock schedule reflects primary custody with Jason's alternating weekends", () => {
  it("creates a Friday pickup and Sunday drop-off, both at the school parking area, for each of Jason's weekends", () => {
    const entries = buildMockSchedule();

    expect(entries.length).toBeGreaterThanOrEqual(4);
    expect(entries.length % 2).toBe(0);

    const first = entries[0];
    expect(first.startDateTime).toBe("2026-11-20T18:00:00.000Z"); // Fri 20 Nov 2026 18:00
    expect(first.whoseTimeBegins).toBe("Jason");
    expect(first.location).toBe("school parking area");

    const second = entries[1];
    expect(second.startDateTime).toBe("2026-11-22T18:00:00.000Z"); // Sun 22 Nov 2026 18:00
    expect(second.whoseTimeBegins).toBe("Melissa");
    expect(second.location).toBe("school parking area");

    // the next Jason weekend is 14 days later, not 7 - Melissa's in-between week has no entries.
    const third = entries[2];
    expect(third.startDateTime).toBe("2026-12-04T18:00:00.000Z");
    expect(third.whoseTimeBegins).toBe("Jason");

    // every pickup/drop-off pair is exactly 2 days apart (Fri 18:00 -> Sun 18:00).
    for (let i = 0; i < entries.length; i += 2) {
      const pickup = new Date(entries[i].startDateTime).getTime();
      const dropoff = new Date(entries[i + 1].startDateTime).getTime();
      expect(dropoff - pickup).toBe(2 * 24 * 60 * 60 * 1000);
      expect(entries[i].whoseTimeBegins).toBe("Jason");
      expect(entries[i + 1].whoseTimeBegins).toBe("Melissa");
    }
  });
});
