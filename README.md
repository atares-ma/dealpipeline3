# Deal Pipeline — atares M&A

A deal-pipeline workspace for an M&A advisory firm, implemented from the
Claude Design handoff (`Deal Pipeline.html`). React + Vite frontend backed by
Supabase.

## Views

- **Pipeline** — kanban board across five stages (Sourcing → NDA Signed → LOI →
  Due Diligence → Closing). Drag cards between stages, open a deal for the
  detail panel, advance a stage, or create a new deal. Search filters by
  company / sector.
- **Targets** — research table of sourced companies with strategic-fit scoring;
  promote a qualified target into the pipeline as a sourcing-stage deal.
- **Mandates** — client-engagement cards (buy-side / sell-side, progress, fees).
- **Reports** — pipeline KPIs, value-by-stage, deal-count funnel, and
  value-by-sector breakdowns, weighted by probability.

All board mutations (drag-to-stage, advance, create, promote) persist to
Supabase.

## Stack

- React 18 + Vite
- `@supabase/supabase-js` against the project's REST API

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

### Environment

Configured in `.env` (committed — the publishable key is safe to expose to the
browser by design):

```
VITE_SUPABASE_URL=https://frunxcupsqrxvcseogec.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

## Backend

The Supabase schema lives in the project's migrations:

- `stages`, `sectors`, `leads` — reference data
- `deals` — pipeline deals
- `targets` — target research
- `mandates` — client engagements

**Auth model:** this is an internal, single-tenant tool with no end-user
authentication. The browser talks to Supabase using the anon publishable key,
so RLS is enabled with permissive policies granting that key full read/write
access. Supabase's linter flags these `USING (true)` policies — that is
expected here; adding real per-user authorization would be the next step if the
app moves beyond internal use.

## Design notes

The prototype's floating **Tweaks panel** is a design-tool scaffold (it speaks
the design editor's host protocol) and is intentionally not shipped. Its
defaults — detailed cards, regular density, lime accent, column € totals
shown — are baked in as the production defaults.
