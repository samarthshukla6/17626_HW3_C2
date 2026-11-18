import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RequestCard } from "../../src/app/RequestCard";
import { createRequest, listRequestsFor } from "../../src/domain/requests";
import { setOnline } from "../../src/domain/offlineQueue";
import { resetDomain, FRI_20_NOV } from "../domain/testHelpers";

describe("T064: a queued card shows the saved label, with no action controls", () => {
  beforeEach(() => {
    resetDomain([FRI_20_NOV], "2026-11-18T16:00:00.000Z");
  });

  it('shows "Saved on this device, not sent yet" and no Withdraw/Edit/Accept/Decline controls', () => {
    setOnline("Jason", false);
    createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Swap for work",
    });

    const queued = listRequestsFor("Jason")[0];
    render(<RequestCard request={queued} viewer="Jason" onChanged={() => {}} />);

    expect(screen.getByText("Saved on this device, not sent yet")).toBeInTheDocument();
    expect(screen.getByText("Not sent yet")).toBeInTheDocument();
    expect(screen.getByText("Written 16:00 (device time, not verified)")).toBeInTheDocument();
    expect(screen.queryByText("Status: Pending")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Withdraw" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add follow-up" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Accept" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Decline" })).not.toBeInTheDocument();
  });
});
