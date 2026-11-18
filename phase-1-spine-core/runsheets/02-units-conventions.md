# Runsheet 02 — Units & Spine Conventions

> Phase 1, T2, Owner 🟠 S→K (coder), ~3h, depends on T1

## Objective
Implement the units system and the AMO/ASTM spine convention handling in `packages/core/src/units/` — the foundation every model stands on.

## Steps
1. Unit types: length (in/mm), mass (gr/g/kg), force (lb/N), deflection; conversion helpers with round-trip property tests
2. Spine convention module: `Rig = AMO_POUNDS (2 lb @ 26") | ASTM_DEFLECTION (1.94 lb @ 28")`; physical deflection as the internal representation
3. Conversions between conventions — **lock the 0.825 factor direction from Stu Miller's instructions with fixtures** (architecture.md §2: factor applies to pound-ratings; deflection-thousandths convert inversely via the beam equation)
4. Property tests: A→B→A round-trips; stiffness ordering inverts correctly between conventions (higher pounds = stiffer; higher thousandths = weaker)
5. API returns conversions WITH the rig name attached (a bare number without its rig is a type error)

## Acceptance Criteria
- [ ] Both conventions accepted and normalized; internal math never mixes conventions
- [ ] Round-trip property tests pass
- [ ] Stiffness-ordering inversion test passes
- [ ] 0.825 factor verified against oracle instruction PDF (fixture cites Stu Miller instructions, p.1)
- [ ] Type system prevents passing a spine number without its rig

## Notes
- CONSTRAINTS: **DO NOT deploy.**
- This module is the project's bedrock — prefer over-engineering types here over under-engineering (Hayden's foundation rule).
