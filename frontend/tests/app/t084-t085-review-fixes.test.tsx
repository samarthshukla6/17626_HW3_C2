import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RequestCard } from "../../src/app/RequestCard";
import { App, _resetAppSeed } from "../../src/app/App";
import { createRequest, getChangeRequest } from "../../src/domain/requests";
import { failNextDelivery, retryDelivery } from "../../src/domain/delivery";
import { getEvents } from "../../src/domain/events";
import { _resetLog } from "../../src/domain/events";
import { _resetOfflineQueue } from "../../src/domain/offlineQueue";
import { _resetScheduleEntries } from "../../src/domain/schedule";
import { advanceServerTime } from "../../src/domain/clock";
import { resetDomain, FRI_20_NOV } from "../domain/testHelpers";

describe("T084 (REQ-09, F-12): delivered and read are shown on separate lines", () => {
  beforeEach(() => {
    resetDomain([FRI_20_NOV], "2026-11-16T09:00:00.000Z");
  });

  it("keeps 'Delivered 09:00' visible after the request is read at 09:30", async () => {
    const user = userEvent.setup();
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Route change",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    advanceServerTime(30);
    const asMelissa = render(
      <RequestCard request={getChangeRequest(created.value.id)!} viewer="Melissa" onChanged={() => {}} />,
    );
    await user.click(screen.getByRole("button", { name: "Open details" }));
    asMelissa.unmount();

    render(<RequestCard request={getChangeRequest(created.value.id)!} viewer="Jason" onChanged={() => {}} />);
    expect(screen.getByText("Delivered 09:00")).toBeInTheDocument();
    expect(screen.getByText("Read 09:30")).toBeInTheDocument();
  });

  it("keeps an earlier failure visible after a successful retry", () => {
    failNextDelivery();
    const created = createRequest({
      author: "Jason",
      affectedScheduleEntryId: FRI_20_NOV.id,
      proposedTime: "2026-11-27T18:00:00.000Z",
      reason: "Route change",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const createEvent = getEvents(created.value.id).find((e) => e.type === "create")!;
    advanceServerTime(10);
    retryDelivery(createEvent.id, "Jason");

    render(<RequestCard request={getChangeRequest(created.value.id)!} viewer="Jason" onChanged={() => {}} />);
    expect(screen.getByText("Not delivered 09:00")).toBeInTheDocument();
    expect(screen.getByText("Delivered 09:10")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });
});

describe("T085 (REQ-02, REQ-03, F-13): the submission confirmation is only for the parent who submitted", () => {
  beforeEach(() => {
    localStorage.clear();
    _resetLog();
    _resetOfflineQueue();
    _resetScheduleEntries();
    _resetAppSeed();
  });

  async function submitAsJason(user: ReturnType<typeof userEvent.setup>): Promise<void> {
    await user.click(screen.getByRole("button", { name: "Jason" }));
    await user.click(screen.getAllByRole("button", { name: "Request a change" })[0]);
    const dateInput = document.querySelector<HTMLInputElement>("form.request-form input[type=datetime-local]")!;
    await user.type(dateInput, "2026-11-27T18:00");
    const reasonInput = document.querySelector<HTMLInputElement>("form.request-form input:not([type])")!;
    await user.type(reasonInput, "Route change");
    await user.click(document.querySelector<HTMLButtonElement>("form.request-form button[type=submit]")!);
  }

  it("shows 'Request submitted' to Jason but not after switching to Melissa", async () => {
    const user = userEvent.setup();
    render(<App />);
    await submitAsJason(user);
    expect(screen.getByRole("status")).toHaveTextContent("Request submitted");

    await user.click(screen.getByRole("button", { name: "Melissa" }));
    expect(screen.queryByText("Request submitted")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Jason" }));
    expect(screen.queryByText("Request submitted")).not.toBeInTheDocument();
  });

  it("clears the confirmation when Jason picks another exchange", async () => {
    const user = userEvent.setup();
    render(<App />);
    await submitAsJason(user);
    await user.click(screen.getByRole("button", { name: "Open Sun 22 Nov" }));
    expect(screen.queryByText("Request submitted")).not.toBeInTheDocument();
  });
});
