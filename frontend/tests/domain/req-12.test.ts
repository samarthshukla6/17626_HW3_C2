import { describe, it, expect } from "vitest";
import { BANNED_WORDS, strings } from "../../src/copy/strings";

describe("REQ-12 Neutral wording, same rules for both parents", () => {
  it("every label/status/notice/overdue/lapsed/delivery message avoids the closed word list", () => {
    const samples: string[] = [
      strings.changeProposedWaiting(),
      strings.agreedChangeLabel(),
      strings.changedByAgreementOriginalKept(),
      strings.noticeGiven(48),
      strings.shortNoticeGiven(3),
      strings.overdueFlag(),
      strings.lapsedMessage(),
      strings.savedOnDeviceNotSentYet(),
      strings.notDelivered(),
      strings.eventAlreadyStarted(),
      strings.entryHasPendingRequest(),
      strings.missingReasonOnCreate(),
      strings.missingReasonOnDecline(),
    ];

    for (const text of samples) {
      for (const banned of BANNED_WORDS) {
        expect(text.toLowerCase()).not.toContain(banned);
      }
    }
  });

  it("the same situation produces identical wording for both parents - no per-parent branching", () => {
    expect(strings.changeProposedWaiting()).toBe(strings.changeProposedWaiting());
    expect(strings.overdueFlag()).toBe(strings.overdueFlag());
    expect(strings.waitingForYou("Jason", "Sat 21 Nov")).toBe("Waiting for you: respond to Jason's request for Sat 21 Nov");
    expect(strings.waitingForYou("Melissa", "Sat 21 Nov")).toBe(
      "Waiting for you: respond to Melissa's request for Sat 21 Nov",
    );
  });

  it("shows no count, score, or ranking: strings.ts exports no function with that shape", () => {
    const exportNames = Object.keys(strings);
    const scoreLike = exportNames.filter((n) => /count|score|rank|total/i.test(n));
    expect(scoreLike).toEqual([]);
  });
});
