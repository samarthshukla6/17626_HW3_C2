# CoParent Record prototype (frontend)

Prototype V1 for the schedule-change sprint. It runs entirely in the browser with mock data, so there's no backend or login. The spec it implements is in `specs/001-schedule-change-record/spec.md`.

## Run and test

```bash
npm install
npm run dev     # local app
npm test        # one test file per requirement (tests/domain/req-01 to req-14)
npm run build   # static build in dist/, which is what Vercel serves
```

## Layout

- `src/domain/` holds the rules: the append-only event log, the simulated server and phone clocks, notice and status, delivery and read, and the offline queue. Nothing in here imports React.
- `src/copy/strings.ts` holds every piece of text the app shows, plus the banned-word list from FR-012.
- `src/app/` holds the screens. They only call functions from `src/domain/`.

## Demo controls

The "Demo controls" button at the bottom opens a testing panel. It isn't part of the product. Use it to move the server clock, skew Jason's phone clock, take either parent offline, make the server unreachable, fail the next delivery, or reset the demo data.
