# Phase 1 — Spine Core

> Deliverables, definition of done, dependencies, responsibilities, estimates, pre-phase checklist.

## Deliverables
1. `packages/core` monorepo package: units/conventions, static spine (beam model), dynamic spine model (bow-need vs arrow-supply) with the full cited coefficient registry
2. Validation fixture suite: oracle regression fixtures (Stu Miller / 3Rivers outputs) + published chart fixtures + property tests
3. `apps/web` calculator: bow + arrow inputs, dynamic-spine match (±2# convention), **"show the working" panel** rendering every coefficient/intermediate/source, metric/US toggle, shareable result URL
4. Deployed static site on Firebase Hosting (staging + production), SEO fundamentals (metadata, sitemap, robots, canonical)
5. README + docs published with the site (transparency is the product)

## Definition of Done
**Functional**
- [ ] User enters a realistic recurve/longbow setup and gets bow-need vs arrow-supply with match verdict (within/outside ±2#)
- [ ] Working panel shows every contributing term: value, units, physics-vs-empirical label, source citation
- [ ] AMO wood (pound) and ASTM deflection spine inputs both accepted; conversion shown and fixture-verified
- [ ] Personal calibration (−15…+15) adjusts results as expected
- [ ] Metric and US units both first-class; toggle preserves the setup
- [ ] Result is shareable via URL

**Technical**
- [ ] `pnpm test` green in packages/core: unit + property + oracle-fixture tests all pass
- [ ] Oracle fixtures reproduce within documented tolerance (tolerance stated in fixture header)
- [ ] Coefficient registry is the single source of truth — UI renders from it (golden test: removing any coefficient changes the working panel)
- [ ] Astro build clean, Lighthouse performance ≥ 95, zero console errors
- [ ] No copied data: fixture provenance headers complete (source, date, method)

**Quality**
- [ ] 🔵 H+S: coefficient review pass — every citation checked, every empirical label honest
- [ ] 🔵 H+S: real-world sanity check — 2+ known-good bow/arrow setups from Hayden's own quiver produce sensible matches

## Dependency Graph
```
T1 Scaffold ──► T2 Units & Conventions ──► T3 Spine Models + Coefficients ──► T4 Calculator UI ──► T5 Deploy + SEO
                                                                          (T5 domain purchase 🟢H — starts NOW in parallel)
                                          QA gate (qa profile) depends on ALL of T1–T5
```

## Responsibility Map
| Task | Owner | Notes |
|------|-------|-------|
| T1 Monorepo scaffold | 🟠 S→K (coder) | agy implementation, spec from Sage |
| T2 Units & spine conventions | 🟠 S→K (coder) | property tests are the deliverable |
| T3 Dynamic spine model + coefficient registry | 🟠 S→K (coder) + 🔵 H+S | coefficient review is a hard gate before T4 |
| T4 Calculator UI + working panel | 🟠 S→K (frontend) | transparency panel is the product |
| T5 Firebase deploy + SEO | 🟣 S + 🟢 H | Sage configures; Hayden buys domain |
| QA gate | 🟠 S→K (qa) | 5-gate pipeline, report-only, creates fix cards |

## Estimated Effort
| Task | Hours | Parallelism |
|------|-------|-------------|
| T1 Scaffold | 2h | solo (first) |
| T2 Units & conventions | 3h | after T1 |
| T3 Spine models + coefficients | 8h | after T2 (the hard one) |
| T4 Calculator UI | 6h | after T3 |
| T5 Deploy + SEO | 2h | after T4 (domain prep parallel) |
| QA + fix loop | 4h | after T5 |
| **Total** | **~25h** | mostly sequential — small team reality |

## Pre-Phase Checklist (must be complete before Wave 1 dispatch)
- [ ] 🟢 H: product name decided (D1) — SpineLab (decided 2026-11-18 — repo `spinelab`)
- [ ] 🟢 H: domain purchased (D2) — **spinelab.tools** recommended (only clean TLD left after 2026-11-18 check; grab soon — .app/.dev were scooped in 2026)
- [x] 🟢 H: repo visibility decided (D3) — PUBLIC (decided 2026-11-18)
- [x] 🟢 H: hosting confirmed (D4) — Firebase Hosting (decided 2026-11-18)
- [ ] 🟣 S: Stu Miller spreadsheet + instructions archived locally as test-oracle source (heilakka.com/dynamic.htm)
- [ ] 🟣 S: profile skill pre-flight (coder/frontend/qa have needed skills; note: this is a TS/Astro project — no Flutter/Dart skills involved)
- [ ] 🟣 S: kanban board `spinelab` created, cards seeded from kanban/task-templates.md

## Notes / Pitfalls
- The **±2# match convention** and the **working panel** are proven UX from 3Rivers — replicate the *interaction shape*, never their code or data.
- The AMO/ASTM conversion direction is a known trap (architecture.md §2) — T2 must lock it with fixtures before T3 depends on it.
- Workers default to deploying if not told otherwise — only T5 deploys; T1–T4 card bodies carry the DO NOT deploy constraint.
- This is a TypeScript/Astro project. Do NOT route to Flutter/Dart skills.
