import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RequestCard } from "../../src/app/RequestCard";
import { createRequest, getChangeRequest } from "../../src/domain/requests";
import { resetDomain, FRI_20_NOV } from "../domain/testHelpers";

function renderCard(requestId: string) {
  const request = getChangeRequest(requestId)!;
  return render(<RequestCard request={request} viewer="Melissa" onChanged={() => {}} />);
}

describe("FR-006: two-action respond flow", () => {
  beforeEach(() => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
  });

  it("reaches Agreed via Accept then Confirm, in exactly two user actions", async () => {
    const user = userEvent.setup();
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    renderCard(created.value.id);

    await user.click(screen.getByRole("button", { name: "Accept" })); // action 1
    await user.click(screen.getByRole("button", { name: "Confirm" })); // action 2

    expect(getChangeRequest(created.value.id)?.status).toBe("Agreed");
  });

  it("reaches Declined via Decline, typing a reason, then Confirm, with typing not counted as an action", async () => {
    const user = userEvent.setup();
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Work trip",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    renderCard(created.value.id);

    await user.click(screen.getByRole("button", { name: "Decline" })); // action 1
    await user.type(screen.getByLabelText("Reason"), "Kids have plans"); // typing, not an action
    await user.click(screen.getByRole("button", { name: "Confirm" })); // action 2

    expect(getChangeRequest(created.value.id)?.status).toBe("Declined");
  });

  it("does not render a respond control on a parent's own request", () => {
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

    expect(screen.queryByRole("button", { name: "Accept" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Decline" })).not.toBeInTheDocument();
  });
});
