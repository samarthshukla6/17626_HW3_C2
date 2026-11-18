import { useState } from "react";
import { listRequestsFor } from "../domain/requests";
import type { Parent } from "../domain/types";
import { RequestCard } from "./RequestCard";

interface RequestsProps {
  viewer: Parent;
}

/** REQ-02 (Requests area), REQ-05, REQ-06: every request involving this parent. */
export function Requests({ viewer }: RequestsProps): React.ReactElement {
  const [, setRefreshToken] = useState(0);
  const requests = listRequestsFor(viewer);

  function onChanged(): void {
    setRefreshToken((n) => n + 1);
  }

  return (
    <section aria-label="Requests" className="panel">
      <h2 className="visually-hidden">Requests</h2>
      {requests.length === 0 ? (
        <p className="muted">No requests yet.</p>
      ) : (
        <div className="card-grid">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} viewer={viewer} onChanged={onChanged} />
          ))}
        </div>
      )}
    </section>
  );
}
