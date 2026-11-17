import { describe, it, expect } from "vitest";
import { strings } from "../../src/copy/strings";
import { buildMockSchedule } from "../../src/domain/mockData";

describe("T067: drop-off wording is distinct from pickup wording", () => {
  it("keeps the REQ-01/REQ-02 Friday pickup wording exactly as written", () => {
    expect(strings.originalPlanEntry("Fri 20 Nov 18:00", "Jason")).toBe(
      "Fri 20 Nov 18:00, Jason's weekend (court plan)",
    );
    expect(
      strings.nextExchange("Fri 20 Nov 18:00", "school parking area", "Jason"),
    ).toBe("Next exchange: Fri 20 Nov 18:00, school parking area, Jason's weekend begins");
  });

  it('labels a Sunday drop-off as "<date>, drop-off, Melissa\'s time begins (court plan)"', () => {
    expect(strings.originalPlanEntry("Sun 22 Nov 18:00", "Melissa", "dropoff")).toBe(
      "Sun 22 Nov 18:00, drop-off, Melissa's time begins (court plan)",
    );
  });

  it('shows "Next exchange: ..., Melissa\'s time begins" when the next exchange is a drop-off', () => {
    expect(
      strings.nextExchange("Sun 22 Nov 18:00", "school parking area", "Melissa", "dropoff"),
    ).toBe("Next exchange: Sun 22 Nov 18:00, school parking area, Melissa's time begins");
  });

  it("mockData.ts tags pickups and drop-offs so the UI can tell them apart", () => {
    const entries = buildMockSchedule();
    expect(entries[0].kind).toBe("pickup");
    expect(entries[1].kind).toBe("dropoff");
  });
});
