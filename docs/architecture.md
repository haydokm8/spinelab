# Architecture & Math Model Spec

> The foundational design. Per Hayden's rule (2026-10-12): *"Building a UI is easy — this shit isn't."* Depth here is in-scope, not a digression.

## 1. Tech stack
- **Monorepo:** pnpm workspaces — `packages/core` (pure TS, zero DOM), `apps/web` (Astro static site)
- **Tests:** vitest in `packages/core` — unit + property tests + regression fixtures
- **Computation:** 100% client-side. No backend, no accounts, no telemetry required for calculation.
- **Hosting:** Firebase Hosting (proposed — existing CLI auth + stack consistency) behind a .com domain
- **PWA:** offline mode (Phase 4)

### Repo layout
```
spinelab/
├── packages/core/
│   ├── src/
│   │   ├── units/          # unit system, AMO/ASTM spine conventions
│   │   ├── staticSpine.ts  # deflection model
│   │   ├── dynamicSpine.ts # bow-need vs arrow-supply model
│   │   ├── build.ts        # weight, GPP, FOC, balance point
│   │   ├── ballistics.ts   # speed, KE, momentum, trajectory
│   │   ├── uncertainty.ts  # Monte Carlo tolerance propagation
│   │   ├── crosscheck.ts   # manufacturer chart models
│   │   └── coefficients.ts # THE coefficient registry (single source of truth)
│   └── test/
│       ├── fixtures/oracle/     # Stu Miller / 3Rivers output fixtures
│       └── fixtures/charts/     # published manufacturer chart values
├── apps/web/               # Astro site: calculator UI, working panel, guides
└── docs/                   # this folder
```

## 2. Spine conventions (the foundation — get this wrong and everything is wrong)
Two measurement rigs are in circulation and **conflating them is the #1 real-world error**:
- **AMO (wood/pound convention):** 2 lb weight, 26" support span. Spine expressed in POUNDS (e.g. 50-55#) — stiffer = higher number.
- **ASTM/deflection convention (carbon/aluminum):** 1.94 lb (880 g) weight, 28" support span. Spine expressed in thousandths of deflection (500 = 0.500") — stiffer = LOWER number.

Implementation requirements:
1. All model math works in **physical deflection (m) at a named rig**; conventions are presentation-layer conversions only.
2. Beam model: `δ = F·L³ / (48·E·I)` — the same equation both rigs sample.
3. Stu Miller's instructions state "convert ASTM spine to AMO spine by dividing by 0.825" — this factor applies to the **pound-rating** convention. Lock the correct conversion direction with fixtures before first release (known confusion trap; the UI must show the conversion when a user enters either convention).
4. Property test: converting A→B→A round-trips; stiffness ordering inverts correctly between conventions.

## 3. Static spine model
`staticSpine(shaft: {E, I or GPI+OD+ID, length})` → deflection at named rig.
- `I` for a tube: `π(do⁴ − di⁴)/64`. For solid wood: `π·d⁴/64` (with documented caveat that real wood shafts taper).
- `E` from material (aluminum ~69 GPa; carbon: derive from published spine ratings — i.e. calibrate E_eff per shaft family against manufacturer charts; document as `E_eff` not a material constant).

## 4. Dynamic spine model (the core product)
Structure mirrors the proven 3Rivers/Stu Miller shape but is **our own implementation**:

```
bowNeed    = base(drawWeightAtYourDL, bowType) + corrections(...)
arrowSupply = f(staticSpine, length, frontMass, rearMass, footing, taper)
match when |bowNeed − arrowSupply| ≤ 2   (the proven ±2# UX)
```

**bowNeed corrections (each a named, cited, adjustable coefficient in `coefficients.ts`):**
| Factor | Effect | Source class |
|--------|--------|--------------|
| Draw length ≠ factory length | ±~2.5–3# per inch | published rule |
| Center cut (past-center) | shifts need | 3Rivers input; cite |
| Strike plate thickness | shifts need | 3Rivers input; cite |
| String material (B50 vs Fast Flight) + strand count | faster string → higher demand | published rule; cite |
| Bow type (self / R-D longbow / deflex-reflex / recurve / ILF) | base offsets (+5 shelf longbow, +10 centershot recurve vs self — VERIFY against oracle) | community rules; cite |
| Brace height | fine-tune lever (weak arrow → lower BH) | 3Rivers UX convention |

