# Phase 0 Research: Schedule Change & Trusted Record

All technology choices arrived already decided in the planning input (Vite + React + TypeScript,
Vitest, React Testing Library, Vercel static hosting, `localStorage`). Nothing in the Technical
Context is marked `NEEDS CLARIFICATION`. This file resolves the design-level decisions the tech
choices still leave open, so Phase 1 has a settled foundation to model against.

The spec's own `[NEEDS CLARIFICATION: Q-1 / Q-2 / Q-3 / Q-4]` markers are business questions for
stakeholders (court-order interpretation, real reply-time windows), not implementation unknowns.
Per the constitution's Development Workflow, they block only the parts of planning that depend on
their answer, not planning itself, so this plan builds against the documented working
assumptions (A-3, A-4) and keeps the markers visible rather than resolving them here.

## Decision: event-sourced domain store

**Decision**: The domain layer holds one append-only array of typed `Event`s. Every read model
(a request's current status, its notice label, the History view) is computed by folding over
that array at read time, never stored as separately-maintained mutable state.

**Rationale**: matches FR-011 (append-only case record) and Constitution Principle III directly,
and is exactly what the planning input asks for ("Every view is derived from the event log").
Keeping one source of truth means there is no second place for a status or timestamp to drift
out of sync with the log a reviewer or mediator would actually read (FR-013).

**Alternatives considered**: a mutable "current request" record per request plus a separate audit
log (rejected, two sources of truth that a test or a future edit could silently let diverge,
which is the exact failure mode FR-011 exists to prevent).

## Decision: clocks are simulated values, never wall-clock time

**Decision**: One server clock value lives in the store, advanced or set only through Demo
Controls. Each parent has a device-clock offset (minutes, signed) applied to the server clock to
produce that parent's phone time. Domain code never calls `Date.now()` or `new Date()` with no
argument.

**Rationale**: FR-009's exact-timestamp scenarios (e.g., the 47:59 vs. 48:00 boundary in
REQ-04/REQ-08) must be reproducible exactly in a test and by hand in the running demo; real
wall-clock time would make both nondeterministic and slow to exercise.

**Alternatives considered**: driving the demo off real elapsed time with accelerated
`setTimeout` ticks (rejected, still nondeterministic for tests, and cannot land exactly on an
hour boundary without extra synchronization code the prototype doesn't need).

## Decision: one versioned `localStorage` key, atomic reset

**Decision**: Entire client state (event log, server clock, each parent's device offset, online
state, and offline queue) is one JSON blob under a single versioned key. "Reset demo data"
deletes that key and reseeds from `mockData.ts` (A-6).

**Rationale**: simplest persistence that satisfies Principle VII; a single key makes reset
atomic, there is no risk of resetting the schedule but leaving a stale clock or a half-cleared
queue behind.

**Alternatives considered**: one `localStorage` key per entity type (rejected, no benefit at
this scale, and reset would need to enumerate and clear each key correctly).

## Decision: all system text through one `copy/strings` module

**Decision**: Every string the system shows (statuses, notice labels, overdue/lapsed messages,
validation errors) is a named template in `src/copy/strings.ts`. No component or domain function
builds user-facing text inline.

**Rationale**: FR-012's word list is closed (clarified during `/speckit-checklist`); SC-005
claims "zero occurrences" is checkable. That claim is only mechanically testable if every string
that could ever reach a screen is enumerable from one module, rather than scattered across
components where a future edit could reintroduce banned wording unnoticed.

**Alternatives considered**: inline string literals in components (rejected, makes SC-005 a
manual-review claim instead of an automated one, and manual review is exactly what Principle V
is trying to avoid depending on).

## Decision: Vitest + React Testing Library, no end-to-end tool

**Decision**: Vitest with the `jsdom` environment runs both the domain unit tests and the one
React Testing Library test for FR-006. `npm test` is `vitest run` (no watch mode, per the
planning input).

**Rationale**: this is the pairing the planning input specifies, and it is sufficient: the
domain layer carries essentially all the testable logic (Constitution Principle VI), and FR-006
is the one place UI interaction sequencing itself (two actions, not the rule behind them) needs
its own test.

**Alternatives considered**: adding Playwright/Cypress for full end-to-end coverage (rejected , 
unnecessary dependency weight for a one-page prototype with no server to exercise end-to-end;
every REQ's business behavior is already reachable through the domain layer's own tests).

## Decision: static build, zero rewrites

**Decision**: `vite build` produces a static `dist/` deployed to Vercel with no server
functions and no `vercel.json` rewrite rules.

**Rationale**: the planning input is explicit that this is one page with no client-side routes,
so there is nothing for a rewrite rule to redirect to.

**Alternatives considered**: a client-side router (e.g., React Router) with a SPA-fallback
rewrite (rejected, there is only one page; a router would add a dependency and a deploy-config
requirement the feature doesn't need).

## Output

No `NEEDS CLARIFICATION` markers remain in the Technical Context. Phase 1 proceeds.
