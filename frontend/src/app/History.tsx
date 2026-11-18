import { getHistory } from "../domain/record";
import { formatDateTime } from "../domain/format";
import { strings } from "../copy/strings";
import { Avatar } from "./ui/Avatar";

/** REQ-02 (History area): every Case Record Entry, in time order. */
export function History(): React.ReactElement {
  const events = getHistory();

  return (
    <section aria-label="History" className="panel">
      <h2 className="visually-hidden">History</h2>
      {events.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        <ul className="timeline">
          {events.map((event) => (
            <li key={event.id} className="timeline-item">
              <Avatar parent={event.author} size={24} />
              <span className="timeline-item__description">{strings.historyLabel(event.type, event.author)}</span>
              <span className="timeline-item__time">{formatDateTime(event.serverTime)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
