import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { History } from "../../src/app/History";
import { createRequest, respond } from "../../src/domain/requests";
import { failNextDelivery, markRead } from "../../src/domain/delivery";
import { getEvents } from "../../src/domain/events";
import { BANNED_WORDS } from "../../src/copy/strings";
import { resetDomain, FRI_20_NOV } from "../domain/testHelpers";

describe("T086 (REQ-02, REQ-11, REQ-12, F-14): History shows readable, neutral labels", () => {
  beforeEach(() => {
    resetDomain([FRI_20_NOV], "2026-11-16T09:00:00.000Z");
  });

  it("labels every entry type in words, never the raw event type", () => {
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Route change",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const createEvent = getEvents(created.value.id).find((e) => e.type === "create")!;
    markRead(createEvent.id, "Melissa");
    failNextDelivery();
    respond({ requestId: created.value.id, author: "Melissa", decision: "accept" });

    render(<History />);
    expect(screen.getByText("Request sent by Jason")).toBeInTheDocument();
    expect(screen.getByText("Delivered to Melissa")).toBeInTheDocument();
    expect(screen.getByText("Read by Melissa")).toBeInTheDocument();
    expect(screen.getByText("Accepted by Melissa")).toBeInTheDocument();
    expect(screen.getByText("Not delivered to Jason")).toBeInTheDocument();

    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/: (create|accept|delivered|read|delivery-failed)\b/);
    for (const word of BANNED_WORDS) {
      expect(text.toLowerCase()).not.toMatch(new RegExp(`\\b${word}\\b`));
    }
  });
});
