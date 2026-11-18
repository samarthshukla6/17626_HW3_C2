# Implementation Plan: Schedule Change & Trusted Record

**Branch**: `001-schedule-change-record` | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-schedule-change-record/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Build FR-001–FR-014 as a frontend-only prototype (Vite + React + TypeScript) deployed as a
static site on Vercel. A framework-free domain layer (event log, simulated server clock,
per-parent device clock and offline queue, notice/status/overdue derivation) is the only place
business rules live; every UI view is a read derived from that append-only event log. State
persists to `localStorage` with a "Reset demo data" escape hatch. A labelled Demo Controls panel
drives the server clock, device-clock skew, online/offline state, and simulated delivery
failure, so every Acceptance Example in the spec can be reproduced by hand. Vitest covers the
domain layer one `describe` block per REQ ID; React Testing Library covers the two-action
respond flow (FR-006).

## Technical Context

**Language/Version**: TypeScript 5.x, React 18, Node 20+ (build tooling only; nothing server-side ships)

**Primary Dependencies**: Vite (build/dev server), React + ReactDOM, Vitest (+ `jsdom` test
environment), `@testing-library/react`, `@testing-library/user-event`

**Storage**: Browser `localStorage` only, one versioned JSON key holding the event log, clock
state, and per-parent online/offline flags. No database, no backend.

**Testing**: `vitest run` (non-watch; `npm test` maps to this exactly) for domain-layer unit
tests, one `describe` block per REQ ID covering every scenario in spec.md's "Acceptance Examples
(exact values)"; `@testing-library/react` + `@testing-library/user-event` for the FR-006
two-action respond flow.

**Target Platform**: Static web page served by Vercel (no server functions, no rewrites, there
is exactly one page and no client-side routes). Mobile-first, usable down to 375px (NFR-01);
evergreen desktop/mobile browsers.

**Project Type**: web (frontend-only). A single `frontend/` project, there is no `backend/`,
so the template's frontend+backend split does not apply.

**Performance Goals**: None beyond a responsive prototype UI; this is a requirements prototype,
not a system under load (Constitution Principle VII).

**Constraints**: No server routes or backend of any kind (NFR-02, Constitution Principle VII);
domain logic MUST be pure TypeScript with no React dependency (Constitution Principle VI); every
in-scope screen MUST render usably at 375px width (NFR-01); `npm test` MUST run once and exit
(`vitest run`), never watch mode.

