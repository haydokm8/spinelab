# Phase 3 — Differentiation (the moat)

> The features nobody has. Design depth is highest here — refine into detailed runsheets before dispatch (per detail gradient).

## 01 — Cross-check mode
**Assignee:** 🟠 S→K (coder) | **Hours:** 6h
Manufacturer chart models as data-driven lookup tables from their published charts (factual values, cited with source + date): Easton 301055-A hunting chart, Gold Tip selector values, Black Eagle style, 3Rivers chart style. One setup → side-by-side landscape with the disagreement band highlighted and an explanation of WHY they differ (conventions, insert inclusion, cam assumptions — architecture.md §8).
**Acceptance:** chart fixtures reproduce published values exactly (they're data lookups); disagreement explanation renders per source.

## 02 — Uncertainty bands (Monte Carlo)
**Assignee:** 🟠 S→K (coder) | **Hours:** 5h
Input distributions (bow wt ±3%, draw ±0.5", spine ±2%, point ±2 gr — architecture.md §7); seeded 10k-draw Monte Carlo → recommendation band + confidence. Presentation: band, never a bare confident number.
**Acceptance:** property test — narrowing input tolerances narrows the band; seeded runs deterministic.

## 03 — Tuning loop ("personal form factor" done properly)
**Assignee:** 🟠 S→K (coder + frontend) | **Hours:** 8h
The killer feature: bare-shaft / paper-tune results as inputs → the calculator calibrates to YOUR bow (personal calibration derived from evidence instead of a magic slider). Store tune history locally; show how each tuning result shifts the model. This closes the loop no competitor closes.
**Acceptance:** fed a synthetic tuning history, calibration converges to the generating offset; UI explains each adjustment.

**Phase 3 DoD (summary):** the tool shows the cross-brand landscape, quantifies its own uncertainty, and learns from the user's real tuning. **🔵 H+S design review before dispatch — this phase IS the product moat.**
**Dependencies:** 01 and 02 independent (parallel); 03 depends on 02.
