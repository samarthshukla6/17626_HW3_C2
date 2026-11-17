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
            <li key={event.id}>
              {formatDateTime(event.serverTime)} — {event.author} — {event.type}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
