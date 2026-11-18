# Runsheet 01 — Monorepo Scaffold

> Phase 1, T1, Owner 🟠 S→K (coder), ~2h, no dependencies

## Objective
Stand up the pnpm workspace monorepo with `packages/core` (pure TS), `apps/web` (Astro), vitest, lint, and CI — so every later task lands in a known-good skeleton.

## Steps
1. `pnpm init` workspace at /home/sage/projects/spinelab; create `packages/core` (TS library, tsconfig strict, vitest) and `apps/web` (Astro minimal, TS strict)
2. Wire workspace deps: apps/web depends on packages/core via workspace protocol
3. Add eslint + prettier; `pnpm -r lint` and `pnpm -r test` scripts green (trivial passing test in core)
4. GitHub repo `haydokm8/spinelab` (visibility per D3), CI workflow: install → lint → test → astro build on push
5. Seed `packages/core/test/fixtures/` dirs (oracle/ and charts/) with a README describing fixture provenance format

## Acceptance Criteria
- [ ] `pnpm -r test` passes with ≥1 real test (unit conversion placeholder)
- [ ] `pnpm -r lint` clean
- [ ] `astro build` produces static output
- [ ] CI green on the first push
- [ ] Fixture provenance README committed (source / date / method header format)

## Notes
- CONSTRAINTS: **DO NOT deploy** anywhere — this task creates structure only.
- Node LTS on the host; pnpm via corepack.
