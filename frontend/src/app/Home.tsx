import { useState } from "react";
import { MapPin, CalendarDays, Bell, Activity, Clock3 } from "lucide-react";
import { getHomeSummary } from "../domain/record";
import { getServerTime } from "../domain/clock";
import type { Parent } from "../domain/types";
import { strings } from "../copy/strings";
import { formatDateTime } from "../domain/format";
import { RequestCard } from "./RequestCard";
import { CustodyCalendar } from "./CustodyCalendar";
import { ActivityFeed } from "./ActivityFeed";
import { Avatar } from "./ui/Avatar";

interface HomeProps {
  viewer: Parent;
}

/** REQ-02: the first screen, next exchange and everything waiting on this parent. */
export function Home({ viewer }: HomeProps): React.ReactElement {
  const [, setRefreshToken] = useState(0);
  const summary = getHomeSummary(viewer);
  const others = summary.pendingInvolvingYou.filter((r) => !summary.waitingOnYou.some((w) => w.id === r.id));

  function onChanged(): void {
    setRefreshToken((n) => n + 1);
  }

  const next = summary.nextExchange;
  let countdown = "";
  if (next) {
    const ms = new Date(next.startDateTime).getTime() - getServerTime().getTime();
    const totalHours = Math.max(0, Math.floor(ms / 3600000));
    countdown = strings.timeUntil(Math.floor(totalHours / 24), totalHours % 24);
  }

  return (
    <section aria-label="Home" className="bento">
      <h2 className="visually-hidden">Home</h2>

      <article className="card card--hero">
        <header className="card__title">
          <CalendarDays size={18} /> {strings.nextExchangeTitle()}
        </header>
        {next ? (
          <div className="hero">
            <Avatar parent={next.whoseTimeBegins} size={72} className="hero__avatar" />
            <div className="hero__body">
              <p className="hero__line">
                {strings.nextExchange(
                  formatDateTime(next.startDateTime),
                  next.location,
                  next.whoseTimeBegins,
                  next.kind,
                )}
              </p>
              <div className="hero__chips">
                <span className="chip chip--accent"><Clock3 size={14} /> {countdown}</span>
                <span className="chip"><MapPin size={14} /> {next.location}</span>
              </div>
            </div>
          </div>
        ) : null}
      </article>

      <article className="card card--waiting">
        <header className="card__title">
          <Bell size={18} /> {strings.waitingTitle()}
          {summary.waitingOnYou.length > 0 ? <span className="badge">{summary.waitingOnYou.length}</span> : null}
        </header>
        <div className="card__body">
          {summary.waitingOnYou.length === 0 ? (
            <div className="empty">
              <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true" className="empty__art">
                <circle cx="32" cy="32" r="28" />
                <path d="M20 33 l8 8 l16 -18" />
              </svg>
              <p>{strings.nothingWaiting()}</p>
            </div>
          ) : (
            summary.waitingOnYou.map((request) => (
              <RequestCard key={request.id} request={request} viewer={viewer} onChanged={onChanged} />
            ))
          )}
          {others.length > 0 ? <p className="card__subtitle">{strings.otherPendingTitle()}</p> : null}
          {others.map((request) => (
            <RequestCard key={request.id} request={request} viewer={viewer} onChanged={onChanged} />
          ))}
        </div>
      </article>

      <article className="card card--calendar">
        <header className="card__title">
          <CalendarDays size={18} /> {strings.calendarTitle()}
        </header>
        <CustodyCalendar />
      </article>

      <article className="card card--activity">
        <header className="card__title">
          <Activity size={18} /> {strings.activityTitle()}
        </header>
        <div className="card__body">
          <ActivityFeed />
        </div>
      </article>
    </section>
  );
}
