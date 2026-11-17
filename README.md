# CoParent Record: spec-driven development sprint

17-626 Requirements for Information Systems · Team: Samarth Shukla, Kevin Huang

This repo holds our sprint for a co-parenting schedule and communication app. We used GitHub Spec Kit and an AI coding agent to go from stakeholder interviews to a working prototype. The stakeholders are Melissa, who has primary custody, Jason, the co-parent and a long-haul truck driver, and Ruth, their family mediator.

## Deliverables

| # | Deliverable | Link |
|---|---|---|
| 1 | GitHub Version 1: initial goal model, specification, Spec Kit artifacts and prototype source | [v1 branch](https://github.com/samarthshukla6/17626_HW3_C2/tree/v1) (tag `v1.0`) |
| 2 | GitHub Version 2: revised goal model, specification, Spec Kit artifacts and prototype source | added after Step 5 |
| 3 | Prototype V1 | https://17626-hw-3-c2.vercel.app/ |
| 4 | Prototype V2 | added after Step 5 |
| 5 | Requirements analysis and learning log | added in Step 6 |

Prototype V1 runs in the browser with mock data. Use the "Viewing as" switch to act as Melissa or Jason, and the "Demo controls" button at the bottom to move the clock, take a parent offline or fail a delivery.

## Progress

- Step 1: merged goal model and sprint scope, in [docs/goal-model.md](docs/goal-model.md) sections 1 to 4
- Step 2: overlaps, dependencies, conflicts and assumptions, in [docs/goal-model.md](docs/goal-model.md) sections 5 and 6
- Step 3: our hand-written initial spec in [docs/initial-spec.md](docs/initial-spec.md), the Spec Kit artifacts in `.specify/` and [specs/001-schedule-change-record/](specs/001-schedule-change-record/), and the prototype in [frontend/](frontend/)


## Repository structure

```
├── frontend/              # Prototype source and tests (Vite + React + TypeScript)
├── specs/001-schedule-change-record/
│   ├── spec.md            # Spec Kit feature spec (FR-001 to FR-014)
│   ├── plan.md, research.md, data-model.md, contracts/, quickstart.md
│   ├── tasks.md           # Tasks T001 to T067, each tagged with its REQ
│   └── checklists/        # Requirements-quality checklists
├── .specify/              # Spec Kit config and project constitution
├── docs/
│   ├── goal-model.md      # Merged goal model and sprint decisions
│   ├── initial-spec.md    # Our hand-written requirements REQ-01 to 14
│   ├── evidence.md        # Stakeholder quotes cited, with transcript lines
│   └── sources/           # Both teammates' interview transcripts and A2 goal models
└── README.md
```

## Roles and responsibilities

| Member | Contributions |
|---|---|
| Samarth Shukla | Steps 1 to 3: merged both A2 goal models, chose the sprint scope, analysed overlaps, dependencies and conflicts, wrote the initial spec, ran Spec Kit from constitution to implementation, reviewed every generated artifact, tested the running prototype in a browser and sent back two rounds of fixes, deployed Prototype V1 |
| Kevin Huang | Steps 4 and 5: evaluates Prototype V1 against the acceptance scenarios, builds the traceability matrix, revises the goal model and spec, builds and deploys Prototype V2 |
| Both | Learning log, README and the final check of both deployments |

