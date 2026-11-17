import { useState } from "react";
import { getHomeSummary } from "../domain/record";
import type { Parent } from "../domain/types";
import { strings } from "../copy/strings";
import { formatDateTime } from "../domain/format";
import { RequestCard } from "./RequestCard";

interface HomeProps {
  viewer: Parent;
}

/** REQ-02: the first screen — next exchange and everything waiting on this parent. */
export function Home({ viewer }: HomeProps): React.ReactElement {
  const [, setRefreshToken] = useState(0);
  const summary = getHomeSummary(viewer);

  function onChanged(): void {
    setRefreshToken((n) => n + 1);
  }

  return (
    <section aria-label="Home">
      <h2>Home</h2>
      {summary.nextExchange ? (
        <p>
          {strings.nextExchange(
            formatDateTime(summary.nextExchange.startDateTime),
            summary.nextExchange.location,
            summary.nextExchange.whoseTimeBegins,
            summary.nextExchange.kind,
          )}
        </p>
      ) : null}

      {summary.waitingOnYou.length === 0 ? (
        <p>{strings.nothingWaiting()}</p>
      ) : (
        summary.waitingOnYou.map((request) => (
          <RequestCard key={request.id} request={request} viewer={viewer} onChanged={onChanged} />
        ))
      )}

      {summary.pendingInvolvingYou
        .filter((r) => !summary.waitingOnYou.some((w) => w.id === r.id))
        .map((request) => (
          <RequestCard key={request.id} request={request} viewer={viewer} onChanged={onChanged} />
        ))}
    </section>
  );
}
