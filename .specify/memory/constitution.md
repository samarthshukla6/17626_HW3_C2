<!--
Sync Impact Report
Version change: (none) → 1.0.0
Rationale: Initial ratification. The template placeholders were still unfilled, so this is treated
as the first substantive version, not an amendment.
Modified principles: none (initial authoring)
Added sections:
  - Core Principles I–VIII (Spec-Bounded Scope; Traceability; Append-Only Case Record;
    Mutual Acceptance Only; Neutral, Equal Treatment; Tested, Separated Domain Logic;
    Prototype Simplicity; Phased Review with Explicit Clarification)
  - Scope Boundary
  - Development Workflow
  - Governance
Removed sections: none
Deferred / TODO placeholders: none
Templates/commands reviewed for alignment: not modified (out of scope for this command per
the Scope Guard); dependent Spec Kit templates read this constitution at runtime and do not
need edits for this change.
-->

# CoParent Record Constitution

## Core Principles

### I. Spec-Bounded Scope

The team builds only what `docs/initial-spec.md` asks for: REQ-01 through REQ-14 and NFR-01
through NFR-03. Anything not named there (a feature, a screen, a shortcut that "seems
natural") is out of scope for this sprint, no matter how small.

Why: the spec is the result of merging goal models and resolving conflicts between parents'
needs; building past it reintroduces the ambiguity that process was meant to remove.

### II. Traceability

Every functional requirement keeps its REQ ID from `docs/initial-spec.md`. Every task, every
automated test, and every function that implements requirement behavior names the REQ ID it
serves (in its title, a comment, or its file name).

Why: a reviewer, Ruth the mediator, or a parent disputing an outcome must be able to
point at any REQ and find the task that built it, the test that checks it, and the code that
runs it, without re-reading the whole codebase.

### III. Append-Only Case Record

The case record never deletes or overwrites an entry. Every entry carries its author and a
server-assigned timestamp the client cannot set or alter. Edits, withdrawals, and corrections
are new entries layered on top of history, never replacements of it (REQ-09, REQ-11).

Why: both parents and their mediator must be able to trust the record even when they disagree
about what happened; a record that can be quietly changed is not evidence of anything.

### IV. Mutual Acceptance Only

A change to the schedule becomes agreed only when the other parent accepts it in writing. No
request, timeout, system default, edit, or other automated action may mark a change as agreed.
Silence means pending, not yes (REQ-05).

Why: this is the one rule the whole prototype exists to enforce. A parent must never be told
later that they "agreed" to something they never responded to.

### V. Neutral, Equal Treatment

System-written text states who did what and when, and nothing more. It never uses judging
language (late, unreliable, failed, ignored, refused, missed, no-show), and it never shows a
count, score, or ranking of a parent's requests, declines, or response times. Both parents see
the same labels, rules, and layout in the same situation (REQ-12).

Why: the app is a record for a mediator and a court, not a behavior tracker; wording or
scoring that favors either parent undermines its neutrality and its evidentiary value.

### VI. Tested, Separated Domain Logic

Every acceptance scenario in `docs/initial-spec.md` becomes an automated test named with its
REQ ID (NFR-03). Domain logic (notice calculation, request status, overdue detection,
timestamp handling, the offline queue) lives in pure functions with no UI dependency, so it
can be tested directly and deterministically.

Why: this logic carries the project's hardest invariants (REQ-04, REQ-05, REQ-08, REQ-09,
REQ-10); mixing it into UI code makes it both harder to test and easier to break silently.

### VII. Prototype Simplicity

This is a requirements prototype, not a production system: mock data only, no real backend, no
real authentication (NFR-02). A parent can respond to whatever is waiting for them in no more
than two actions from the first screen (REQ-02, REQ-06). Every in-scope screen works at 375px
width (NFR-01).

Why: the goal is to validate the requirements and the interaction model, not to build
infrastructure the sprint doesn't need.

### VIII. Phased Review with Explicit Clarification

Work stops at the end of each Spec Kit phase (constitution, specify, clarify, checklist, plan,
tasks, analyze, implement) for human review before the next phase starts. Anything ambiguous in a requirement
or scenario is marked `[NEEDS CLARIFICATION]` in the artifact rather than resolved by guessing.

Why: several requirements say outright that a decision is still open (e.g. X-3, X-5 in
`docs/initial-spec.md` §6); deciding those silently would hide risk instead of surfacing it.

## Scope Boundary

- In scope: exactly REQ-01 through REQ-14 and NFR-01 through NFR-03 as written in
  `docs/initial-spec.md`.
- Out of scope, per `docs/initial-spec.md` §7: recording actual exchanges, expenses, exports
  and reviewer access, school/doctor notices, tone warnings, the child's view, phone calls,
  general chat not tied to a request, real sign-in, and push notifications.
- A need discovered during build goes back into the spec process (`/speckit-specify` or
  `/speckit-clarify`), not directly into code.

## Development Workflow

- Spec Kit phases run in order: constitution, specify, clarify, checklist, plan, tasks, analyze,
  implement. Each phase produces an artifact for human review before the next phase begins
  (Principle VIII).
- Acceptance tests are derived directly from the Gherkin scenarios in `docs/initial-spec.md`;
  a scenario without a passing, REQ-ID-named test is not done (Principle VI, NFR-03).
- A requirement marked `[NEEDS CLARIFICATION]` blocks only the parts of planning or tasks that
  depend on it, not the whole phase.

## Governance

This constitution supersedes other conventions for this project. A plan, task list, or piece
of code that conflicts with it must be revised, or this constitution amended first. Which one
is correct is a judgment call for the human reviewer at the next phase gate, not for the model.

Amendments: propose the change, record it in a Sync Impact Report at the top of this file, and
bump the version using semantic versioning: MAJOR for removing or redefining a principle,
MINOR for adding a principle or materially expanding one, PATCH for wording or typo fixes. Then update "Last Amended" below.

Compliance review: before a phase is marked complete, check its new or changed artifacts
against these principles, especially Traceability (II) and the append-only / neutral-wording
pair (III, V), since those are the hardest to retrofit once violated.

**Version**: 1.0.0 | **Ratified**: 2026-11-16 | **Last Amended**: 2026-11-16
