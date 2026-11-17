import { describe, it, expect } from "vitest";
import { BANNED_WORDS, strings } from "../../src/copy/strings";

describe("copy strings closed word list (REQ-12)", () => {
  it("contains exactly FR-012's banned words", () => {
    expect([...BANNED_WORDS].sort()).toEqual(
      ["failed", "ignored", "late", "missed", "no-show", "refused", "unreliable"].sort(),
    );
  });

  it("does not ban the word 'overdue', which describes the request, not a person", () => {
    expect(BANNED_WORDS).not.toContain("overdue");
  });

  it("every exported string template avoids every banned word, for both parents", () => {
    const samples = [
      strings.nothingWaiting(),
      strings.waitingForYou("Jason", "Sat 21 Nov"),
      strings.waitingForYou("Melissa", "Sat 21 Nov"),
      strings.nextExchange("Fri 20 Nov 18:00", "school parking area", "Jason"),
      strings.missingReasonOnCreate(),
      strings.missingReasonOnDecline(),
      strings.eventAlreadyStarted(),
      strings.entryHasPendingRequest(),
      strings.changeProposedWaiting(),
      strings.agreedChangeLabel(),
      strings.changedByAgreementOriginalKept(),
      strings.noticeGiven(48),
      strings.shortNoticeGiven(3),
      strings.overdueFlag(),
      strings.lapsedMessage(),
      strings.savedOnDeviceNotSentYet(),
      strings.notDelivered(),
      strings.writtenDeviceTime("18:00"),
      strings.receivedByServer("18:00"),
      strings.editedBy("Jason", "14:05", "18:00", "19:00"),
      strings.editedAfterRead("Melissa"),
      strings.emergencyClaimedBy("Jason"),
    ];

    for (const text of samples) {
      for (const banned of BANNED_WORDS) {
        expect(text.toLowerCase()).not.toContain(banned);
      }
    }
  });

  it("produces identical wording for both parents in the same situation", () => {
    expect(strings.emergencyClaimedBy("Jason")).toBe("Emergency claimed by Jason");
    expect(strings.emergencyClaimedBy("Melissa")).toBe("Emergency claimed by Melissa");
  });
});
