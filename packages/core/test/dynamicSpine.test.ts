import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  arrowSupply,
  astmSpine,
  bowNeed,
  bowNeedQuick,
  matchVerdict,
  shelfCorrectionPounds,
} from '../src/index';
import {
  FIXTURE_PROVENANCE,
  STU_MILLER_REV6_DYNAMIC_FIXTURES,
} from './fixtures/oracle/stu-miller-dynamic-spine';
import {
  ALUMINUM_LETTER_LEGENDS,
  THREE_RIVERS_CHART_FACTS,
} from './fixtures/charts/three-rivers-published';

describe('FIXTURE LOCK: Stu Miller Rev 6-12-09 (40-point grid)', () => {
  it('fixture provenance is present and honest about its method', () => {
    expect(FIXTURE_PROVENANCE.method).toContain('cached result states');
  });

  it('bowNeed reproduces all 40 expected bowRequiredPounds within ±0.1#', () => {
    expect(STU_MILLER_REV6_DYNAMIC_FIXTURES).toHaveLength(40);
    STU_MILLER_REV6_DYNAMIC_FIXTURES.forEach((point, i) => {
      const got = bowNeed({
        ratedWeightLb: point.inputs.ratedW,
        ratedDrawIn: point.inputs.ratedDraw,
        yourDrawIn: point.inputs.yourDraw,
        shelfCutIn: point.inputs.shelfCutIn,
        stringMaterial: point.inputs.string,
      }).pounds;
      expect(
        Math.abs(got - point.expected.bowRequiredPounds),
        `point #${i} bowNeed: got ${got}, expected ${point.expected.bowRequiredPounds}`,
      ).toBeLessThanOrEqual(0.1);
    });
  });

  it('arrowSupply reproduces all 40 expected arrowDynamicPounds within ±0.1#', () => {
    expect(STU_MILLER_REV6_DYNAMIC_FIXTURES).toHaveLength(40);
    STU_MILLER_REV6_DYNAMIC_FIXTURES.forEach((point, i) => {
      const got = arrowSupply({
        staticSpine: astmSpine(point.inputs.astmThousandths),
        bopLengthIn: point.inputs.bopIn,
        pointWeightGr: point.inputs.pointGr,
        nockEndWeightGr: point.inputs.nockGr,
        fletching: point.inputs.fletching,
      }).pounds;
      expect(
        Math.abs(got - point.expected.arrowDynamicPounds),
        `point #${i} arrowSupply: got ${got}, expected ${point.expected.arrowDynamicPounds}`,
      ).toBeLessThanOrEqual(0.1);
    });
  });
});

describe('Cached spreadsheet states', () => {
  it('Rev 6-12-09 cached state: 620/29in/140gr/11gr/feathers dynamic, 50#@28 shelf +1/8 fastflight required', () => {
    const dynamic = arrowSupply({
      staticSpine: astmSpine(620),
      bopLengthIn: 29,
      pointWeightGr: 140,
      nockEndWeightGr: 11,
      fletching: 'feathers',
    }).pounds;
    // Spreadsheet cached result: 50.12512774. Our implementation uses the
    // published 0.825419 rig ratio where the spreadsheet rounds to 0.825,
    // so we sit a few hundredths below — hence the 0.05# tolerance.
    expect(Math.abs(dynamic - 50.12512774)).toBeLessThanOrEqual(0.05);

    const required = bowNeed({
      ratedWeightLb: 50,
      ratedDrawIn: 28,
      yourDrawIn: 28,
      shelfCutIn: 0.125,
      stringMaterial: 'fastflight',
    }).pounds;
    expect(Math.abs(required - 50.5)).toBeLessThanOrEqual(1e-9);
  });

  it('Rev 1 cached state: 620/29in/125gr/0gr/feathers dynamic, 50#@28 draw29 shelf +1/8 b50 required', () => {
    const dynamic = arrowSupply({
      staticSpine: astmSpine(620),
      bopLengthIn: 29,
      pointWeightGr: 125,
      nockEndWeightGr: 0,
      fletching: 'feathers',
    }).pounds;
    // Spreadsheet displays 50.8 (1 dp); the provenance records the
    // formula value as 50.766. Our implementation uses the published
    // 0.825419 rig ratio where the spreadsheet rounds to 0.825, so we
    // anchor on the provenance-recorded formula value...
    expect(Math.abs(dynamic - 50.766)).toBeLessThanOrEqual(0.05);
    // ...and keep a widened sanity check against the displayed 1-dp
    // value (the 0.825-vs-0.825419 rounding contributes ~0.026).
    expect(Math.abs(dynamic - 50.8)).toBeLessThanOrEqual(0.06);

    const required = bowNeed({
      ratedWeightLb: 50,
      ratedDrawIn: 28,
      yourDrawIn: 29,
      shelfCutIn: 0.125,
      stringMaterial: 'b50',
    }).pounds;
    expect(Math.abs(required - 51.0)).toBeLessThanOrEqual(1e-9);
  });
});

