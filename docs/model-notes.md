# Model notes — Phase 1 T3 (static/dynamic spine models)

Working log of every place the physics, the oracle, and the community rules
disagree — or where our implementation extends/preserves oracle behaviour.
**No silent fudging:** every divergence below is visible in
`packages/core/src/coefficients.ts` (the registry) and pinned by tests.

Oracle files (Stu Miller `.xls` spreadsheets + instruction PDF) are **local
test oracles only — never redistributed**. Only transcribed, re-verified
values and our own formulas live in the repo.

## 1. Oracle provenance and honesty of the fixtures

No LibreOffice is available on this host, so the Rev 6-12-09 spreadsheet was
not *executed* cell-by-cell. Instead its published formulas were transcribed
into a local generator (scratch tooling, not in the repo) and the generator
was **validated against both spreadsheets' cached result states**:

| State | Arrow dynamic (ours) | Arrow dynamic (sheet) | Bow required (ours) | Bow required (sheet) |
|---|---|---|---|---|
| Rev 6-12-09: 1916, 29", 140 gr point, 11 gr nock, feathers, FastFlight, 50#@28, draw 28, shelf +1/8 | 50.12513 | 50.12512774 | 50.5 | 50.5 exact |
| Rev 1: 1916, 29", 125 gr point, 0 nock, feathers, B50, 50#@28, draw 29, shelf +1/8 | 50.766 | 50.8 (displayed, 1 dp) | 51.0 | 51.0 exact |

The 40-point fixture grid (`test/fixtures/oracle/stu-miller-dynamic-spine.ts`)
is therefore labelled **method: computed** (formula-derived, provenance
header + `FIXTURE_PROVENANCE`), not "typed from spreadsheet runs". Tolerance
±0.1#; see §3 for why it isn't tighter.

## 2. Sensitivity interpretation correction (caught at integration)

The spreadsheet's length/weight terms are `× (ΔL/L_ref) × 2.8` and
`× (ΔW/W_ref) × 0.4` — 2.8 and 0.4 multiply the **relative** change, i.e.
2.8/29 ≈ **9.66 %/inch** and 0.4/125 = **0.32 %/grain**. (An earlier reading
of "2.8 %/inch" was wrong.) The per-inch reading is *consistent with* the
community rule of ~5 #/inch near 50 # (5/52 ≈ 9.6 %), and the per-grain
reading with the −5 # per +25–40 gr point-weight rule (0.32 % × 30 gr ≈ 9.6 %
≈ 5 # at 52 #) — the oracle and the community rules agree better under the
correct interpretation, which is why it is locked. Registry keys:
`lengthFactorSensitivity` (2.8), `weightFactorSensitivity` (0.4).

## 3. 0.825 (spreadsheet) vs 0.825419 (published rig ratio)

The spreadsheet multiplies deflections by exactly `0.825`; T2 locked the
published 6-dp rig ratio 0.825419 = (2·26³)/(1.94·28³). Across the 40-point
grid the induced difference on arrow dynamic pounds is **≤ 0.0559 #**
(measured max). We keep 0.825419 (physics) and set the fixture tolerance to
±0.1 # rather than silently adopting the spreadsheet's 4-dp constant. Bow-need
values are unaffected (the shelf/string tables carry no 0.825).

## 4. Bow-type offsets (+5 shelf longbow, +10 centershot recurve) — VERIFY outcome

- **Stu Miller Rev 6-12-09 contains NO bow-type term.** Its bow-required
  formula uses only rated weight, draw lengths, string material and a
  continuous shelf-cut table. The architecture.md §4 offsets are community
  chart rules.
- **Direction verified** against 3Rivers' published charts
  (ArrowCharts.pdf / AluminiumSpineChart.pdf, retrieved 2026-11-18): they
  split bow types into "RECURVE/CENTER SHOT LONGBOW" vs "LONGBOW / SELF BOW"
  columns, with the longbow/self column recommending **weaker** arrows at
  equal bow weight; chart bow-weight bands are 5 # wide, so one band ≈ +5 #.
