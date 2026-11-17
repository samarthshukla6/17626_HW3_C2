# CoParent Record: spec-driven development sprint

17-626 Requirements for Information Systems · Team: Samarth Shukla, Kevin Huang

This repo holds our sprint for a co-parenting schedule and communication app. We used GitHub Spec Kit and an AI coding agent to go from stakeholder interviews to a working prototype. The stakeholders are Melissa, who has primary custody, Jason, the co-parent and a long-haul truck driver, and Ruth, their family mediator.

## Progress

- Step 1: merged goal model and sprint scope, in [docs/goal-model.md](docs/goal-model.md) sections 1 to 4
- Step 2: overlaps, dependencies, conflicts and assumptions, in [docs/goal-model.md](docs/goal-model.md) sections 5 and 6
- Step 3: our hand-written initial spec in [docs/initial-spec.md](docs/initial-spec.md), the Spec Kit artifacts in `.specify/` and [specs/001-schedule-change-record/](specs/001-schedule-change-record/), and the prototype in [frontend/](frontend/)

We'll add the deliverable links and the roles section as we finish each step.

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
