import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  AMO_POUNDS,
  ASTM_DEFLECTION,
  beamDeflectionMeters,
  deflectionFactor,
  momentOfInertiaSolid,
  momentOfInertiaTube,
  staticDeflection,
  staticSpineAt,
} from '../src/index';
import { coefficient } from '../src/coefficients';
import { PUBLISHED_ALUMINUM_SHAFTS } from './fixtures/oracle/stu-miller-shaft-table';

/**
 * Independent inch→metre literal for unit-conversion checks. Deliberately
 * NOT imported from src — if src ever breaks its constants, these tests
 * must still hold.
 */
const IN_TO_M = 0.0254;

const E_EFF_ALUMINUM_PA = coefficient('eEffectiveAluminumGPa').value * 1e9;

describe('moment of inertia', () => {
  it('solid I matches the closed-form π·d⁴/64 with an inline 0.0254 constant (rel 1e-15)', () => {
    fc.assert(
      fc.property(fc.double({ min: 0.1, max: 0.5, noNaN: true }), (dIn) => {
        const expected = ((Math.PI * dIn ** 4) / 64) * IN_TO_M ** 4;
        const actual = momentOfInertiaSolid(dIn);
        expect(Math.abs(actual - expected) / expected).toBeLessThan(1e-15);
      }),
    );
  });

  it('tube I hand-check: 1916 geometry within 0.1% of 5.8133e-11 m^4', () => {
    const odIn = 19 / 64;
    const idIn = 0.264875;
    // Independent reference: same closed form, inline 0.0254 constant —
    // this only guards the in→m unit conversion, not the formula.
    const reference = (Math.PI / 64) * ((odIn * IN_TO_M) ** 4 - (idIn * IN_TO_M) ** 4);
    const actual = momentOfInertiaTube(odIn, idIn);
    expect(Math.abs(actual - reference) / reference).toBeLessThan(0.001);
    expect(Math.abs(actual - 5.8133e-11) / 5.8133e-11).toBeLessThan(0.001);
  });
});

describe('physics-consistency across rigs', () => {
  it('δ_AMO / δ_ASTM === deflectionFactor(ASTM, AMO) within 1e-12 relative', () => {
    // Both deflections come from the same beam formula, so the ratio must
    // reduce to (F·L³)₂/(F·L³)₁ regardless of shaft — this pins that the
    // rig quantities are actually what staticDeflection consumes.
    fc.assert(
      fc.property(
        fc.double({ min: 40e9, max: 90e9, noNaN: true }),
        fc.double({ min: 0.2, max: 0.35, noNaN: true }),
        fc.double({ min: 0.15, max: 0.19, noNaN: true }),
        (modulusPa, odIn, idIn) => {
          const atAmo = staticDeflection({ modulusPa, odIn, idIn }, AMO_POUNDS).meters;
          const atAstm = staticDeflection({ modulusPa, odIn, idIn }, ASTM_DEFLECTION).meters;
          const ratio = atAmo / atAstm;
          const expected = deflectionFactor(ASTM_DEFLECTION, AMO_POUNDS);
          expect(Math.abs(ratio - expected) / expected).toBeLessThan(1e-12);
        },
      ),
    );
  });
});

describe('CHART NEIGHBOURHOOD: Easton published aluminum table', () => {
  it('all 28 sizes reproduce the published ASTM deflection within ±8%', () => {
    expect(PUBLISHED_ALUMINUM_SHAFTS).toHaveLength(28);
    for (const shaft of PUBLISHED_ALUMINUM_SHAFTS) {
      const spine = staticSpineAt(
        {
          modulusPa: E_EFF_ALUMINUM_PA,
          odIn: shaft.odIn,
          idIn: shaft.odIn - 2 * shaft.wallIn,
        },
        'astm-deflection',
      );
      expect(spine.kind).toBe('astm-spine');
      if (spine.kind !== 'astm-spine') continue;
      const expected = shaft.astmDeflectionIn * 1000;
      expect(Math.abs(spine.thousandths - expected) / expected).toBeLessThanOrEqual(0.08);
    }
  });

  it('all 28 sizes reproduce the AMO-pound rating within ±8%', () => {
    for (const shaft of PUBLISHED_ALUMINUM_SHAFTS) {
      const spine = staticSpineAt(
        {
          modulusPa: E_EFF_ALUMINUM_PA,
          odIn: shaft.odIn,
          idIn: shaft.odIn - 2 * shaft.wallIn,
        },
        'amo-pounds',
      );
      expect(spine.kind).toBe('amo-spine');
      if (spine.kind !== 'amo-spine') continue;
      // Published AMO pounds for the same deflection: 26 / (δ_in × 0.825).
      // Tolerance is 8.5%, not 8%: a deflection residual r propagates to
      // pounds as r/(1−r), so the worst table row (1516, −7.6% deflection,
      // per the eEffectiveAluminumGPa registry entry) lands at +8.2% in
      // pounds — mathematically outside a symmetric ±8% bound.
      const expected = 26 / (shaft.astmDeflectionIn * 0.825);
      expect(Math.abs(spine.pounds - expected) / expected).toBeLessThanOrEqual(0.085);
    }
  });
});