**arrowSupply terms:**
| Factor | Effect | Source class |
|--------|--------|--------------|
| Length | ~5# per inch (pound convention) | published rule |
| Point + insert weight | ~−5# per +25–40 gr | published rule |
| Nock weight, fletching weight (rear mass) | small shifts | Stu Miller model shape |
| Footed / tapered / front-loaded | −2# dynamic, +1.5% FOC | Stu Miller instructions |
| Personal calibration (−15…+15) | user fudge factor (see Phase 3 tuning loop) | 3Rivers/Stu Miller UX |

**Design rules for this model:**
- Every coefficient lives in `coefficients.ts` with: value, units, source citation, uncertainty range. The UI's "working" panel renders from this registry — no hard-coded numbers in UI.
- Coefficients are calibrated against oracle fixtures (§6) and must reproduce oracle answers within tolerance.
- **Anti-goal:** never present empirical corrections as physics. The working panel labels each term "empirical (source)" vs "physics".

## 5. Arrow build & ballistics (Phase 2+)
- **Total weight:** Σ (shaft GPI×length + point + insert + nock + fletching + glue + footing).
- **FOC (AMO method):** `FOC% = (A − L/2) / L × 100`, A = nock-groove→balance-point distance. Show the balance-point diagram.
- **GPP:** total grains / draw weight (grain-per-pound floor warnings).
- **Speed:** bow force-draw curve × efficiency where available; IBO-correction formula as fallback (labelled as estimate with stated accuracy).
- **KE = ½mv²; momentum = mv** (SI + ft-lbs + slug-ft/s, always both).
- **Trajectory:** numerical integration with drag (quadratic CD model for arrows — cite the diabolo drag literature); outputs drop/drift/flight time.

## 6. Validation strategy (the credibility engine)
1. **Oracle fixtures:** run a grid of inputs through Stu Miller's spreadsheet (LibreOffice headless) and/or the 3Rivers web form (currently functional at direct URL); store outputs as regression fixtures. The oracles are used for TEST VALUES ONLY — never redistributed, never scraped into the product DB.
2. **Chart fixtures:** published manufacturer chart values (Easton 301055-A hunting chart, Gold Tip selector values, etc.) stored as data with source + date — factual reference numbers, cited.
3. **Property tests:** unit round-trips, monotonicity (longer arrow = weaker supply; heavier point = weaker supply; higher draw weight = higher need), invariance checks.
4. **Golden UI tests:** the working panel must expose every coefficient contributing to a result (test: strip any coefficient → panel output changes).

## 7. Uncertainty (Phase 3)
- Input distributions: bow weight ±3% (scale reality), draw ±0.5", spine rating ±2%, point weight ±2 gr.
- Monte Carlo (10k draws, seeded) → recommendation band + "confidence" that match is within ±2#.
- Presentation: band, not a single number. **Anti-goal: never a bare confident number where the model is uncertain.**

## 8. Cross-check mode (Phase 3)
- Manufacturer chart models encoded as data-driven lookup tables (their published factual charts, cited) — Easton, Gold Tip, Black Eagle, 3Rivers chart style.
- Output: side-by-side with the disagreement band highlighted. The tool never claims one true answer; it shows the landscape and explains *why* they differ (conventions, insert inclusion, cam assumptions).

## 9. Anti-goals (explicit)
- ❌ Copying 3Rivers' code/shaft DB or Stu Miller's spreadsheet (oracles only)
- ❌ Hidden magic numbers — everything cited and exposed
- ❌ False precision — single confident numbers where the model is uncertain
- ❌ Backend/accounts for calculation
- ❌ US-only assumptions (units, retailers, seasons)
- ❌ Ads inside the tool UI
- ❌ Redesigning the model silently — coefficient changes go through fixtures + changelog
