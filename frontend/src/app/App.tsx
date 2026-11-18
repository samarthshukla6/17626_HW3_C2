import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Inbox,
  MapPin,
  ScrollText,
  SlidersHorizontal,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { buildMockSchedule } from "../domain/mockData";
import { setScheduleEntries, getScheduleEntries } from "../domain/schedule";
import { loadState, resetDemoData, STORAGE_KEY } from "../domain/store";
import { getHomeSummary } from "../domain/record";
import { formatDateTime } from "../domain/format";
import { getServerTime } from "../domain/clock";
import { isOnline } from "../domain/offlineQueue";
import type { ChangeRequestView } from "../domain/requests";
import type { Parent } from "../domain/types";
import { strings } from "../copy/strings";
import { ViewingAsSwitch } from "./ViewingAsSwitch";
import { CustodyCalendar } from "./CustodyCalendar";
import { ExchangePanel } from "./ExchangePanel";
import { Requests } from "./Requests";
import { History } from "./History";
import { DemoControls } from "./DemoControls";
import { Avatar } from "./ui/Avatar";

/**
 * T059: seeds the schedule and loads (or creates) persisted state
 * synchronously, as part of the render call itself - not in a useEffect,
 * which only runs after the first render has already committed. Calling
 * this from the component body, guarded so it only runs once, means the
 * very first render already sees real data (e.g. "Next exchange").
 */
let seeded = false;
function ensureSeeded(): void {
  if (seeded) {
    return;
  }
  seeded = true;
  setScheduleEntries(buildMockSchedule());
  if (localStorage.getItem(STORAGE_KEY)) {
    loadState();
  } else {
    resetDemoData();
  }
}

/** Test-only: lets a fresh test re-seed from a clean slate. */
export function _resetAppSeed(): void {
  seeded = false;
}

/**
 * FR-002 (F-15): one screen, no navigation. The next exchange, the Schedule
 * calendar, the selected exchange with its history and request form, the
 * Requests list and the full History are all visible together. On a desktop
 * the page itself never scrolls; long panels scroll inside themselves. Below
 * 1024px the panels stack (NFR-01, usable at 375px). Demo Controls stay in a
 * separate drawer, apart from the product.
 */
