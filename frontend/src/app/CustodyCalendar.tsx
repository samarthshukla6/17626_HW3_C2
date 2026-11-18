import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSchedule } from "../domain/record";
import { getServerTime } from "../domain/clock";
import { strings } from "../copy/strings";
import type { Parent } from "../domain/types";
import { Avatar } from "./ui/Avatar";
import { formatDateOnly } from "../domain/format";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Month view of whose parenting time each day falls in, built only from the
 * court plan and agreed changes (REQ-01, REQ-07). It shows the schedule, not
 * anything about either parent's behaviour, so it stays within FR-012.
 */
interface CustodyCalendarProps {
  selectedId?: string;
  onSelect?: (entryId: string) => void;
}

export function CustodyCalendar({ selectedId, onSelect }: CustodyCalendarProps): React.ReactElement {
  const now = getServerTime();
  const [month, setMonth] = useState(() => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
  const rows = getSchedule();
  const entries = [...rows].sort((a, b) => a.entry.startDateTime.localeCompare(b.entry.startDateTime));

  const exchangeDays = new Set(entries.map((r) => dayKey(new Date(r.entry.startDateTime))));
  const entryByDay = new Map(entries.map((r) => [dayKey(new Date(r.entry.startDateTime)), r.entry.id]));
  const pendingDays = new Set(entries.filter((r) => r.pendingLabel).map((r) => dayKey(new Date(r.entry.startDateTime))));
  const agreedDays = new Set(
    entries.filter((r) => r.agreedChange).map((r) => dayKey(new Date(r.agreedChange!.request.proposedTime))),
  );

  function whoseDay(day: Date): Parent {
    const noon = new Date(day.getTime() + 12 * 3600 * 1000).toISOString();
    let current: Parent = "Melissa";
    for (const row of entries) {
      if (row.entry.startDateTime <= noon) {
        current = row.entry.whoseTimeBegins;
      }
    }
    return current;
  }

  const first = month;
  const offset = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), i + 1))),
  ];
  const today = dayKey(now);

  function shift(by: number): void {
    setMonth(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + by, 1)));
  }

  return (
    <div className="calendar">
      <div className="calendar__head">
        <button type="button" className="icon-button" aria-label="Previous month" onClick={() => shift(-1)}>
          <ChevronLeft size={16} />
        </button>
        <span className="calendar__month">
          {MONTHS[month.getUTCMonth()]} {month.getUTCFullYear()}
        </span>
        <button type="button" className="icon-button" aria-label="Next month" onClick={() => shift(1)}>
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="calendar__grid">
        {WEEKDAYS.map((w, i) => (
          <span key={`h${i}`} className="calendar__weekday">{w}</span>
        ))}
        {cells.map((day, i) => {
          if (!day) {
            return <span key={`e${i}`} />;
          }
          const key = dayKey(day);
          const who = whoseDay(day).toLowerCase();
          const classes = [
            "calendar__day",
            `calendar__day--${who}`,
            key === today ? "calendar__day--today" : "",
            exchangeDays.has(key) ? "calendar__day--exchange" : "",
            pendingDays.has(key) ? "calendar__day--pending" : "",
            agreedDays.has(key) ? "calendar__day--agreed" : "",
          ].join(" ");
          const entryId = entryByDay.get(key);
          if (entryId && onSelect) {
            // An exchange day is a button: choosing it opens that exchange in the
            // panel next to the calendar, on the same screen (FR-002, F-15).
            return (
              <button
                key={key}
                type="button"
                aria-label={`Open ${formatDateOnly(day)}`}
                aria-pressed={entryId === selectedId}
                className={`${classes} calendar__day--button${entryId === selectedId ? " calendar__day--selected" : ""}`}
                onClick={() => onSelect(entryId)}
              >
                {day.getUTCDate()}
              </button>
            );
          }
          return (
            <span key={key} className={classes}>
              {day.getUTCDate()}
            </span>
          );
        })}
      </div>
      <div className="calendar__legend">
        <span><Avatar parent="Melissa" size={18} /> {strings.parentsTime("Melissa")}</span>
        <span><Avatar parent="Jason" size={18} /> {strings.parentsTime("Jason")}</span>
        <span><i className="legend-dot legend-dot--exchange" /> {strings.calendarExchange()}</span>
        <span><i className="legend-dot legend-dot--pending" /> {strings.calendarPending()}</span>
        <span><i className="legend-dot legend-dot--agreed" /> {strings.calendarChange()}</span>
      </div>
    </div>
  );
}
