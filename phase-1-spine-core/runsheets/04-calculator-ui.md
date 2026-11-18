# Runsheet 04 — Calculator UI + "Show the Working" Panel

> Phase 1, T4, Owner 🟠 S→K (frontend), ~6h, depends on T3

## Objective
Build the calculator page in `apps/web`: bow + arrow inputs, match verdict, and the transparency panel that renders every contributing term from the coefficient registry. The working panel IS the product.

## Steps
1. Input form: bow (type, factory wt/dl, your dl, center cut, strike plate, string type/strands) + arrow (shaft spec or preset, length, point/insert/nock/fletching weights) + personal calibration slider
2. Results: bow-need vs arrow-supply numbers, match verdict (±2#), brace-height fine-tune hint (3Rivers-proven interaction shape, our own wording)
3. **Working panel:** expandable per-result breakdown rendering from `coefficients.ts` — each term shows value, units, physics|empirical label, source citation. Golden test: removing any coefficient changes the panel output
4. Unit toggle (metric/US) preserving state; spine convention badges showing which rig every number is in
5. Shareable URL: encode setup into query params, restore on load
6. Mobile-first responsive (archers use phones in workshops); zero console errors; a11y: labeled inputs, keyboard-navigable, contrast AA

## Acceptance Criteria
- [ ] Realistic setup produces the match verdict and full working breakdown
- [ ] Every displayed number traceable in the panel to a cited term
- [ ] AMO/ASTM badges correct on every spine number
- [ ] URL share → restore round-trips a setup exactly
- [ ] Metric/US toggle round-trips without state loss
- [ ] Lighthouse perf ≥ 95, a11y ≥ 95; works on a phone

## Notes
- CONSTRAINTS: **DO NOT deploy.**
- UX reference: 3Rivers' interaction shape (bow results / arrow results / "these two should be nearly equal"). Never their markup, wording, or styling.
- No accounts, no backend calls — everything client-side.
