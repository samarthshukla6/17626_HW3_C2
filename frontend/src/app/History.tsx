import { getHistory } from "../domain/record";
import { formatDateTime } from "../domain/format";
import { strings } from "../copy/strings";

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
              <span className="timeline-item__description">{strings.historyLabel(event.type, event.author)}</span>
              <span className="timeline-item__time">{formatDateTime(event.serverTime)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
