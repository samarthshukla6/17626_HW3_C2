import { useEffect, useRef } from "react";
import { getHomeSummary } from "../domain/record";
import { listRequestsFor } from "../domain/requests";
import type { Parent } from "../domain/types";
import { strings } from "../copy/strings";
import { RequestCard } from "./RequestCard";

interface RequestsProps {
  viewer: Parent;
  highlightId?: string;
  onChanged: () => void;
}

/**
 * REQ-02 (Requests area), REQ-05, REQ-06: every request involving this
 * parent, with the ones waiting on them first. A request just submitted is
 * highlighted and scrolled into view, so the parent can see it landed (F-8).
 */
export function Requests({ viewer, highlightId, onChanged }: RequestsProps): React.ReactElement {
  const listRef = useRef<HTMLDivElement>(null);
  const summary = getHomeSummary(viewer);
  const waitingIds = new Set(summary.waitingOnYou.map((r) => r.id));
  const others = listRequestsFor(viewer)
    .filter((r) => !waitingIds.has(r.id))
    .reverse();

  useEffect(() => {
    if (!highlightId) {
      return;
    }
    const el = listRef.current?.querySelector<HTMLElement>(`[data-request-id="${highlightId}"]`);
    el?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
  }, [highlightId]);

  return (
    <div ref={listRef} className="requests">
      <h3 className="card__subtitle card__subtitle--first">{strings.waitingTitle()}</h3>
      {summary.waitingOnYou.length === 0 ? (
        <p className="nothing-waiting">{strings.nothingWaiting()}</p>
      ) : (
        summary.waitingOnYou.map((request) => (
          <div key={request.id} data-request-id={request.id}>
            <RequestCard key={`${viewer}-${request.id}`} request={request} viewer={viewer} onChanged={onChanged} />
          </div>
        ))
      )}

      <h3 className="card__subtitle">{strings.otherRequestsTitle()}</h3>
      {others.length === 0 ? (
        <p className="muted">{strings.noRequests()}</p>
      ) : (
        others.map((request) => (
          <div
            key={request.id}
            data-request-id={request.id}
            className={request.id === highlightId ? "request-highlight" : undefined}
          >
            <RequestCard key={`${viewer}-${request.id}`} request={request} viewer={viewer} onChanged={onChanged} />
          </div>
        ))
      )}
    </div>
  );
}
