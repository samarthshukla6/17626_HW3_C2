# CoParent Record: spec-driven development sprint

17-626 Requirements for Information Systems · Team: Samarth Shukla, Kevin Huang

This repo holds our sprint for a co-parenting schedule and communication app. We used GitHub Spec Kit and an AI coding agent to go from stakeholder interviews to a working prototype. The stakeholders are Melissa, who has primary custody, Jason, the co-parent and a long-haul truck driver, and Ruth, their family mediator.

## Deliverables

| # | Deliverable | Link |
|---|---|---|
| 1 | GitHub Version 1: initial goal model, specification, Spec Kit artifacts and prototype source | [v1 branch](https://github.com/samarthshukla6/17626_HW3_C2/tree/v1) (tag `v1.0`) |
| 2 | GitHub Version 2: revised goal model, specification, Spec Kit artifacts and prototype source | [v2 branch](https://github.com/samarthshukla6/17626_HW3_C2/tree/v2) (`v2.0` tag intentionally pending release verification) |
| 3 | Prototype V1 | https://17626-hw-3-c2.vercel.app/ |
| 4 | Prototype V2 | Pending separate deployment; no URL has been verified yet |
| 5 | Requirements analysis and learning log | added in Step 6 |

Prototype V1 runs in the browser with mock data. Use the "Viewing as" switch to act as Melissa or Jason, and the "Demo controls" button at the bottom to move the clock, take a parent offline or fail a delivery.

## Progress

- Step 1: merged goal model and sprint scope, in [docs/goal-model.md](docs/goal-model.md) sections 1 to 4
- Step 2: overlaps, dependencies, conflicts and assumptions, in [docs/goal-model.md](docs/goal-model.md) sections 5 and 6
- Step 3: our hand-written initial spec in [docs/initial-spec.md](docs/initial-spec.md), the Spec Kit artifacts in `.specify/` and [specs/001-schedule-change-record/](specs/001-schedule-change-record/), and the prototype in [frontend/](frontend/)
- Step 4: V1 evaluation, findings F-1 through F-10 and REQ-01 through REQ-14 traceability in [docs/traceability.md](docs/traceability.md)
- Step 5: revised goals and specification, updated plan/tasks, V2 implementation and automated evidence on the `v2` branch. Separate deployment and V2 browser verification remain pending.

## Prototype V2 changes

- Offline requests show the device-written time and `Not sent yet`, without implying a server-held Pending status (F-1/F-2).
- Read time is recorded only when the recipient explicitly opens request details (F-3).
- Waiting for an offline recipient, failed delivery, successful delivery and read are distinct states (F-4), and the sender can retry a failed delivery without erasing the failure record (F-5).
- Notice uses server receipt as the official clock while showing a different device-written figure as unverified context (F-6/X-3).
- The selected parent, submission outcome and navigation are clearer, event timestamps have more readable spacing, and decline-with-alternative preserves a usable datetime value (F-7 through F-10).

Run V2 locally:

```sh
cd frontend
npm install
npm test -- --run
npm run build
npm run dev
```

## Separate V2 deployment

The current checkout has no verified V2 hosting project or deployment credentials, so no deployment is claimed. To protect the existing V1 URL, create a **new Vercel project** rather than reconnecting or redeploying the V1 project. Use these settings:

- Repository: `samarthshukla6/17626_HW3_C2`
- Production branch: `v2`
- Root directory: `frontend`
- Framework preset: Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: none required by this prototype

After review, publish the branch (not performed here) and deploy the new project:

```sh
git remote set-url origin git@github.com:samarthshukla6/17626_HW3_C2.git
git push -u origin v2
cd frontend
npx vercel link
npx vercel --prod
```

When prompted by `vercel link`, select the new V2 project. Record the returned URL only after opening it and completing the V2 browser checklist in [docs/traceability.md](docs/traceability.md). Create `v2.0` only after that release verification.


## Repository structure

```
├── frontend/              # Prototype source and tests (Vite + React + TypeScript)
├── specs/001-schedule-change-record/
│   ├── spec.md            # Spec Kit feature spec (FR-001 to FR-014)
│   ├── plan.md, research.md, data-model.md, contracts/, quickstart.md
│   ├── tasks.md           # Tasks T001 to T082, each tagged with its REQ or V2 finding
│   └── checklists/        # Requirements-quality checklists
├── .specify/              # Spec Kit config and project constitution
├── docs/
│   ├── goal-model.md      # Merged goal model and sprint decisions
│   ├── initial-spec.md    # Our hand-written requirements REQ-01 to 14
│   ├── evidence.md        # Stakeholder quotes cited, with transcript lines
│   ├── traceability.md    # V1 evaluation and V1/V2 requirement evidence
│   └── sources/           # Both teammates' interview transcripts and A2 goal models
└── README.md
```

## Roles and responsibilities

| Member | Contributions |
|---|---|
| Samarth Shukla | Steps 1 to 3: merged both A2 goal models, chose the sprint scope, analysed overlaps, dependencies and conflicts, wrote the initial spec, ran Spec Kit from constitution to implementation, reviewed every generated artifact, tested the running prototype in a browser and sent back two rounds of fixes, deployed Prototype V1 |
| Kevin Huang | Steps 4 and 5: evaluates Prototype V1 against the acceptance scenarios, builds the traceability matrix, revises the goal model and spec, and prepares Prototype V2 for separate deployment and verification |
| Both | Learning log, README and the final check of both deployments |

