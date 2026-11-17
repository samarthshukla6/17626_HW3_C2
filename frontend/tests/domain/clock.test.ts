import { describe, it, expect, beforeEach } from "vitest";
import {
  getServerTime,
  setServerTime,
  advanceServerTime,
  getDeviceTime,
  setDeviceClockOffset,
  wholeHoursBetween,
} from "../../src/domain/clock";

describe("clocks (REQ-09)", () => {
  beforeEach(() => {
    setServerTime("2026-11-16T09:00:00.000Z");
    setDeviceClockOffset("Melissa", 0);
    setDeviceClockOffset("Jason", 0);
  });

  it("setServerTime changes what getServerTime returns", () => {
    setServerTime("2026-11-20T18:00:00.000Z");
    expect(getServerTime().toISOString()).toBe("2026-11-20T18:00:00.000Z");
  });

  it("advanceServerTime moves the clock forward by minutes", () => {
    setServerTime("2026-11-20T18:00:00.000Z");
    advanceServerTime(90);
    expect(getServerTime().toISOString()).toBe("2026-11-20T19:30:00.000Z");
  });

  it("getDeviceTime equals the server time plus that parent's offset", () => {
    setServerTime("2026-11-20T10:00:00.000Z");
    setDeviceClockOffset("Jason", 120);
    expect(getDeviceTime("Jason").toISOString()).toBe("2026-11-20T12:00:00.000Z");
    expect(getDeviceTime("Melissa").toISOString()).toBe("2026-11-20T10:00:00.000Z");
  });

  it("wholeHoursBetween rounds down and never goes negative past zero", () => {
    const start = new Date("2026-11-18T18:01:00.000Z");
    const end = new Date("2026-11-20T18:00:00.000Z");
    expect(wholeHoursBetween(end, start)).toBe(47);
  });
});
