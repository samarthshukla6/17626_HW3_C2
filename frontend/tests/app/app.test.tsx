import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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

  it('labels the first entry\'s button "Open Fri 20 Nov", not its internal id', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Schedule" }));

    expect(screen.getByRole("button", { name: "Open Fri 20 Nov" })).toBeInTheDocument();
    expect(screen.queryByText(/weekend-1-pickup/)).not.toBeInTheDocument();
  });
});
