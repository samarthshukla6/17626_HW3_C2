import { useState } from "react";
import { ArrowRightLeft, CarFront, Home as HomeIcon, MapPin } from "lucide-react";
import { getEventTimeline, getSchedule } from "../domain/record";
import { formatDateTime } from "../domain/format";
import type { Parent } from "../domain/types";
import type { ChangeRequestView } from "../domain/requests";
import { strings } from "../copy/strings";
import { RequestForm } from "./RequestForm";
import { Avatar } from "./ui/Avatar";

interface ExchangePanelProps {
  scheduleEntryId: string;
  viewer: Parent;
  onRequestCreated: (request: ChangeRequestView) => void;
}

/**
 * REQ-01, REQ-03, REQ-07, REQ-13 (F-15): the exchange chosen on the calendar.
 * Shows the original-plan entry (never editable), any pending or agreed
 * change next to it, that exchange's whole history in time order, and the
 * "Request a change" form, all without leaving the screen.
 */
export function ExchangePanel({ scheduleEntryId, viewer, onRequestCreated }: ExchangePanelProps): React.ReactElement | null {
  const [formOpenFor, setFormOpenFor] = useState<string | undefined>(undefined);
  const row = getSchedule().find((r) => r.entry.id === scheduleEntryId);
  const timeline = getEventTimeline(scheduleEntryId);
  if (!row || !timeline) {
    return null;
  }
  const { entry } = row;
  const showForm = formOpenFor === scheduleEntryId;

  return (
    <div className={`exchange exchange--${entry.whoseTimeBegins.toLowerCase()}`} data-testid={`schedule-row-${entry.id}`}>
      <div className="exchange__head">
        <Avatar parent={entry.whoseTimeBegins} size={44} />
        <div className="exchange__titles">
          <p className="exchange__original">
            {strings.originalPlanEntry(formatDateTime(entry.startDateTime), entry.whoseTimeBegins, entry.kind)}
          </p>
          <p className="exchange__meta">
            {entry.kind === "dropoff" ? <HomeIcon size={13} /> : <CarFront size={13} />}
            <MapPin size={13} /> {entry.location}
          </p>
        </div>
      </div>

      {row.pendingLabel ? <p className="exchange__pending">{row.pendingLabel}</p> : null}
      {row.agreedChange ? (
        <p className="exchange__agreed">
          <ArrowRightLeft size={14} /> {strings.agreedByBothParents(formatDateTime(row.agreedChange.request.proposedTime))}
        </p>
      ) : null}

      {showForm ? (
        <RequestForm
          affectedScheduleEntryId={entry.id}
          author={viewer}
          onCreated={(request) => {
            setFormOpenFor(undefined);
            onRequestCreated(request);
          }}
        />
      ) : (
        <button type="button" className="button-primary exchange__request" onClick={() => setFormOpenFor(entry.id)}>
          Request a change
        </button>
      )}

      <h3 className="card__subtitle">{strings.exchangeHistoryTitle()}</h3>
      {timeline.items.length === 0 ? (
        <p className="muted">{strings.noChangesForExchange()}</p>
      ) : (
        <ul className="timeline">
          {timeline.items.map((item) => (
            <li key={item.event.id} className="timeline-item">
              <Avatar parent={item.event.author} size={22} />
              <span className="timeline-item__description">{item.description}</span>
              <span className="timeline-item__time">{formatDateTime(item.event.serverTime)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