describe('Monotonicity properties (fast-check)', () => {
  const SUPPLY_DELTA = 0.01;
  const baseSupply = {
    staticSpine: astmSpine(500),
    bopLengthIn: 29,
    pointWeightGr: 125,
    nockEndWeightGr: 11,
    fletching: 'feathers',
  } as const;

  it('arrowSupply strictly DECREASES with bopLengthIn over [27, 31]', () => {
    fc.assert(
      fc.property(fc.double({ min: 27, max: 31 - SUPPLY_DELTA, noNaN: true }), (bopLengthIn) => {
        const lo = arrowSupply({ ...baseSupply, bopLengthIn }).pounds;
        const hi = arrowSupply({ ...baseSupply, bopLengthIn: bopLengthIn + SUPPLY_DELTA }).pounds;
        expect(hi).toBeLessThan(lo);
      }),
    );
  });

  it('arrowSupply strictly DECREASES with pointWeightGr over [100, 200]', () => {
    const delta = 0.5;
    fc.assert(
      fc.property(fc.double({ min: 100, max: 200 - delta, noNaN: true }), (pointWeightGr) => {
        const lo = arrowSupply({ ...baseSupply, pointWeightGr }).pounds;
        const hi = arrowSupply({ ...baseSupply, pointWeightGr: pointWeightGr + delta }).pounds;
        expect(hi).toBeLessThan(lo);
      }),
    );
  });

  it('arrowSupply strictly INCREASES with nockEndWeightGr over [5, 20]', () => {
    const delta = 0.5;
    fc.assert(
      fc.property(fc.double({ min: 5, max: 20 - delta, noNaN: true }), (nockEndWeightGr) => {
        const lo = arrowSupply({ ...baseSupply, nockEndWeightGr }).pounds;
        const hi = arrowSupply({ ...baseSupply, nockEndWeightGr: nockEndWeightGr + delta }).pounds;
        expect(hi).toBeGreaterThan(lo);
      }),
    );
  });

  it('bowNeed strictly INCREASES with ratedWeightLb over [30, 65] at fixed yourDraw = 28', () => {
    const delta = 0.25;
    fc.assert(
      fc.property(fc.double({ min: 30, max: 65 - delta, noNaN: true }), (ratedWeightLb) => {
        const lo = bowNeed({
          ratedWeightLb,
          ratedDrawIn: 28,
          yourDrawIn: 28,
          shelfCutIn: 0,
          stringMaterial: 'b50',
        }).pounds;
        const hi = bowNeed({
          ratedWeightLb: ratedWeightLb + delta,
          ratedDrawIn: 28,
          yourDrawIn: 28,
          shelfCutIn: 0,
          stringMaterial: 'b50',
        }).pounds;
        expect(hi).toBeGreaterThan(lo);
      }),
    );
  });

  it('bowNeed strictly INCREASES with yourDrawIn over [25, 31]', () => {
    const delta = 0.05;
    fc.assert(
      fc.property(fc.double({ min: 25, max: 31 - delta, noNaN: true }), (yourDrawIn) => {
        const lo = bowNeed({
          ratedWeightLb: 50,
          ratedDrawIn: 28,
          yourDrawIn,
          shelfCutIn: 0.125,
          stringMaterial: 'b50',
        }).pounds;
        const hi = bowNeed({
          ratedWeightLb: 50,
          ratedDrawIn: 28,
          yourDrawIn: yourDrawIn + delta,
          shelfCutIn: 0.125,
          stringMaterial: 'b50',
        }).pounds;
        expect(hi).toBeGreaterThan(lo);
      }),
    );
  });

  it('bowNeed strictly DECREASES with shelfCutIn over [-0.1875, 0.625] (more center cut = stiffer arrow needed)', () => {
    const delta = 0.005;
    fc.assert(
      fc.property(fc.double({ min: -0.1875, max: 0.625 - delta, noNaN: true }), (shelfCutIn) => {
        const lo = bowNeed({
          ratedWeightLb: 50,
          ratedDrawIn: 28,
          yourDrawIn: 28,
          shelfCutIn,
          stringMaterial: 'b50',
        }).pounds;
        const hi = bowNeed({
          ratedWeightLb: 50,
          ratedDrawIn: 28,
          yourDrawIn: 28,
          shelfCutIn: shelfCutIn + delta,
          stringMaterial: 'b50',
        }).pounds;
        expect(hi).toBeLessThan(lo);
      }),
    );
  });
});

