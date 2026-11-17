import { describe, it, expect } from "vitest";
import { createRequest, getChangeRequest } from "../../src/domain/requests";
import { setServerTime } from "../../src/domain/clock";
import { strings } from "../../src/copy/strings";
import { resetDomain } from "./testHelpers";

const MON_30_NOV = {
  id: "mon-30-nov",
  startDateTime: "2026-11-30T18:00:00.000Z",
  location: "school parking area",
  whoseTimeBegins: "Jason" as const,
};

describe("REQ-08 Unanswered requests stay visible", () => {
  it.each([
    { now: "2026-11-27T09:59:00.000Z", flag: false },
    { now: "2026-11-27T10:00:00.000Z", flag: true },
  ])("48h-since-received overdue flag at $now is $flag", ({ now, flag }) => {
    resetDomain([MON_30_NOV], "2026-11-25T10:00:00.000Z");
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: MON_30_NOV.id,
      proposedTime: "2026-12-04T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    setServerTime(now);
    expect(getChangeRequest(created.value.id)?.overdue).toBe(flag);
  });

  it.each([
    { now: "2026-11-29T18:00:00.000Z", flag: false },
    { now: "2026-11-29T18:01:00.000Z", flag: true },
  ])("24h-before-exchange overdue flag at $now is $flag", ({ now, flag }) => {
    resetDomain([MON_30_NOV], "2026-11-28T20:00:00.000Z");
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: MON_30_NOV.id,
      proposedTime: "2026-12-04T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    setServerTime(now);
    expect(getChangeRequest(created.value.id)?.overdue).toBe(flag);
  });

  it("Lapsed: status becomes Lapsed once the exchange starts with no response", () => {
    resetDomain([MON_30_NOV], "2026-11-25T10:00:00.000Z");
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: MON_30_NOV.id,
      proposedTime: "2026-12-04T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    setServerTime("2026-11-30T18:00:00.000Z");
    const request = getChangeRequest(created.value.id);
    expect(request?.status).toBe("Lapsed");
    expect(strings.lapsedMessage()).toBe("No response before the exchange, original schedule applied.");
  });
});
