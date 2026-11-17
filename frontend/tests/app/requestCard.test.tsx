import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RequestCard } from "../../src/app/RequestCard";
import { createRequest, getChangeRequest, addFollowUp } from "../../src/domain/requests";
import { getEvents } from "../../src/domain/events";
import { getDeliveryState } from "../../src/domain/delivery";
import { resetDomain, FRI_20_NOV } from "../domain/testHelpers";

describe("T061: RequestCard shows timestamps for every item and reads every delivered one", () => {
  beforeEach(() => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
  });

  it("shows a timestamp row for the create event and for a follow-up, and marks both read when Melissa opens it", () => {
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    addFollowUp(created.value.id, "Jason", "still hoping to hear back");

    const request = getChangeRequest(created.value.id)!;
    render(<RequestCard request={request} viewer="Melissa" onChanged={() => {}} />);

    // both items' timestamp rows are present
    expect(screen.getAllByText(/Received by server/).length).toBeGreaterThanOrEqual(2);

    const events = getEvents(created.value.id);
    const createEvent = events.find((e) => e.type === "create")!;
    const followUpEvent = events.find((e) => e.type === "follow-up")!;
    expect(getDeliveryState(createEvent.id)).toBe("read");
    expect(getDeliveryState(followUpEvent.id)).toBe("read");
  });
});

describe("T065/T066: neutral labels and timestamped delivery/read state", () => {
  beforeEach(() => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
  });

  it('shows "Request sent by Jason", not the raw event type "create"', () => {
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const request = getChangeRequest(created.value.id)!;
    render(<RequestCard request={request} viewer="Jason" onChanged={() => {}} />);

    expect(screen.getByText("Request sent by Jason")).toBeInTheDocument();
    expect(screen.queryByText("create")).not.toBeInTheDocument();
  });

  it('shows "Read <time>" with the server time of the read event, once Melissa opens it', () => {
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const request = getChangeRequest(created.value.id)!;
    const { rerender } = render(<RequestCard request={request} viewer="Melissa" onChanged={() => {}} />);

    const refreshed = getChangeRequest(created.value.id)!;
    rerender(<RequestCard request={refreshed} viewer="Melissa" onChanged={() => {}} />);

    expect(screen.getByText("Read 18:00")).toBeInTheDocument();
  });
});
