import { describe, it, expect } from "vitest";
import { BANNED_WORDS, strings } from "../../src/copy/strings";

describe("T065: delivered/read/not-delivered carry their server time", () => {
  it("shows the time on each", () => {
    expect(strings.deliveredAt("18:05")).toBe("Delivered 18:05");
    expect(strings.readAt("18:10")).toBe("Read 18:10");
    expect(strings.notDeliveredAt("18:06")).toBe("Not delivered 18:06");
  });
});

describe("T066: neutral item labels replace raw event types", () => {
  it("maps every item type to the wording from the review", () => {
    expect(strings.itemLabel("create", "Jason")).toBe("Request sent by Jason");
    expect(strings.itemLabel("accept", "Melissa")).toBe("Accepted by Melissa");
    expect(strings.itemLabel("decline", "Melissa")).toBe("Declined by Melissa");
    expect(strings.itemLabel("edit", "Jason")).toBe("Edited by Jason");
    expect(strings.itemLabel("withdraw", "Jason")).toBe("Withdrawn by Jason");
    expect(strings.itemLabel("follow-up", "Jason")).toBe("Follow-up from Jason");
    expect(strings.itemLabel("dispute-note", "Melissa")).toBe("Dispute note from Melissa");
  });

  it("every item label avoids the closed word list, for both parents", () => {
    const types = ["create", "accept", "decline", "edit", "withdraw", "follow-up", "dispute-note"] as const;
    for (const type of types) {
      for (const author of ["Jason", "Melissa"] as const) {
        const label = strings.itemLabel(type, author).toLowerCase();
        for (const banned of BANNED_WORDS) {
          expect(label).not.toContain(banned);
        }
      }
    }
  });
});
