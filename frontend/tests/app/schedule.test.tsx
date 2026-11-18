import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExchangePanel } from "../../src/app/ExchangePanel";
import { resetDomain } from "../domain/testHelpers";

const JASON_WEEKEND = {
  id: "fri-20-nov",
  startDateTime: "2026-11-20T18:00:00.000Z",
  location: "school parking area",
  whoseTimeBegins: "Jason" as const,
};

describe("ExchangePanel (T030, F-15): original entries render no edit/delete control", () => {
  beforeEach(() => {
    resetDomain([JASON_WEEKEND], "2026-11-18T18:00:00.000Z");
  });

  it("offers no edit or delete action on an original-plan entry", () => {
    render(<ExchangePanel scheduleEntryId="fri-20-nov" viewer="Melissa" onRequestCreated={() => {}} />);
    expect(screen.getByTestId("schedule-row-fri-20-nov")).toBeInTheDocument();
    expect(screen.getByText("Fri 20 Nov 18:00, Jason's weekend (court plan)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });
});
