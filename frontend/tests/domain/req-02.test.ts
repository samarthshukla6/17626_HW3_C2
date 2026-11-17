import { describe, it, expect, beforeEach } from "vitest";
import { createRequest } from "../../src/domain/requests";
import { getHomeSummary } from "../../src/domain/record";
import { strings } from "../../src/copy/strings";
import { formatDateTime, formatDateOnly } from "../../src/domain/format";
import { resetDomain } from "./testHelpers";

const JASON_WEEKEND = {
  id: "fri-20-nov",
  startDateTime: "2026-11-20T18:00:00.000Z",
  location: "school parking area",
  whoseTimeBegins: "Jason" as const,
};

describe("REQ-02 First screen shows the current state and waiting actions", () => {
  beforeEach(() => {
    resetDomain([JASON_WEEKEND], "2026-11-18T18:00:00.000Z");
  });

  it("Jason sees the waiting action first", () => {
    const created = createRequest({
      author: "Melissa",
      affectedScheduleEntryId: JASON_WEEKEND.id,
      proposedTime: "2026-11-21T18:00:00.000Z",
      reason: "Family event",
    });
    expect(created.ok).toBe(true);

    const summary = getHomeSummary("Jason");
    expect(summary.waitingOnYou).toHaveLength(1);

    const message = strings.waitingForYou("Melissa", formatDateOnly(summary.waitingOnYou[0].proposedTime));
    expect(message).toBe("Waiting for you: respond to Melissa's request for Sat 21 Nov");

    expect(summary.nextExchange).toEqual(JASON_WEEKEND);
    const nextExchangeMessage = strings.nextExchange(
      formatDateTime(summary.nextExchange!.startDateTime),
      summary.nextExchange!.location,
      summary.nextExchange!.whoseTimeBegins,
    );
    expect(nextExchangeMessage).toBe(
      "Next exchange: Fri 20 Nov 18:00, school parking area, Jason's weekend begins",
    );
  });

  it('Nothing waiting: the first screen says "Nothing is waiting for you."', () => {
    const summary = getHomeSummary("Melissa");
    expect(summary.waitingOnYou).toHaveLength(0);
    expect(strings.nothingWaiting()).toBe("Nothing is waiting for you.");
  });
});
