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
import { formatDateOnly } from "../domain/format";
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

  return (
    <div className="app" style={{ maxWidth: "375px", margin: "0 auto" }}>
      <ViewingAsSwitch viewer={viewer} onChange={changeViewer} />

      {submissionMessage && submissionMessage.author === viewer ? (
        <p role="status" className="submission-message">{submissionMessage.text}</p>
      ) : null}

      <nav aria-label="Main navigation">
        <button type="button" onClick={() => navigate("home")}>
          Home
        </button>
        <button type="button" onClick={() => navigate("schedule")}>
          Schedule
        </button>
        <button type="button" onClick={() => navigate("requests")}>
          Requests
        </button>
        <button type="button" onClick={() => navigate("history")}>
          History
        </button>
      </nav>

      {view === "home" && <Home viewer={viewer} />}
      {view === "schedule" && (
        <div>
          <Schedule viewer={viewer} onRequestCreated={handleRequestCreated} />
          {getScheduleEntries().map((entry) => (
            <button key={entry.id} type="button" onClick={() => openEvent(entry.id)}>
              Open {formatDateOnly(entry.startDateTime)}
            </button>
          ))}
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

      <footer>
        <button type="button" onClick={() => setShowDemoControls((v) => !v)}>
          Demo controls
        </button>
      </footer>

      {showDemoControls && <DemoControls onChanged={onChanged} />}
    </div>
  );
}
