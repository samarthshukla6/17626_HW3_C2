import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RequestCard } from "../../src/app/RequestCard";
import { createRequest, getChangeRequest, addFollowUp } from "../../src/domain/requests";
import { getEvents } from "../../src/domain/events";
import { getDeliveryState } from "../../src/domain/delivery";
import { resetDomain, FRI_20_NOV } from "../domain/testHelpers";

describe("T061: RequestCard shows timestamps for every item and reads every delivered one", () => {
  beforeEach(() => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
  });

  it("does not mark list-rendered items read, then marks both read when Melissa opens details", async () => {
    const user = userEvent.setup();
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

    expect(screen.queryByText(/Received by server/)).not.toBeInTheDocument();
    const eventsBefore = getEvents(created.value.id);
    const createBefore = eventsBefore.find((e) => e.type === "create")!;
    expect(getDeliveryState(createBefore.id)).toBe("delivered");

    await user.click(screen.getByRole("button", { name: "Open details" }));
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

  it('shows "Read <time>" with the server time after explicit Open details', async () => {
    const user = userEvent.setup();
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const request = getChangeRequest(created.value.id)!;
    render(<RequestCard request={request} viewer="Melissa" onChanged={() => {}} />);

    expect(screen.queryByText("Read 18:00")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open details" }));

    expect(screen.getByText("Read 18:00")).toBeInTheDocument();
  });
});