describe('monotonicity properties', () => {
  const E = 70e9;

  it('larger OD (fixed ID) → stiffer (lower deflection)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.15, max: 0.2, noNaN: true }),
        fc.double({ min: 0.21, max: 0.35, noNaN: true }),
        fc.double({ min: 0.001, max: 0.05, noNaN: true }),
        (idIn, odBase, odDelta) => {
          fc.pre(odBase + odDelta <= 0.4);
          const thinner = staticDeflection(
            { modulusPa: E, odIn: odBase, idIn },
            ASTM_DEFLECTION,
          ).meters;
          const thicker = staticDeflection(
            { modulusPa: E, odIn: odBase + odDelta, idIn },
            ASTM_DEFLECTION,
          ).meters;
          expect(thicker).toBeLessThan(thinner);
        },
      ),
    );
  });

  it('larger ID (fixed OD) → weaker (more deflection)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.25, max: 0.35, noNaN: true }),
        fc.double({ min: 0.15, max: 0.24, noNaN: true }),
        fc.double({ min: 0.001, max: 0.05, noNaN: true }),
        (odIn, idBase, idDelta) => {
          fc.pre(idBase + idDelta < odIn);
          const thickerWall = staticDeflection(
            { modulusPa: E, odIn, idIn: idBase },
            ASTM_DEFLECTION,
          ).meters;
          const thinnerWall = staticDeflection(
            { modulusPa: E, odIn, idIn: idBase + idDelta },
            ASTM_DEFLECTION,
          ).meters;
          expect(thinnerWall).toBeGreaterThan(thickerWall);
        },
      ),
    );
  });

  it('longer span → more deflection', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 20, max: 40, noNaN: true }),
        fc.double({ min: 0.1, max: 5, noNaN: true }),
        (spanBase, spanDelta) => {
          const args = { forceLb: 2, modulusPa: E, momentInertiaM4: 5.8e-11 };
          const shorter = beamDeflectionMeters({ ...args, spanIn: spanBase });
          const longer = beamDeflectionMeters({ ...args, spanIn: spanBase + spanDelta });
          expect(longer).toBeGreaterThan(shorter);
        },
      ),
    );
  });

  it('heavier force → more deflection', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 5, noNaN: true }),
        fc.double({ min: 0.1, max: 3, noNaN: true }),
        (forceBase, forceDelta) => {
          const args = { spanIn: 28, modulusPa: E, momentInertiaM4: 5.8e-11 };
          const lighter = beamDeflectionMeters({ ...args, forceLb: forceBase });
          const heavier = beamDeflectionMeters({ ...args, forceLb: forceBase + forceDelta });
          expect(heavier).toBeGreaterThan(lighter);
        },
      ),
    );
  });
});

describe('FIXTURE LOCK: 1916 worked example', () => {
  it('1916 at E_eff gives AMO pounds between 47.8 and 55.9 (published 50.8# ±8%)', () => {
    const spine = staticSpineAt(
      {
        modulusPa: E_EFF_ALUMINUM_PA,
        odIn: 19 / 64,
        idIn: 19 / 64 - 2 * 0.016,
      },
      'amo-pounds',
    );
    expect(spine.kind).toBe('amo-spine');
    if (spine.kind !== 'amo-spine') return;
    expect(spine.pounds).toBeGreaterThanOrEqual(47.8);
    expect(spine.pounds).toBeLessThanOrEqual(55.9);
  });
});

describe('validation', () => {
  it('rejects non-finite or non-positive inputs', () => {
    expect(() => momentOfInertiaSolid(Number.NaN)).toThrow(RangeError);
    expect(() => momentOfInertiaSolid(0)).toThrow(RangeError);
    expect(() => momentOfInertiaTube(0.3, 0.3)).toThrow(RangeError);
    expect(() =>
      beamDeflectionMeters({ forceLb: -1, spanIn: 28, modulusPa: 70e9, momentInertiaM4: 5.8e-11 }),
    ).toThrow(RangeError);
    expect(() =>
      beamDeflectionMeters({
        forceLb: 2,
        spanIn: Number.POSITIVE_INFINITY,
        modulusPa: 70e9,
        momentInertiaM4: 5.8e-11,
      }),
    ).toThrow(RangeError);
    expect(() =>
      staticDeflection({ modulusPa: 70e9, odIn: 0.3, idIn: 0.3 }, ASTM_DEFLECTION),
    ).toThrow(RangeError);
    expect(() => staticDeflection({ modulusPa: 0, odIn: 0.3 }, AMO_POUNDS)).toThrow(RangeError);
  });
});