**Scale/Scope**: One case, two parent viewpoints (Melissa, Jason, A-1), mock data only (A-6).
Not multi-tenant, not multi-case.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. Spec-Bounded Scope | Plan covers exactly FR-001–FR-014 / NFR-01–03; no screen or capability beyond them (Demo Controls is explicitly labelled as a testing aid, not a product feature) | PASS |
| II. Traceability | Vitest `describe` blocks are one per REQ ID; domain modules and UI components are named after the FR/REQ they serve | PASS |
| III. Append-Only Case Record | Domain layer is event-sourced: the event log is the only persisted record of actions, append-only by construction, with author + simulated-server time on every event | PASS |
| IV. Mutual Acceptance Only | Status is a pure derivation from events; "Agreed" only derives from an explicit `accept` event, never from clock advancement or any other event type | PASS |
| V. Neutral, Equal Treatment | All system-facing text routed through one `copy/strings` module so FR-012's closed word list (SC-005) is mechanically checkable; both parents render through the same components with no parent-specific branching in wording | PASS |
| VI. Tested, Separated Domain Logic | Domain layer (`src/domain/`) has zero React imports; UI (`src/app/`) only calls domain functions and renders their derived results | PASS |
| VII. Prototype Simplicity | Mock data (A-6) seeded at reset; no backend; no real auth (A-1's "Viewing as" switch); two-action respond flow (FR-006); 375px mobile-first | PASS |
| VIII. Phased Review | Q-1–Q-4 remain `[NEEDS CLARIFICATION]` in spec.md and are deliberately not resolved here; the plan builds against the documented working assumptions A-3/A-4 instead, per the Development Workflow section | PASS (proceeding on assumptions, not guesses) |

No violations. Complexity Tracking table is omitted below as a result.

*Post-Phase-1 re-check*: data-model.md and the contracts keep the domain layer's only state as
the event log plus clock/offline-queue state (no new persisted entity introduced outside that);
UI contract still routes every mutation through the domain API. No new violations. PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-schedule-change-record/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── domain-api.md
│   └── ui-contract.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── domain/                  # pure TypeScript, no React, Constitution Principle VI
│   │   ├── events.ts            # Event/CaseRecordEntry type, appendEvent, getEvents (REQ-11)
│   │   ├── clock.ts             # simulated server clock + per-parent device offset (REQ-09)
│   │   ├── offlineQueue.ts      # per-parent save/flush of unsent items (REQ-10)
│   │   ├── delivery.ts          # delivered / read / delivery-failed events (REQ-09)
│   │   ├── requests.ts          # create/edit/withdraw/respond, status + notice + overdue
│   │   │                        # derivation (REQ-03, 04, 05, 06, 08, 14)
│   │   ├── record.ts            # Home, Schedule, History and event-detail views (REQ-01, 02, 07, 13)
│   │   ├── mockData.ts          # A-6 seed schedule and starting clock
│   │   └── store.ts             # localStorage load/save/reset (NFR-02, A-2)
│   ├── copy/
│   │   └── strings.ts           # every system-facing string; backs FR-012 / SC-005
│   └── app/                     # React UI, calls domain/, never reimplements rules
│       ├── App.tsx
│       ├── ViewingAsSwitch.tsx  # A-1
│       ├── Home.tsx             # first screen / summary (REQ-02)
│       ├── Schedule.tsx         # REQ-01, REQ-02
│       ├── Requests.tsx         # REQ-02, REQ-05, REQ-06
│       ├── History.tsx         # REQ-02, REQ-13
│       ├── EventDetail.tsx      # REQ-13
│       ├── RequestCard.tsx      # shared request card (REQ-05, 06, 08, 09, 10, 11, 14)
│       └── DemoControls.tsx     # labelled testing aid, not part of the product
└── tests/
    ├── domain/                  # one file (one `describe`) per REQ ID
    │   ├── req-01.test.ts
    │   ├── req-02.test.ts
    │   ├── ...
    │   └── req-14.test.ts
    └── app/
        └── respond-flow.test.tsx  # React Testing Library, FR-006
```

**Structure Decision**: single `frontend/` project at the repo root; no `backend/` directory , 
there is no server component (Technical Context). Domain logic and UI are separate top-level
folders inside `src/` so the domain layer's framework-free constraint (Principle VI) is visible
in the file layout, not just a convention.

## Complexity Tracking

*No Constitution Check violations, table intentionally omitted.*

## V2 revision plan

V2 changes only behavior traced from F-1 to F-10. The event log remains append-only, the server clock remains trusted, and REQ-01 to REQ-14 stay stable.

### Domain changes

- A locally queued item has no server request status and carries its written device time (F-1, F-2, REQ-05, REQ-10).
- Notice keeps the server-received calculation official and adds written-time context when the figures differ (F-6, REQ-04).
- Delivery distinguishes waiting for an offline recipient, failed, delivered and read. Retry appends new delivery evidence and keeps the failure event (F-4, F-5, REQ-09, REQ-11).
- Read is recorded only from an explicit detail-open action, never from rendering Home or Requests (F-3, A-12, REQ-09).

### UI changes

- The selected parent has a persistent pressed style and visible current-parent label (F-7, REQ-02).
- Successful submission opens Requests and shows a confirmation banner (F-8, REQ-02, REQ-03).
- Event descriptions and timestamps use separate lines at 375 px (F-9, REQ-09, REQ-13).
- The decline alternative control stores its raw local input until confirmation, then converts it once (F-10, REQ-06).

### Tests and trade-offs

V2 tests use the exact examples in `spec.md`. Domain tests cover notice context, queued semantics and delivery retry. App tests cover explicit read, selected-parent state, submission feedback, readable timestamps and the alternative control. V1 tests remain as regression coverage, with expected copy changed only where the V2 spec changed it.

V2 provides explicit retry, not production background retry scheduling. Push notifications, retry limits and network backoff need real infrastructure and remain outside this prototype. Q-3 stays open: V2 displays both figures but does not make unverified phone time authoritative.

### Consistency analysis

The V2 spec, plan, data model, contracts and Phase 10 tasks cover every changed requirement and finding. No Constitution conflict, uncovered V2 requirement, or unowned task remains. The Spec Kit prerequisite check passes when `SPECIFY_FEATURE_DIRECTORY` points to this feature. This older checkout has no `.specify/feature.json`, so the explicit directory is required. No HIGH or CRITICAL inconsistency remains.