describe('match verdict ±2# convention', () => {
  it('boundary cases land exactly as the convention dictates', () => {
    expect(matchVerdict(50, 52)).toBe('match');
    expect(matchVerdict(50, 48)).toBe('match');
    expect(matchVerdict(50, 52.01)).toBe('stiff');
    expect(matchVerdict(50, 47.99)).toBe('weak');
  });

  it('supply > need → stiff means the ARROW is stiffer than the bow needs', () => {
    // Fixture-free reasoning: a dynamic pound rating IS a stiffness
    // rating (higher AMO pounds = stiffer arrow — 26/δ with δ the
    // deflection, so more pounds = less deflection = stiffer). Therefore
    // arrowSupply exceeding bowNeed by more than the ±2# tolerance means
    // the arrow is too STIFF for the bow, and falling below it means the
    // arrow is too WEAK — which is exactly the polarity matchVerdict
    // implements (supply > need + tol → 'stiff').
    expect(matchVerdict(40, 60)).toBe('stiff');
    expect(matchVerdict(60, 40)).toBe('weak');
  });
});

describe('Chart-neighborhood (never pinned to one chart)', () => {
  it('FastFlight string factor adds between 0 and the published +5# inclusive vs B50', () => {
    const b50 = bowNeed({
      ratedWeightLb: 50,
      ratedDrawIn: 28,
      yourDrawIn: 28,
      shelfCutIn: 0.125,
      stringMaterial: 'b50',
    }).pounds;
    const fastflight = bowNeed({
      ratedWeightLb: 50,
      ratedDrawIn: 28,
      yourDrawIn: 28,
      shelfCutIn: 0.125,
      stringMaterial: 'fastflight',
    }).pounds;
    const delta = fastflight - b50;
    // Stu Miller's ×1.05 at 50# gives +2.5#; 3Rivers publishes a flat
    // '+5 for Fast Flight® bow strings' rule. We sit between the two.
    expect(delta).toBeGreaterThan(0);
    expect(delta).toBeLessThanOrEqual(THREE_RIVERS_CHART_FACTS.fastFlightSpineAdjustmentPounds);
  });

  it('bow-type offsets BRACKET the oracle shelf response without pinning to it', () => {
    const need = (shelfCutIn: number) =>
      bowNeed({
        ratedWeightLb: 50,
        ratedDrawIn: 28,
        yourDrawIn: 28,
        shelfCutIn,
        stringMaterial: 'b50',
      }).pounds;
    // Oracle: shelf 0 (center cut) vs 1/8" less than center — the
    // recurve-vs-longbow shelf delta.
    const oracleShelfDelta = need(0) - need(0.125);
    expect(oracleShelfDelta).toBeGreaterThan(0);

    const quick = (bowType: 'centershotRecurve' | 'shelfLongbow') =>
      bowNeedQuick({ drawWeightLb: 50, bowType }).pounds;
    expect(quick('centershotRecurve') - quick('shelfLongbow')).toBe(5);

    // Documented bracketing, not equality: the community offsets (+5 vs
    // +10) must straddle the oracle's continuous 7# shelf response.
    expect(oracleShelfDelta).toBeGreaterThanOrEqual(5);
    expect(oracleShelfDelta).toBeLessThanOrEqual(10);
  });

  it('aluminum letter-legend disagreement between the two 3Rivers PDFs is real', () => {
    const arrowCharts: Record<string, string> = ALUMINUM_LETTER_LEGENDS.arrowChartsPdf;
    const aluminium: Record<string, string> = ALUMINUM_LETTER_LEGENDS.aluminiumSpineChartPdf;
    const sizes = new Set([...Object.keys(arrowCharts), ...Object.keys(aluminium)]);
    const disagreements = [...sizes].filter((size) => arrowCharts[size] !== aluminium[size]);
    expect(disagreements.length).toBeGreaterThanOrEqual(1);
  });
});

describe('shelf correction interpolation', () => {
  it('is exact at the tabulated dropdown steps', () => {
    expect(shelfCorrectionPounds(0)).toBe(5);
    expect(shelfCorrectionPounds(0.125)).toBe(-2);
  });

  it('interpolates linearly between steps', () => {
    // Midway between 0.0625 (+2) and 0.125 (−2) → 0.
    expect(Math.abs(shelfCorrectionPounds(0.09375) - 0)).toBeLessThanOrEqual(1e-12);
  });

  it('throws RangeError outside the tabulated [-0.1875, 0.625] range', () => {
    expect(() => shelfCorrectionPounds(-0.1875 - 1e-9)).toThrow(RangeError);
    expect(() => shelfCorrectionPounds(0.625 + 1e-9)).toThrow(RangeError);
  });
});
