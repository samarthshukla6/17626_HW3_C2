import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Schedule } from "../../src/app/Schedule";
import { resetDomain } from "../domain/testHelpers";

const JASON_WEEKEND = {
  id: "fri-20-nov",
  startDateTime: "2026-11-20T18:00:00.000Z",
  location: "school parking area",
  whoseTimeBegins: "Jason" as const,
};

describe("Schedule.tsx (T030): original entries render no edit/delete control", () => {
  beforeEach(() => {
    resetDomain([JASON_WEEKEND], "2026-11-18T18:00:00.000Z");
  });

  it("offers no edit or delete action on an original-plan entry", () => {
    render(<Schedule viewer="Melissa" />);
    expect(screen.getByTestId("schedule-row-fri-20-nov")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });
});
