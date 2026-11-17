# Quickstart: Schedule Change & Trusted Record

## Prerequisites

- Node.js 20+
- No accounts, API keys, or backend services. Everything runs client-side.

## Run it locally

```bash
cd frontend
npm install
npm run dev
```

Open the printed local URL. Use the "Viewing as: Melissa | Jason" switch to see both sides of
the same case. The mock schedule starts Fri 20 Nov 2026 (A-6); the simulated server clock starts
Mon 16 Nov 2026 09:00.

## Try the core flow by hand

1. As Jason, open a Pending-free exchange and submit a request with a new time and a reason.
2. Switch to "Viewing as: Melissa." The request is waiting on Home.
3. Tap **Accept** then **Confirm**, two actions, per FR-006, and watch the Schedule show the
   agreed change next to the untouched original entry (FR-001, FR-007).
4. Open **Demo controls** and advance the server clock past the exchange's start with a
   different request still Pending. Its status becomes Lapsed (FR-008), never Agreed.
5. Switch Jason offline in Demo controls, submit a request as Jason, confirm Melissa cannot see
   it, then switch Jason back online and confirm it arrives with its real written time still
   shown as "device time, not verified" (FR-009, FR-010).

Every scenario in `spec.md`'s "Acceptance Examples (exact values)" section is reproducible this
way using only the Demo controls panel. None of it requires editing code or data files by hand.

## Run the tests

```bash
cd frontend
npm test
```

`npm test` runs `vitest run` once and exits (no watch mode). This runs:

- The domain-layer suite (`tests/domain/req-01.test.ts` … `req-14.test.ts`), one `describe`
  block per REQ ID, covering every scenario in spec.md's Acceptance Examples.
- The React Testing Library test for the two-action respond flow (`tests/app/respond-flow.test.tsx`, FR-006).

A failing test names the REQ ID it covers, so a failure maps directly back to a requirement in
`spec.md`.

## Reset the demo

In the running app, open **Demo controls** → **Reset demo data**. This clears the single
`localStorage` key the app uses and reseeds the A-6 mock schedule and starting clock. Use this
between demo runs, or if the state ever looks inconsistent after manual clock/offline
experimentation.

## Build and deploy to Vercel

```bash
cd frontend
npm run build       # outputs frontend/dist
```

Deploy `frontend/` as a static site:

- **Vercel CLI**: `vercel --cwd frontend` (first time) then `vercel --prod --cwd frontend`.
- **Git integration**: connect the repo in the Vercel dashboard, set the project's root
  directory to `frontend`, framework preset "Vite" (build command `npm run build`, output
  directory `dist`). No rewrites are needed, there is one page and no client-side routes.

There is no server component to configure, no environment variables, and no database.
