import { useState } from "react";
import { buildMockSchedule } from "../domain/mockData";
import { setScheduleEntries, getScheduleEntries } from "../domain/schedule";
import { loadState, resetDemoData, STORAGE_KEY } from "../domain/store";
import type { Parent } from "../domain/types";
import { ViewingAsSwitch } from "./ViewingAsSwitch";
import { Home } from "./Home";
import { Schedule } from "./Schedule";
import { Requests } from "./Requests";
import { History } from "./History";
import { EventDetail } from "./EventDetail";
import { DemoControls } from "./DemoControls";
import { formatDateOnly, formatDateTime } from "../domain/format";
import { getServerTime } from "../domain/clock";
import { isOnline } from "../domain/offlineQueue";
import {
  CalendarRange,
  CheckCircle2,
  Clock3,
  Inbox,
  LayoutDashboard,
  ScrollText,
  SlidersHorizontal,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import type { ChangeRequestView } from "../domain/requests";
import { strings } from "../copy/strings";

type View = "home" | "schedule" | "requests" | "history" | "eventDetail";

/**
 * T059: seeds the schedule and loads (or creates) persisted state
 * synchronously, as part of the render call itself - not in a useEffect,
 * which only runs after the first render has already committed. Calling
 * this from the component body, guarded so it only runs once, means the
 * very first render already sees real data (e.g. Home's "Next exchange").
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
 * One page, no client-side routes (plan.md). Mobile-first, usable at 375px
 * (NFR-01, SC-007). The Demo Controls panel is reached only from the footer
 * button, kept visually and structurally separate from the product screens.
 */
export function App(): React.ReactElement {
  ensureSeeded();

  const [viewer, setViewer] = useState<Parent>("Melissa");
  const [view, setView] = useState<View>("home");
  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>(undefined);
  const [showDemoControls, setShowDemoControls] = useState(false);
  // T085 (REQ-02, REQ-03, F-13): the confirmation belongs to the parent who
  // submitted, and is cleared when the viewer changes or they navigate away.
  const [submissionMessage, setSubmissionMessage] = useState<
    { text: string; author: Parent } | undefined
  >(undefined);

  function changeViewer(parent: Parent): void {
    setSubmissionMessage(undefined);
    setViewer(parent);
  }

  function navigate(next: View): void {
    setSubmissionMessage(undefined);
    setView(next);
  }
  const [, setRefreshToken] = useState(0);

  function onChanged(): void {
    setRefreshToken((n) => n + 1);
  }

  function openEvent(entryId: string): void {
    setSelectedEntryId(entryId);
    setView("eventDetail");
  }

  function handleRequestCreated(request: ChangeRequestView): void {
    setSubmissionMessage({
      text: request.savedOnDeviceWrittenTime ? strings.savedOnDeviceNotSentYet() : strings.requestSubmitted(),
      author: request.proposer,
    });
    setView("requests");
  }

  const nav: { id: View; label: string; icon: React.ReactElement }[] = [
    { id: "home", label: "Home", icon: <LayoutDashboard size={18} /> },
    { id: "schedule", label: "Schedule", icon: <CalendarRange size={18} /> },
    { id: "requests", label: "Requests", icon: <Inbox size={18} /> },
    { id: "history", label: "History", icon: <ScrollText size={18} /> },
  ];
  const online = isOnline(viewer);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="30" height="30">
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

        <nav aria-label="Main navigation" className="nav">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav__item${view === item.id || (item.id === "schedule" && view === "eventDetail") ? " nav__item--active" : ""}`}
              onClick={() => navigate(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <footer className="sidebar__footer">
          <button type="button" className="demo-toggle" onClick={() => setShowDemoControls((v) => !v)}>
            <SlidersHorizontal size={16} />
            Demo controls
          </button>
        </footer>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar__titles">
            <p className="topbar__eyebrow">{strings.greeting(viewer)}</p>
            <p className="topbar__title">{strings.viewTitle(view)}</p>
          </div>
          <div className="topbar__chips">
            <span className="chip"><Clock3 size={14} /> {strings.serverTimeChip(formatDateTime(getServerTime().toISOString()))}</span>
            <span className={`chip ${online ? "chip--ok" : "chip--off"}`}>
              {online ? <Wifi size={14} /> : <WifiOff size={14} />} {strings.connectionChip(online)}
            </span>
          </div>
        </header>

        {submissionMessage && submissionMessage.author === viewer ? (
          <p role="status" className="submission-message">
            <CheckCircle2 size={16} /> {submissionMessage.text}
          </p>
        ) : null}

        <div className="content">
          {view === "home" && <Home viewer={viewer} />}
          {view === "schedule" && (
            <div className="schedule-view">
              <Schedule viewer={viewer} onRequestCreated={handleRequestCreated} />
              <div className="history-chips">
                <p className="card__subtitle">{strings.openHistoryFor()}</p>
                <div className="history-chips__list">
                  {getScheduleEntries().map((entry) => (
                    <button key={entry.id} type="button" className="chip-button" onClick={() => openEvent(entry.id)}>
                      Open {formatDateOnly(entry.startDateTime)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {view === "requests" && <Requests viewer={viewer} />}
          {view === "history" && <History />}
          {view === "eventDetail" && selectedEntryId && (
            <EventDetail
              scheduleEntryId={selectedEntryId}
              viewer={viewer}
              onRequestCreated={handleRequestCreated}
            />
          )}
        </div>
      </main>

      {showDemoControls && (
        <div className="drawer">
          <button type="button" className="icon-button drawer__close" aria-label="Close demo controls" onClick={() => setShowDemoControls(false)}>
            <X size={16} />
          </button>
          <DemoControls onChanged={onChanged} />
        </div>
      )}
    </div>
  );
}
