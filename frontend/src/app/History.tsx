import { getHistory } from "../domain/record";
import { formatDateTime } from "../domain/format";

/** REQ-02 (History area): every Case Record Entry, in time order. */
export function History(): React.ReactElement {
  const events = getHistory();

  return (
    <section aria-label="History">
      <h2>History</h2>
      {events.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id} className="timeline-item">
              <span className="timeline-item__description">{event.author}: {event.type}</span>
              <span className="timeline-item__time">{formatDateTime(event.serverTime)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
