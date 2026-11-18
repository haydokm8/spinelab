# Kanban Task Templates — Phase 1

## Board Configuration
- **Board:** `arrow-calc`
- **Workspace:** `dir:/home/sage/projects/arrowcalc`
- **Profiles:** `coder` (T1–T3), `frontend` (T4), `qa` (QA gate). TypeScript/Astro project — no Flutter/Dart skills involved.
- **Skill targeting:** pass relevant skill names in card bodies (see subagent-skill-targeting); core math tasks: `clean-code`, `coder-testing`; UI: `frontend-testing`, `accessibility`-adjacent a11y rules inline.

## Task Graph
```
T1 (coder) → T2 (coder) → T3 (coder) → T4 (frontend) → T5 (sage-direct + hayden)
QA (qa) depends on T1–T5
```

## Card Templates

### T1: Monorepo scaffold (pnpm + Astro + vitest + CI)
Title: arrowcalc Phase 1 T1: monorepo scaffold
Assignee: coder
Priority: 1
Parents: —
Body:
  Scaffold pnpm workspace at /home/sage/projects/arrowcalc per runsheet 01-monorepo-scaffold.md.
  packages/core (TS strict + vitest) + apps/web (Astro TS strict) + eslint/prettier + GitHub CI.
  Fixture provenance README in packages/core/test/fixtures/.
  Acceptance: pnpm -r test green, lint clean, astro build works, CI green.
  CONSTRAINTS: DO NOT deploy anywhere. Structure only.

### T2: Units & spine conventions
Title: arrowcalc Phase 1 T2: units + AMO/ASTM convention module
Assignee: coder
Priority: 1
Parents: T1
Body:
  Implement packages/core/src/units/ per runsheet 02-units-conventions.md and docs/architecture.md §2.
  Rig-aware spine types (AMO 2lb@26in pounds vs ASTM 1.94lb@28in deflection), physical deflection internal.
  Lock the 0.825 conversion direction with fixtures (cite Stu Miller instructions PDF).
  Property tests: round-trips + stiffness-ordering inversion. Type system prevents bare spine numbers.
  CONSTRAINTS: DO NOT deploy.

### T3: Spine models + coefficient registry
Title: arrowcalc Phase 1 T3: static/dynamic spine model + cited coefficient registry
Assignee: coder
Priority: 1
Parents: T2
Body:
  Implement staticSpine.ts + dynamicSpine.ts + coefficients.ts per runsheet 03-spine-models.md
  and docs/architecture.md §3-4. Oracle fixtures (30+ point grid vs Stu Miller spreadsheet / 3Rivers form)
  with provenance headers; calibrate to documented tolerance. Chart-neighborhood regression tests.
  Every coefficient: {value, units, citation, uncertainty, physics|empirical}.
  Record divergences in docs/model-notes.md — NO silent fudging.
  CONSTRAINTS: DO NOT deploy.
  NOTE: ends with a hard 🔵 H+S coefficient-review gate before T4 dispatch.

### T4: Calculator UI + working panel
Title: arrowcalc Phase 1 T4: calculator UI + transparency panel
Assignee: frontend
Priority: 1
Parents: T3
Body:
  Build calculator page per runsheet 04-calculator-ui.md. Bow/arrow inputs, ±2# match verdict,
  brace-height hint, and the working panel rendered from the coefficient registry (golden test:
  removing any coefficient changes panel output). Unit toggle + rig badges + shareable URL.
  Mobile-first, a11y AA, Lighthouse ≥95. Client-side only, no accounts.
  CONSTRAINTS: DO NOT deploy.

### T5: Firebase deploy + SEO fundamentals
Title: arrowcalc Phase 1 T5: deploy + SEO
Assignee: frontend (implementation) — Sage supervises; domain purchase is Hayden's
Priority: 2
Parents: T4
Body:
  Deploy per runsheet 05-deploy-seo.md. Dedicated Firebase project, staging+prod, custom domain+SSL,
  sitemap/robots/canonical/meta/OG, docs pages linked from footer. PageSpeed mobile ≥90.
  VERIFY: read back production URL after deploy (external-state verification).
  NOTE: the ONLY phase-1 card that deploys.

### QA: Phase 1 quality gate
Title: arrowcalc Phase 1 QA: 5-gate quality pipeline
Assignee: qa
Priority: 1
Parents: T1,T2,T3,T4,T5
Body:
  Full 5-gate pipeline (static analysis, build smoke, runtime, functional, domain) on the integrated result.
  Domain checks: oracle fixtures pass; working panel completeness; rig badges correct; URL share round-trip;
  units round-trip; no console errors. DO NOT modify code — report only, create follow-up fix cards
  (assignee coder) for P1/P2 findings.

## Dispatch Waves
- **Wave 1:** T1 (solo)
- **Wave 2:** T2
- **Wave 3:** T3 → then PAUSE for 🔵 H+S coefficient review (hard gate)
- **Wave 4:** T4
- **Wave 5:** T5 (only after D2 domain + D4 hosting decisions) + QA

## Operational Notes
- Create cards via the Python subprocess pattern (app-build-planning skill) — bodies contain backticks/ampersands; never raw shell.
- If a batch script crashes mid-graph: seed created IDs and continue, never archive-and-recreate (duplicate-card trap).
- Worker-created cards go to scratch workspaces — create these cards orchestrator-side with explicit `--workspace dir:/home/sage/projects/arrowcalc`.
- Terminal env quirk after delegate_task: strip HERMES_DELEGATED_CHILD_CONTEXT=1 before `hermes kanban` CLI calls.
