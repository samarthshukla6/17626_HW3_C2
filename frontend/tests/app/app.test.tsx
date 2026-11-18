import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App, _resetAppSeed } from "../../src/app/App";
import { _resetLog } from "../../src/domain/events";
import { _resetOfflineQueue } from "../../src/domain/offlineQueue";
import { _resetScheduleEntries } from "../../src/domain/schedule";

describe("T059: schedule and state load before the first render", () => {
  beforeEach(() => {
    localStorage.clear();
    _resetLog();
    _resetOfflineQueue();
    _resetScheduleEntries();
    _resetAppSeed();
  });

  it('shows "Next exchange" on the very first render of Home, with no further state change', () => {
    render(<App />);
    expect(screen.getByText(/Next exchange:/)).toBeInTheDocument();
  });
});

describe("T062: event-detail buttons are labelled with the exchange date, not its id", () => {
  beforeEach(() => {
    localStorage.clear();
    _resetLog();
    _resetOfflineQueue();
    _resetScheduleEntries();
    _resetAppSeed();
  });

  it('labels the first entry\'s button "Open Fri 20 Nov", not its internal id', () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "Open Fri 20 Nov" })).toBeInTheDocument();
    expect(screen.queryByText(/weekend-1-pickup/)).not.toBeInTheDocument();
  });
});

describe("V2 selected parent and request submission feedback", () => {
  beforeEach(() => {
    localStorage.clear();
    _resetLog();
    _resetOfflineQueue();
    _resetScheduleEntries();
    _resetAppSeed();
  });

  it("makes the selected parent explicit", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText("Current parent: Melissa")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Jason" }));
    expect(screen.getByText("Current parent: Jason")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Jason" })).toHaveAttribute("aria-pressed", "true");
  });

  it("confirms a successful submission and shows the request in the Requests panel", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Jason" }));
    const requestButtons = screen.getAllByRole("button", { name: "Request a change" });
    await user.click(requestButtons[0]);
    const proposed = screen.getByLabelText("Proposed date and time") as HTMLInputElement;
    proposed.value = "2026-11-27T18:00";
    proposed.dispatchEvent(new Event("change", { bubbles: true }));
    await user.type(screen.getByLabelText("Reason"), "Dispatch changed my route");
    const submit = document.querySelector<HTMLButtonElement>(".request-form button[type='submit']");
    expect(submit).not.toBeNull();
    await user.click(submit!);
    expect(screen.getByText("Request submitted")).toBeInTheDocument();
    const requestsPanel = screen.getByRole("region", { name: "Requests" });
    expect(within(requestsPanel).getByText(/Dispatch changed my route/)).toBeInTheDocument();
  });
});

describe("F-15: everything on one screen, no navigation", () => {
  beforeEach(() => {
    localStorage.clear();
    _resetLog();
    _resetOfflineQueue();
    _resetScheduleEntries();
    _resetAppSeed();
  });

  it("shows the Schedule, Requests and History panels together, with no navigation", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Schedule" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Requests" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "History" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.getByText("Nothing is waiting for you.")).toBeInTheDocument();
  });

  it("opens the next exchange by default and another one when Jason picks it on the calendar", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Jason" }));
    const exchange = screen.getByRole("region", { name: "Selected exchange" });
    expect(within(exchange).getByText("Fri 20 Nov 18:00, Jason's weekend (court plan)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open Sun 22 Nov" }));
    expect(screen.getByRole("button", { name: "Open Sun 22 Nov" })).toHaveAttribute("aria-pressed", "true");
    expect(within(exchange).getByText("Sun 22 Nov 18:00, drop-off, Melissa's time begins (court plan)")).toBeInTheDocument();
    expect(within(exchange).getByRole("button", { name: "Request a change" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Requests" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "History" })).toBeInTheDocument();
  });
});
