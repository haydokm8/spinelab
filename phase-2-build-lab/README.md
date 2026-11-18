# Phase 2 — Build Lab

> Lighter combined runsheet (detail gradient: later phases are calibrated by phase-1 lessons). Refine before dispatch.

## 01 — Component database
**Assignee:** 🟠 S→K (coder) | **Hours:** 4h
Typed component data (points, inserts, nocks, fletching, glue allowances) as versioned data files in packages/core, each with provenance (manufacturer spec sheet + date). Factual specs only — no copied databases.
**Acceptance:** every component has citation; weight-sum property tests pass.

## 02 — Build calculator (weight, GPP, FOC, balance)
**Assignee:** 🟠 S→K (coder + frontend) | **Hours:** 5h
Build model per architecture.md §5: total grains breakdown, GPP with floor warnings, FOC (AMO method) with balance-point diagram, speed estimate (labelled), KE + momentum in SI + US always. Working panel pattern reused — every number traceable.
**Acceptance:** FOC matches hand-calc on 3 reference builds; all outputs show working.

## 03 — Build library + shareable builds
**Assignee:** 🟠 S→K (frontend) | **Hours:** 3h
Local build library (localStorage, export/import JSON), URL-encoded shareable builds, build-vs-build comparison view (Δ weight, Δ FOC, Δ spine).
**Acceptance:** share URL round-trips; export/import lossless.

## 04 — Speed & trajectory module
**Assignee:** 🟠 S→K (coder) | **Hours:** 4h
Trajectory via numerical integration + quadratic arrow drag (cite diabolo drag literature). Drop/drift/flight-time table. Clearly labelled estimates with stated accuracy.
**Acceptance:** trajectory fixtures plausible vs published ballistics tables; uncertainty stated.

**Phase 2 DoD (summary):** a user can spec a complete arrow build, see every number's working, save/share it, and compare builds. QA gate runs after all tasks.
**Dependencies:** 01 → 02 → 03; 04 after 02 (independent of 03).
