# Product Brief — Arrow Spine Calculator & Build Tool

> Companion to README.md (overview) and architecture.md (math/tech). Research evidence: /mnt/Obsidian/Projects/Arrow Calculator — 3Rivers Replacement.md

## Problem
Archers — especially traditional archers — need to match arrow stiffness ("spine") to their bow. The tools that help are:
- **De-listed:** 3Rivers' Dynamic Spine Calculator (the best trad tool, a port of Stu Miller's work) was pulled from search engines in 2026. It still works at its direct URL but is effectively invisible.
- **Mutually contradictory:** the same 35# recurve / 32" arrow gets answers from 372 (ArcheryEra) to 600 (Black Eagle) across five tools (source: ArcheryEra "Why Arrow Spine Charts Disagree"). Users are told "get 380" and "get 600" with zero explanation of why.
- **Black boxes:** none of the SEO calculators show their coefficients, sources, or uncertainty. "Spine 340" printed in confident typography over a model nobody can audit.
- **Compound-skewed:** footed/tapered/wood shafts, center cut, strike plate, string strand counts — the trad reality — are ignored by the SEO farms.

## Target audience
- **Primary:** traditional archers (longbow/recurve, wood and carbon trad shafts, arrow builders) — the 3Rivers/Stu Miller constituency, currently tool-orphaned.
- **Secondary:** all archery (compound, target, bowhunting) — the spine-matching problem is universal.
- **Geography:** international from day one (metric + US units; .com domain; no locale assumptions).

## Positioning
> "The calculator that shows its working."
> Every number traceable: formulas exposed, sources cited, confidence bands honest. Built by archers who actually build arrows.

## Feature set by phase
**Phase 1 — Spine Core (the v1 that beats everything findable today)**
- Dynamic spine matcher: bow requirement vs arrow supply, ±2# match convention (3Rivers-proven UX)
- "Show the working" panel: every coefficient + intermediate value + citation
- AMO/ASTM spine convention handling (the #1 source of user confusion — handled and explained)
- Wood/carbon/aluminum shafts; center cut, strike plate, string type; personal calibration factor
- Metric/US units, shareable result URL

**Phase 2 — Build Lab**
- Component-level build calculator: total grains, GPP, FOC (AMO method), balance point
- Component DB (points, inserts, nocks, fletching) with provenance
- Build library (local, exportable) + URL-shared builds
- Speed / kinetic energy / momentum estimates

**Phase 3 — Differentiation (the moat)**
- Cross-check mode: run one setup through multiple manufacturer chart models (Easton, Gold Tip, Black Eagle, 3Rivers-style) and show the disagreement band
- Uncertainty bands: Monte Carlo over input tolerances (bow weight is ±2–3# in reality) → "340–400, 70%" instead of "380"
- Tuning loop: bare-shaft / paper-tune results feed back to calibrate the model to YOUR bow ("personal form factor" done properly — a calculator that learns from your actual tune)

**Phase 4 — Traffic & Income**
- SEO content layer (the link magnet): "Why spine charts disagree", trad arrow building guides, AMO vs ASTM explainer
- Affiliate integration, analytics, PWA offline, performance polish

## Monetisation analysis
| Channel | Detail | Status |
|---------|--------|--------|
| Affiliate — 3Rivers | In-house program, **5% commission, monthly payout (e-check), free to join** (per commission.academy). Ironic but fitting: their de-listed tool sends us traffic, we send them sales | verify terms + apply |
| Affiliate — Lancaster Archery | "The Archery Program" — likely ambassador/affiliate; terms unverified | verify |
| Affiliate — Amazon Associates | Fallback for gear links; sports/outdoors rates are low single-digit % | fallback |
| Display ads | Only on content pages, never inside tool UI. Journey by Mediavine (~10k sessions/mo) → Mediavine (50k) once traffic lands | phase 4, traffic-gated |
| Donations ("buy me an arrow") | Optional; low friction, fits the hobbyist trust model | optional |

**Timeline honesty (standing rule for this project):** organic search traffic compounds over 6–12 months. The calculator is the link magnet; guides convert it. Revenue is a month-6+ outcome, not a launch feature. Nothing monetised until the tool is genuinely good — Hayden's order of priorities: quality first ("delay and spend more time getting the core software right").

## Risks & mitigations
- **Model fidelity risk:** dynamic spine is partly empirical; no model is universally right. → Mitigation: transparency, cross-check mode, validation oracle fixtures (Stu Miller outputs + published charts), honest bands. The disagreement becomes a feature, not a bug.
- **SEO timeline risk:** new domain takes months to rank. → Mitigation: content quality + the fact that the incumbent is de-listed; exact-match long-tail ("dynamic spine calculator", "traditional arrow spine chart") is winnable.
- **IP risk:** accidentally reproducing proprietary data. → Mitigation: architecture.md provenance rules; oracle-only use of Stu Miller's sheet; own DB from manufacturer specs with citations.
- **Scope risk:** feature creep before v1 ships. → Mitigation: phase gates; v1 = spine core + transparency only.

## Decisions Register (🟩 = decided, 🟨 = needs Hayden)
| # | Decision | Options | Status |
|---|----------|---------|--------|
| D1 | Product name | **SpineLab** | 🟩 chosen 2026-11-18 (name check: Swiss medtech Spinelab AG exists — spinal implants, different class; low confusion risk) |
| D2 | Domain | spinelab.com/.net/.org/.io/.app/.dev ALL taken; **spinelab.tools available** (recommend grab now); .com alternative = name variant | 🟨 pick pending |
| D3 | Repo visibility | **public core** | 🟩 decided 2026-11-18 |
| D4 | Hosting | **Firebase Hosting** | 🟩 decided 2026-11-18 |
| D5 | Ads policy | content pages only, never in tool UI | 🟩 (default adopted) |
| D6 | Trad-first scope | v1 built for trad, designed for all | 🟩 (default adopted) |
| D7 | Stack | Astro + TypeScript core package, vitest, client-side only | 🟩 (default adopted, reversible) |

### Name check detail (2026-11-18)
- **Spinelab AG** (Switzerland, founded 2002, Winterthur/Zug): spinal implant medtech — Elaspine/DynaSpine, US patents, CE-marked. Owns spinelab.com since 2003-10-12 (registrar NetZone.ch, active). Different industry + trademark classes (medical devices vs sporting goods/software); "spine" is a generic archery term. Low but non-zero conflict risk — fine for use, not fine to imply affiliation.
- spinelab.net (2000) and spinelab.org also registered (unrelated holders). spinelab.app (Mar 2026) and spinelab.dev (Jul 2026) recently registered by others. spinelab.io registered via GoDaddy.
- No archery/software product named SpineLab found. SpinalHDL (FPGA) and SpikeLab (neuro) are unrelated.
