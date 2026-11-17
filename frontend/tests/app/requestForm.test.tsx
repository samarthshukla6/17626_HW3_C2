import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RequestForm } from "../../src/app/RequestForm";
import { setOnline } from "../../src/domain/offlineQueue";
import { listRequestsFor } from "../../src/domain/requests";
import { resetDomain, FRI_20_NOV } from "../domain/testHelpers";

function fillProposedTime(value: string) {
  const input = screen.getByLabelText("Proposed date and time") as HTMLInputElement;
  Object.defineProperty(input, "value", { value, writable: true });
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

describe("T057: Request a change form", () => {
  beforeEach(() => {
    resetDomain([FRI_20_NOV], "2026-11-18T18:00:00.000Z");
  });

  it("shows 'Add a reason for the change' inline and does not create a request when reason is missing", async () => {
    const user = userEvent.setup();
    render(<RequestForm affectedScheduleEntryId={FRI_20_NOV.id} author="Jason" onCreated={() => {}} />);

    fillProposedTime("2026-11-27T18:00");
    await user.click(screen.getByRole("button", { name: "Request a change" }));

    expect(screen.getByText("Add a reason for the change")).toBeInTheDocument();
    expect(listRequestsFor("Jason")).toHaveLength(0);
  });

  it("creates the request and calls onCreated when the form is valid", async () => {
    const user = userEvent.setup();
    let created = false;
    render(
      <RequestForm
        affectedScheduleEntryId={FRI_20_NOV.id}
        author="Jason"
        onCreated={() => {
          created = true;
        }}
      />,
    );

    fillProposedTime("2026-11-27T18:00");
    await user.type(screen.getByLabelText("Reason"), "Work trip");
    await user.click(screen.getByRole("button", { name: "Request a change" }));

    expect(listRequestsFor("Jason")).toHaveLength(1);
    expect(created).toBe(true);
  });

  it("supports the emergency tag selector (none / illness / emergency)", async () => {
    const user = userEvent.setup();
    render(<RequestForm affectedScheduleEntryId={FRI_20_NOV.id} author="Jason" onCreated={() => {}} />);

    fillProposedTime("2026-11-19T08:00");
    await user.type(screen.getByLabelText("Reason"), "Sick child");
    await user.selectOptions(screen.getByLabelText("Emergency"), "illness");
    await user.click(screen.getByRole("button", { name: "Request a change" }));

    const requests = listRequestsFor("Jason");
    expect(requests).toHaveLength(1);
    expect(requests[0].emergencyTag).toBe("illness");
  });

  it('shows "Saved on this device, not sent yet" when submitted while offline', async () => {
    const user = userEvent.setup();
    setOnline("Jason", false);
    render(<RequestForm affectedScheduleEntryId={FRI_20_NOV.id} author="Jason" onCreated={() => {}} />);

    fillProposedTime("2026-11-27T18:00");
    await user.type(screen.getByLabelText("Reason"), "Work trip");
    await user.click(screen.getByRole("button", { name: "Request a change" }));

    expect(screen.getByText("Saved on this device, not sent yet")).toBeInTheDocument();
  });
});
