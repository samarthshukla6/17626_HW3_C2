import { useState } from "react";
import { getSchedule } from "../domain/record";
import { strings } from "../copy/strings";
import { formatDateTime } from "../domain/format";
import type { Parent } from "../domain/types";
import { RequestForm } from "./RequestForm";
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
    <section aria-label="Schedule">
      <h2>Schedule</h2>
      {rows.map((row) => (
        <div className="schedule-row" key={row.entry.id} data-testid={`schedule-row-${row.entry.id}`}>
          <p className="schedule-row__original">
            {strings.originalPlanEntry(
              formatDateTime(row.entry.startDateTime),
              row.entry.whoseTimeBegins,
              row.entry.kind,
            )}
          </p>
          {row.pendingLabel ? <p>{row.pendingLabel}</p> : null}
          {row.agreedChange ? (
            <p>
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
            <button type="button" onClick={() => setOpenFormFor(row.entry.id)}>
              Request a change
            </button>
          )}
        </div>
      ))}
    </section>
  );
}