export function App(): React.ReactElement {
  ensureSeeded();

  const [viewer, setViewer] = useState<Parent>("Melissa");
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [highlightId, setHighlightId] = useState<string | undefined>(undefined);
  const [showDemoControls, setShowDemoControls] = useState(false);
  // T085 (REQ-02, REQ-03, F-13): the confirmation belongs to the parent who
  // submitted, and is cleared when the viewer changes or they pick another
  // exchange.
  const [submissionMessage, setSubmissionMessage] = useState<
    { text: string; author: Parent } | undefined
  >(undefined);
  const [, setRefreshToken] = useState(0);

  function onChanged(): void {
    setRefreshToken((n) => n + 1);
  }

  function changeViewer(parent: Parent): void {
    setSubmissionMessage(undefined);
    setHighlightId(undefined);
    setViewer(parent);
  }

  function selectExchange(entryId: string): void {
    setSubmissionMessage(undefined);
    setSelectedId(entryId);
  }

  function handleRequestCreated(request: ChangeRequestView): void {
    setSubmissionMessage({
      text: request.savedOnDeviceWrittenTime ? strings.savedOnDeviceNotSentYet() : strings.requestSubmitted(),
      author: request.proposer,
    });
    setHighlightId(request.id);
    onChanged();
  }

  const summary = getHomeSummary(viewer);
  const next = summary.nextExchange;
  const entries = [...getScheduleEntries()].sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));
  const activeId = selectedId ?? next?.id ?? entries[0]?.id;
  const upcoming = next ? entries.filter((e) => e.startDateTime > next.startDateTime).slice(0, 3) : [];
  const online = isOnline(viewer);

  let countdown = "";
  if (next) {
    const ms = new Date(next.startDateTime).getTime() - getServerTime().getTime();
    const totalHours = Math.max(0, Math.floor(ms / 3600000));
    countdown = strings.timeUntil(Math.floor(totalHours / 24), totalHours % 24);
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="26" height="26">
              <circle cx="12" cy="13" r="6" />
              <circle cx="21" cy="13" r="6" />
              <path d="M5 27c1.5-5 5-7 7-7s3.2.8 4 2c.8-1.2 2-2 4-2s5.5 2 7 7" />
            </svg>
          </span>
          <span>
            <span className="brand__name">{strings.appName()}</span>
            <span className="brand__tagline">{strings.appTagline()}</span>
          </span>
        </div>

        <ViewingAsSwitch viewer={viewer} onChange={changeViewer} />

        <div className="topbar__chips">
          <span className="chip">
            <Clock3 size={14} /> {strings.serverTimeChip(formatDateTime(getServerTime().toISOString()))}
          </span>
          <span className={`chip ${online ? "chip--ok" : "chip--off"}`}>
            {online ? <Wifi size={14} /> : <WifiOff size={14} />} {strings.connectionChip(online)}
          </span>
          <button type="button" className="demo-toggle" onClick={() => setShowDemoControls((v) => !v)}>
            <SlidersHorizontal size={15} /> {strings.demoControlsButton()}
          </button>
        </div>
      </header>

      {submissionMessage && submissionMessage.author === viewer ? (
        <p role="status" className="toast">
          <CheckCircle2 size={16} /> {submissionMessage.text}
          <button
            type="button"
            className="icon-button toast__close"
            aria-label="Dismiss"
            onClick={() => setSubmissionMessage(undefined)}
          >
            <X size={14} />
          </button>
        </p>
      ) : null}

      <main className="dashboard">
        <section className="card card--hero" aria-label={strings.nextExchangeTitle()}>
          {next ? (
            <div className="hero">
              <Avatar parent={next.whoseTimeBegins} size={64} className="hero__avatar" />
              <div className="hero__body">
                <p className="hero__eyebrow">
                  {strings.greeting(viewer)} · {strings.nextExchangeTitle()}
                </p>
                <p className="hero__line">
                  {strings.nextExchange(formatDateTime(next.startDateTime), next.location, next.whoseTimeBegins, next.kind)}
                </p>
                <div className="hero__chips">
                  <span className="chip chip--accent"><Clock3 size={14} /> {countdown}</span>
                  <span className="chip"><MapPin size={14} /> {next.location}</span>
                </div>
              </div>
              {upcoming.length > 0 ? (
                <ol className="upcoming">
                  {upcoming.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className={`upcoming__item${entry.id === activeId ? " upcoming__item--active" : ""}`}
                        onClick={() => selectExchange(entry.id)}
                      >
                        <Avatar parent={entry.whoseTimeBegins} size={22} />
                        {formatDateTime(entry.startDateTime)}
                      </button>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="card card--requests" aria-labelledby="requests-title">
          <h2 id="requests-title" className="card__title">
            <Inbox size={18} /> {strings.requestsTitle()}
            {summary.waitingOnYou.length > 0 ? <span className="badge">{summary.waitingOnYou.length}</span> : null}
          </h2>
          <div className="card__body">
            <Requests viewer={viewer} highlightId={highlightId} onChanged={onChanged} />
          </div>
        </section>

        <section className="card card--calendar" aria-labelledby="schedule-title">
          <h2 id="schedule-title" className="card__title">
            <CalendarDays size={18} /> {strings.scheduleTitle()}
          </h2>
          <p className="card__hint">{strings.calendarHint()}</p>
          <CustodyCalendar selectedId={activeId} onSelect={selectExchange} />
        </section>

        <section className="card card--exchange" aria-labelledby="exchange-title">
          <h2 id="exchange-title" className="card__title">
            <CalendarDays size={18} /> {strings.selectedExchangeTitle()}
          </h2>
          <div className="card__body">
            {activeId ? (
              <ExchangePanel
                key={`${viewer}-${activeId}`}
                scheduleEntryId={activeId}
                viewer={viewer}
                onRequestCreated={handleRequestCreated}
              />
            ) : null}
          </div>
        </section>

        <section className="card card--history" aria-labelledby="history-title">
          <h2 id="history-title" className="card__title">
            <ScrollText size={18} /> {strings.historyTitle()}
          </h2>
          <div className="card__body">
            <History />
          </div>
        </section>
      </main>

      {showDemoControls && (
        <div className="drawer">
          <button
            type="button"
            className="icon-button drawer__close"
            aria-label="Close demo controls"
            onClick={() => setShowDemoControls(false)}
          >
            <X size={16} />
          </button>
          <DemoControls onChanged={onChanged} />
        </div>
      )}
    </div>
  );
}
