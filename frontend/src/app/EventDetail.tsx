import { useState } from "react";
import { getEventTimeline } from "../domain/record";
import { formatDateTime } from "../domain/format";
import type { Parent } from "../domain/types";
import { RequestForm } from "./RequestForm";
import type { ChangeRequestView } from "../domain/requests";

interface EventDetailProps {
  scheduleEntryId: string;
  viewer: Parent;
  onRequestCreated?: (request: ChangeRequestView) => void;
}

/** REQ-03, REQ-13: one event's whole history, in time order, in one view,
 * plus a "Request a change" form for this entry. */
export function EventDetail({ scheduleEntryId, viewer, onRequestCreated }: EventDetailProps): React.ReactElement {
  const [, setRefreshToken] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const timeline = getEventTimeline(scheduleEntryId);

  if (!timeline) {
    return <p>Unknown event.</p>;
  }

  function onChanged(): void {
    setRefreshToken((n) => n + 1);
  }

  return (
    <section aria-label="Event detail">
      <h2>{formatDateTime(timeline.entry.startDateTime)}</h2>
      <ul>
        {timeline.items.map((item) => (
          <li key={item.event.id} className="timeline-item">
            <span className="timeline-item__description">{item.description}</span>
            <span className="timeline-item__time">{formatDateTime(item.event.serverTime)}</span>
          </li>
        ))}
      </ul>

      {showForm ? (
        <RequestForm
          affectedScheduleEntryId={scheduleEntryId}
          author={viewer}
          onCreated={(request) => {
            setShowForm(false);
            onChanged();
            onRequestCreated?.(request);
          }}
        />
      ) : (
        <button type="button" onClick={() => setShowForm(true)}>
          Request a change
        </button>
      )}
    </section>
  );
}
