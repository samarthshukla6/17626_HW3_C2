# CoParent Record: spec-driven development sprint

17-626 Requirements for Information Systems, Assignment 3. Team: Samarth Shukla, Kevin Huang.

This repo holds our sprint for a co-parenting schedule and communication app for ABC Design Services. We used GitHub Spec Kit and an AI coding agent to go from stakeholder interviews to two working prototypes. The stakeholders are Melissa, who has primary custody, Jason, the co-parent and a long-haul truck driver, and Ruth, their family mediator.

The sprint feature: a parent asks to change the custody schedule, and both parents can trust the record of what happened. A request is never blocked for short notice but the notice is recorded, a change only counts once both parents agree in writing, and every action is kept in an append-only record with honest, server-verified times.

## Deliverables

| # | Deliverable | Link |
|---|---|---|
| 1 | GitHub Version 1: initial goal model, specification, Spec Kit artifacts and prototype source | [v1 branch](https://github.com/samarthshukla6/17626_HW3_C2/tree/v1) (tag [`v1.0`](https://github.com/samarthshukla6/17626_HW3_C2/releases/tag/v1.0)) |
| 2 | GitHub Version 2: revised goal model, specification, Spec Kit artifacts and prototype source | [v2 branch](https://github.com/samarthshukla6/17626_HW3_C2/tree/v2) (tag [`v2.0`](https://github.com/samarthshukla6/17626_HW3_C2/releases/tag/v2.0)) |
| 3 | Prototype V1 | https://17626-hw-3-c2.vercel.app/ |
| 4 | Prototype V2 | https://17626-hw-3-c2-v2-two.vercel.app/ |
| 5 | Requirements analysis and learning log | [docs/learning-log.md](docs/learning-log.md) |

Supporting documents:

- [docs/goal-model.md](docs/goal-model.md): merged goal model, sprint scope, overlaps, dependencies, conflicts, assumptions, and the V2 revisions (section 8)
- [docs/traceability.md](docs/traceability.md): requirements traceability matrix for V1 and V2, and every evaluation finding (F-1 to F-14)
- [docs/initial-spec.md](docs/initial-spec.md): our hand-written V1 requirements, REQ-01 to REQ-14
- [specs/001-schedule-change-record/spec.md](specs/001-schedule-change-record/spec.md): the Spec Kit specification, with its revision history for V2
- [docs/evidence.md](docs/evidence.md): every stakeholder quote we cite, with its transcript line

## Using the prototypes

Both prototypes run in the browser with mock data and no login. Use "Viewing as" at the top to act as Melissa or Jason. The "Demo controls" button at the bottom is a testing aid, not part of the product: it moves the server clock, skews Jason's phone clock, takes either parent offline, fails the next delivery, or resets the data. A good way to compare the versions is the truck-stop case: set the server time to Wed 18 Nov 16:00, take Jason offline, send a request for Fri 20 Nov as Jason, advance the clock 4 hours and bring him back online.

## What changed from V1 to V2

We changed the goal model and the spec first, then the plan, tasks and code. Details are in `docs/goal-model.md` section 8 and `docs/traceability.md`.

- Notice (F-6, conflict X-3): V1 counted notice only from the server time, so Jason's truck-stop request written 50 hours ahead was labelled 46 hours. V2 keeps the server figure as the official one and shows the written figure next to it as unverified context. Question Q-3 stays open for the stakeholders.
- Read receipts (F-3): V1 marked a request as read as soon as its card appeared. V2 records a read only when the recipient opens the details.
- Delivery states (F-4, F-5): V2 separates "waiting to be delivered" from "not delivered" and lets the sender retry a failure while keeping the failure in the record.
- Unsent requests (F-1, F-2): an item still on the sender's phone shows "Not sent yet" and its written time, with no status.
- Usability (F-7 to F-10): the current parent is highlighted, a submitted request is confirmed, times sit on separate lines, and declining with an alternative works.
- Fixes found while verifying V2 (F-11 to F-14): requests sent to an offline parent are delivered when they reconnect, delivered and read times are both shown, the confirmation only appears for the parent who submitted, and History uses readable labels.

## Run locally

```sh
cd frontend
npm install
npm test        # one test file per requirement, plus the V2 fixes
npm run build
npm run dev
```

## Repository structure

```
├── frontend/              # Prototype source and tests (Vite + React + TypeScript)
├── specs/001-schedule-change-record/
│   ├── spec.md            # Spec Kit feature spec (FR-001 to FR-014) and revision history
│   ├── plan.md, research.md, data-model.md, contracts/, quickstart.md
│   ├── tasks.md           # Tasks T001 to T086, each tagged with its REQ or finding
│   └── checklists/        # Requirements-quality checklists
├── .specify/              # Spec Kit config and project constitution
├── docs/
│   ├── goal-model.md      # Merged goal model, sprint decisions and V2 revisions
│   ├── initial-spec.md    # Our hand-written requirements REQ-01 to 14
│   ├── traceability.md    # Requirements traceability matrix and findings
│   ├── learning-log.md    # Requirements analysis and reflection
│   ├── evidence.md        # Stakeholder quotes cited, with transcript lines
│   └── sources/           # Both teammates' interview transcripts and A2 goal models
└── README.md
```

## Roles and responsibilities

| Member | Contributions |
|---|---|
| Samarth Shukla | Steps 1 to 3: merged both A2 goal models, chose the sprint scope, analysed overlaps, dependencies and conflicts, wrote the initial spec, ran Spec Kit from constitution to implementation, reviewed every generated artifact, tested Prototype V1 in a browser and sent back two rounds of fixes, and deployed V1. In the final step, verified V2 in a browser, fixed the four defects it found (F-11 to F-14), and deployed V2. |
| Kevin Huang | Steps 4 and 5: evaluated Prototype V1 against twelve scenarios, built the traceability matrix, classified findings F-1 to F-10, revised the goal model and the spec, and ran Spec Kit to plan, task and implement Prototype V2. |
| Both | Learning log, README and the final check of both deployments. |
