import { describe, it, expect } from "vitest";
import { createRequest, listRequestsFor } from "../../src/domain/requests";
import { setOnline } from "../../src/domain/offlineQueue";
import { setServerTime } from "../../src/domain/clock";
import { strings } from "../../src/copy/strings";
import { formatTime } from "../../src/domain/format";
import { resetDomain, FRI_20_NOV } from "./testHelpers";

describe("REQ-10 Nothing is lost without signal", () => {
  it("Truck stop with no signal: saved locally, invisible to the other parent, then sent on reconnect", () => {
    resetDomain([FRI_20_NOV], "2026-11-18T16:00:00.000Z");
    setOnline("Jason", false);

    const written = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Swap for work",
    });
    expect(written.ok).toBe(true);
    if (!written.ok) return;

    expect(written.value.savedOnDeviceWrittenTime).toBeDefined();
    expect(strings.savedOnDeviceNotSentYet()).toBe("Saved on this device, not sent yet");

    // Melissa doesn't see the request yet - it isn't in the shared event log.
    expect(listRequestsFor("Melissa")).toHaveLength(0);

    // signal returns at Wed 18 Nov 20:00
    setServerTime("2026-11-18T20:00:00.000Z");
    setOnline("Jason", true);

    const melissaSees = listRequestsFor("Melissa");
    expect(melissaSees).toHaveLength(1);
    expect(melissaSees[0].noticeLabel).toBe("Short notice: 46 h given (plan asks for 48 h)");
    expect(strings.writtenDeviceTime(formatTime(written.value.savedOnDeviceWrittenTime!))).toBe(
      "Written 16:00 (device time, not verified)",
    );
  });
});
