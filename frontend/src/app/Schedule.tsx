import { useState } from "react";
import { getSchedule } from "../domain/record";
import { strings } from "../copy/strings";
import { formatDateTime } from "../domain/format";
import type { Parent } from "../domain/types";
import { RequestForm } from "./RequestForm";
import { Avatar } from "./ui/Avatar";
import { ArrowRightLeft, CarFront, Home as HomeIcon } from "lucide-react";
import type { ChangeRequestView } from "../domain/requests";

interface ScheduleProps {
  viewer: Parent;
  onRequestCreated?: (request: ChangeRequestView) => void;
}

/** REQ-01, REQ-03, REQ-07, REQ-10, REQ-14: original entries, never editable,
 * with agreed changes next to them, and a "Request a change" form per row. */
export function Schedule({ viewer, onRequestCreated }: ScheduleProps): React.ReactElement {
  const [, setRefreshToken] = useState(0);
  const [openFormFor, setOpenFormFor] = useState<string | undefined>(undefined);
  const rows = getSchedule();

  function onChanged(): void {
    setRefreshToken((n) => n + 1);
  }

  return (
    <section aria-label="Schedule" className="schedule">
      <h2 className="visually-hidden">Schedule</h2>
      <div className="schedule__grid">
      {rows.map((row) => (
        <div
          className={`schedule-row schedule-row--${row.entry.whoseTimeBegins.toLowerCase()}${row.agreedChange ? " schedule-row--changed" : ""}${row.pendingLabel ? " schedule-row--pending" : ""}`}
          key={row.entry.id}
          data-testid={`schedule-row-${row.entry.id}`}
        >
          <div className="schedule-row__head">
            <Avatar parent={row.entry.whoseTimeBegins} size={34} />
            <span className="schedule-row__kind">
              {row.entry.kind === "dropoff" ? <HomeIcon size={14} /> : <CarFront size={14} />}
            </span>
            {row.agreedChange ? <ArrowRightLeft size={16} className="schedule-row__changed-icon" /> : null}
          </div>
          <p className="schedule-row__original">
            {strings.originalPlanEntry(
              formatDateTime(row.entry.startDateTime),
              row.entry.whoseTimeBegins,
              row.entry.kind,
            )}
          </p>
          {row.pendingLabel ? <p className="schedule-row__pending">{row.pendingLabel}</p> : null}
          {row.agreedChange ? (
            <p className="schedule-row__agreed">
              {strings.agreedByBothParents(formatDateTime(row.agreedChange.request.proposedTime))}
            </p>
          ) : null}

          {openFormFor === row.entry.id ? (
            <RequestForm
              affectedScheduleEntryId={row.entry.id}
              author={viewer}
              onCreated={(request) => {
                setOpenFormFor(undefined);
                onChanged();
                onRequestCreated?.(request);
              }}
            />
          ) : (
            <button type="button" className="button-soft" onClick={() => setOpenFormFor(row.entry.id)}>
              Request a change
            </button>
          )}
        </div>
      ))}
      </div>
    </section>
  );
}
