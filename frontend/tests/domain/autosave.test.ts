import { describe, it, expect, beforeEach } from "vitest";
import { createRequest } from "../../src/domain/requests";
import { advanceServerTime, setDeviceClockOffset } from "../../src/domain/clock";
import { setOnline, setServerUnreachable } from "../../src/domain/offlineQueue";
import { STORAGE_KEY } from "../../src/domain/store";
import "../../src/domain/store"; // registers the autosave listener as a side effect
import { resetDomain, FRI_20_NOV } from "./testHelpers";

function savedEventCount(): number {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return 0;
  return JSON.parse(raw).events.length;
}

function savedClockState(): { serverTimeMs: number; deviceOffsetMinutes: Record<string, number> } {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) as string).clock;
}

function savedOfflineState(): { onlineState: Record<string, boolean>; serverUnreachable: boolean } {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) as string).offline;
}

describe("T058: state is saved after every domain action and Demo Controls change", () => {
  beforeEach(() => {
    localStorage.clear();
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
  });

  it("saves after a domain mutation, with no explicit saveState() call", () => {
    expect(savedEventCount()).toBe(0);

    createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });

    expect(savedEventCount()).toBeGreaterThan(0);
  });

  it("saves after a Demo Controls clock change", () => {
    advanceServerTime(60);
    expect(savedClockState().serverTimeMs).toBe(new Date("2026-11-18T19:00:00.000Z").getTime());

    setDeviceClockOffset("Jason", 120);
    expect(savedClockState().deviceOffsetMinutes.Jason).toBe(120);
  });

  it("saves after a Demo Controls connectivity change", () => {
    setOnline("Jason", false);
    expect(savedOfflineState().onlineState.Jason).toBe(false);

    setServerUnreachable(true);
    expect(savedOfflineState().serverUnreachable).toBe(true);
  });
});