- **Magnitude bracketed, not verified**: the oracle's shelf table gives +5 #
  at center cut vs −2 # at 1/8 less than center → a 7 # recurve-vs-longbow
  delta, which lies between the community +5 and +10 offsets. Pinned as a
  chart-neighborhood assertion (7 ∈ [5, 10]), not equality.
- **Decision:** the offsets live in the registry as
  `unverified-community-rule` with ±5 # uncertainty and are exposed ONLY via
  `bowNeedQuick()` (coarse path). `bowNeed()` uses the measured shelf cut.
  The two paths must not be combined (double counting) — enforced by docs,
  flagged here for the H+S review.

## 5. E_eff calibration (static beam model)

`δ = F·L³/(48·E·I)` with tube `I = π(do⁴−di⁴)/64` reproduces the published
aluminum static deflections with a single effective modulus:

- `eEffectiveAluminumGPa` = **71.88 GPa** (median over 28 Easton XX75/X7
  published sizes; range 66.4–77.2 GPa). Worst static-spine residual **7.6 %**
  (size 1516); most sizes within ±4 %. Nominal alloy E ≈ 69 GPa — the +4 %
  offset absorbs published-rating rounding and tube tolerances. Static
  predictions are asserted within ±8 % deflection (chart-neighbourhood, not
  equality).
- `eEffectiveCarbonGPa` = **62.8 GPa** is a **single-point** calibration at
  Carbon 500 with **assumed** dims (OD 0.295", ID 0.245"). Carbon ID varies
  widely between manufacturers, so this value is assumption-sensitive (order
  ±20 %) and only powers indicative static predictions. The dynamic model
  consumes a *measured* static spine and never uses E_eff. A real carbon
  shaft-dimension table is deferred to the crosscheck phase.

Known physics-vs-oracle residuals: the beam model cannot reproduce all 28
aluminum sizes with one E (spread 66–77 GPa implies real per-size variation
beyond published rounding). This is documented, not fudged: we assert the
±8 % neighbourhood, per architecture.md §6.3.

## 6. Shelf-cut interpolation (our extension)

The oracle offers 11 discrete dropdown steps (−3/16" → +18 # … 5/8" → −22 #).
`shelfCorrectionPounds()` interpolates **linearly between steps** so the UI
can accept a measured strike-plate position; it is exact at every tabulated
step (fixture-locked). The interpolation is ours, not oracle behaviour.

## 7. Wood-shaft offset

The wood-shaft length offset (−0.9", i.e. wood treated as ~0.9" longer →
dynamically weaker) appears in Rev 6-12-09 but is **absent in Rev 1** —
magnitude uncorroborated by any second source. Registered as
`consistent-with-oracle` with that caveat in `woodLengthOffsetIn.notes`.

## 8. Published-chart disagreement (why neighborhood, not equality)

The two *current* 3Rivers PDFs give different letter→size legends for their
aluminum chart (ArrowCharts.pdf: 1716=A…; AluminiumSpineChart.pdf: 1816=A…,
every letter shifted one size). Both transcriptions are stored side by side
in `test/fixtures/charts/three-rivers-published.ts`. Similarly, the
"Fast Flight" rule is ×1.05 (Stu Miller, multiplicative) vs "+5 #" (3Rivers,
flat) — both inside one 5 # chart band at typical draw weights; the test
asserts the Stu Miller delta stays within the 3Rivers band instead of
pinning either.

## 9. Out of scope here

The spreadsheet's speed (I4), FOC (H4), balance-point (K12) and total-weight
(G4) formulas were transcribed for oracle validation but are **not**
implemented in T3 — they belong to Phase 2 (`build.ts`, `ballistics.ts`).
The footing FOC (+1.5 %) coefficient is registered now for Phase 2 use.
