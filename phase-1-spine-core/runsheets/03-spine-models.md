# Runsheet 03 — Spine Models + Coefficient Registry

> Phase 1, T3, Owner 🟠 S→K (coder) + 🔵 H+S review, ~8h, depends on T2

## Objective
Implement static spine (beam model) and the dynamic spine model (bow-need vs arrow-supply) in `packages/core`, with `coefficients.ts` as the single cited source of truth — and validate against oracle fixtures.

## Steps
1. `staticSpine.ts`: `δ = F·L³/(48·E·I)`; tube `I = π(do⁴−di⁴)/64`; solid shaft `I = π·d⁴/64`; `E_eff` per shaft family calibrated against manufacturer chart values (documented as effective modulus, not material constant)
2. `coefficients.ts`: every empirical coefficient from architecture.md §4 as {value, units, source citation, uncertainty range, physics|empirical label}
3. `dynamicSpine.ts`: `bowNeed = base(drawWeightAtYourDL, bowType) + corrections(...)`; `arrowSupply = f(staticSpine, length, frontMass, rearMass, footing, taper)`; match verdict at ±2#
4. Oracle fixtures: generate a 30+ point input grid (bow type × draw weight × arrow length × point weight); capture expected outputs from Stu Miller's spreadsheet (LibreOffice headless) and/or the 3Rivers web form; store with provenance headers
5. Calibrate coefficients until oracle reproduction is within documented tolerance (state tolerance in fixture headers; target ≤2# on match verdicts)
6. Chart fixtures: Easton 301055-A values etc. as cited data; regression tests keep model in the same *neighborhood* (charts genuinely disagree — assert neighborhood, not equality)

## Acceptance Criteria
- [ ] Oracle fixture suite passes within stated tolerance
- [ ] Monotonicity property tests pass (longer = weaker supply; heavier point = weaker supply; higher draw weight = higher need)
- [ ] Every coefficient has citation + uncertainty; none hard-coded outside the registry
- [ ] Chart-neighborhood tests pass (model lands inside the published disagreement band, not pinned to one chart)
- [ ] 🔵 H+S review gate passed before T4 dispatch (coefficient-by-coefficient review)

## Notes
- CONSTRAINTS: **DO NOT deploy.**
- Coefficients marked VERIFY in architecture.md (bow-type offsets: +5 shelf longbow, +10 centershot recurve vs self) must be checked against the oracle before use — do not trust community rules blindly.
- If oracle and physics disagree, do NOT silently fudge: record the divergence in a `docs/model-notes.md` for the H+S review. Honest divergence documentation is a product feature.
