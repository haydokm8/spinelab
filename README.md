# Arrow Spine Calculator & Build Tool — Master Overview

> **Working codename:** `arrowcalc` (name/domain decision pending — see Decisions Register)
> **Kickoff:** 2026-11-18 · **Origin:** 3Rivers dynamic spine calculator delisted from search engines
> **Research:** /mnt/Obsidian/Projects/Arrow Calculator — 3Rivers Replacement.md

## One-liner
A math-grounded, fully-transparent arrow spine + build calculator for traditional and modern archery — the tool 3Rivers took off search, rebuilt from first principles, with the honesty layer nobody else has.

## Why this wins
- **The gap is real:** 3Rivers' calculator (a web port of Stu Miller's Dynamic Spine Calculator) still functions but is de-listed. Search results are thin SEO farms (arrow-calculator.com, archerycalculators.com, etc.).
- **The pain is proven:** the same bow gets spine answers from 372 to 600 across five tools (published by ArcheryEra). Nobody shows *why* tools disagree or *how sure* the answer is.
- **The niche is unowned:** traditional archery depth (footed/tapered/wood shafts, center cut, strike plate) is exactly what the compound-skewed SEO farms ignore.
- **We have the math:** /home/sage/projects/bowdesign (round_wheel.py 7/7, twin_cam.py) is bow-side design math — this adds the arrow side. Long-term: bow + cam + arrow as one design chain.

## Product Principles (non-negotiable)
1. **Show the working.** Every coefficient, every intermediate value, every source cited. No black boxes.
2. **Honest uncertainty.** Real inputs have tolerances → recommendation bands, never false precision.
3. **Grounded in physics.** Beam deflection and published standards first; empirical corrections are registered, cited, and adjustable — never hidden magic numbers.
4. **Trad depth kept.** Wood, tapered, footed shafts, center cut, strike plate, string strands — first-class, not afterthoughts.
5. **International from day one.** Metric + US units, no locale assumptions (Hayden's standing rule).
6. **No accounts, no backend for calculation.** 100% client-side computation. Privacy by construction, trivial hosting costs.
7. **No copied IP.** Own implementation from physics + published standards. Manufacturer chart data = factual, cited. 3Rivers' DB/code and Stu Miller's spreadsheet = validation oracles only, never redistributed.

## Monetisation (summary — full analysis in docs/product-brief.md)
- **Affiliate links** on build/tool results: 3Rivers runs an in-house affiliate program (5%, monthly, free to join). Lancaster Archery program to verify. Amazon Associates as fallback.
- **Display ads** only on content pages (never inside the tool UI) once traffic warrants — Mediavine/Journey thresholds are 10–50k sessions/mo.
- **Honesty clause:** organic traffic compounds over 6–12 months. The calculator is the link magnet; content + affiliates convert it. No revenue promises before month 6.

## Responsibility Model
| Symbol | Meaning |
|--------|---------|
| 🟢 **H** | Hayden alone — naming, domain purchase, accounts, real-bow validation |
| 🔵 **H+S** | Together — design decisions, tuning validation, beta review |
| 🟣 **S** | Sage directly — research, planning, docs, orchestration |
| 🟠 **S→K** | Sage specs, kanban executes — architecture + task specs |
| 🔴 **W→agy** | Kanban worker → agy — code generation |

## Phase Index
| Phase | Name | Status |
|-------|------|--------|
| 1 | Spine Core — physics core + transparent calculator UI | 📋 planned (docs ready for review) |
| 2 | Build Lab — component DB, build calculator, FOC, shareable builds | 📋 planned |
| 3 | Differentiation — cross-check mode, uncertainty bands, tuning loop | 📋 planned |
| 4 | Traffic & Income — SEO content, affiliates, PWA, analytics | 📋 planned |

## Layout
```
arrowcalc/
├── README.md                     ← this file
├── docs/
│   ├── product-brief.md          ← market, competition, monetisation, decisions register
│   └── architecture.md           ← math model spec, data provenance, tech stack, anti-goals
├── phase-1-spine-core/
│   ├── README.md                 ← deliverables, DoD, dependency graph, estimates
│   ├── runsheets/                ← 01–05, one per task
│   └── kanban/task-templates.md  ← board config + card templates + dispatch waves
├── phase-2-build-lab/README.md   ← combined runsheet (lighter)
├── phase-3-differentiation/README.md
└── phase-4-traffic-income/README.md
```

## Getting Started (when implementation is greenlit)
1. Decisions Register resolved (name, domain, repo visibility) — 🟢 H
2. Pre-phase-1 checklist complete (see phase-1 README)
3. Stale-doc sweep + profile skill pre-flight (see kanban-orchestrator / app-build-planning)
4. Create kanban board `arrow-calc`, seed Wave 1 from kanban/task-templates.md — 🟣 S
