import { getHistory } from "../domain/record";
import { formatDateTime } from "../domain/format";
import { strings } from "../copy/strings";
import { Avatar } from "./ui/Avatar";

/** REQ-02 (History area), REQ-11: every Case Record Entry, in time order. */
export function History(): React.ReactElement {
  const events = getHistory();

  if (events.length === 0) {
    return <p className="muted">{strings.noHistory()}</p>;
  }
  return (
    <ul className="timeline">
      {events.map((event) => (
        <li key={event.id} className="timeline-item">
          <Avatar parent={event.author} size={22} />
          <span className="timeline-item__description">{strings.historyLabel(event.type, event.author)}</span>
          <span className="timeline-item__time">{formatDateTime(event.serverTime)}</span>
        </li>
      ))}
    </ul>
  );
}
