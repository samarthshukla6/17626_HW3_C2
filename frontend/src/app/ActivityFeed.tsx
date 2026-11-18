import { getHistory } from "../domain/record";
import { formatDateTime } from "../domain/format";
import { strings } from "../copy/strings";
import { Avatar } from "./ui/Avatar";

/** The latest record entries, newest first, for the overview (REQ-11, REQ-12). */
export function ActivityFeed({ limit = 6 }: { limit?: number }): React.ReactElement {
  const events = [...getHistory()].reverse().slice(0, limit);
  if (events.length === 0) {
    return <p className="muted">{strings.noActivity()}</p>;
  }
  return (
    <ol className="feed">
      {events.map((event) => (
        <li key={event.id} className="feed__item">
          <Avatar parent={event.author} size={26} />
          <div>
            <p className="feed__label">{strings.historyLabel(event.type, event.author)}</p>
            <p className="feed__time">{formatDateTime(event.serverTime)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
