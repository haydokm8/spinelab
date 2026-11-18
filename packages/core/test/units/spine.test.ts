import { describe, expect, expectTypeOf, it } from 'vitest';
import fc from 'fast-check';
import {
  AMO_POUNDS,
  convertSpine,
  astmSpine,
  amoSpine,
  toDeflection,
  deflectionFactor,
  deflectionMetersToInches,
  type Spine,
} from '../../src/index';
import {
  expectedFactor,
  routeAgreementTolerancePounds,
  workedExample,
} from '../fixtures/oracle/stu-miller-conventions';

describe('FIXTURE LOCK: carbon "500" → 63.0# AMO', () => {
  it('astmSpine(500) converts to ≈63.0# AMO', () => {
    const amo = convertSpine(astmSpine(workedExample.astmThousandths), 'amo-pounds');
    expect(amo.kind).toBe('amo-spine');
    expect(amo.pounds).toBeCloseTo(
      workedExample.expectedAmoPounds,
      workedExample.tolerancePounds / 2,
    );
    expect(Math.abs(amo.pounds - workedExample.expectedAmoPounds)).toBeLessThanOrEqual(
      workedExample.tolerancePounds,
    );
  });

  it('astmSpine(500) corresponds to ≈0.412709 in deflection at the AMO rig', () => {
    const d = toDeflection(convertSpine(astmSpine(workedExample.astmThousandths), 'amo-pounds'));
    expect(d.rig.id).toBe('amo-pounds');
    const inches = deflectionMetersToInches(d.meters);
    expect(Math.abs(inches - workedExample.expectedAmoDeflectionIn)).toBeLessThanOrEqual(
      workedExample.toleranceIn,
    );
  });
});

describe('the ÷0.825 pound-route equivalence', () => {
  it('26/0.500 ÷ factor(ASTM→AMO) matches convertSpine within 0.1#', () => {
    // Stu Miller's pound pipeline: P_AMO = (26/δ_ASTM) / 0.825419, where the
    // "divide by 0.825" applies to POUND numbers only.
    const poundRoute = 26 / (workedExample.astmThousandths / 1000) / expectedFactor;
    const deflectionRoute = convertSpine(
      astmSpine(workedExample.astmThousandths),
      'amo-pounds',
    ).pounds;
    expect(Math.abs(poundRoute - deflectionRoute)).toBeLessThanOrEqual(
      routeAgreementTolerancePounds,
    );
  });
});

describe('ordering inversion (stiffer = lower thousandths)', () => {
  it('higher AMO pounds ⇔ lower ASTM thousandths, both directions', () => {
    const fcPounds = fc.tuple(
      fc.double({ min: 20, max: 120, noNaN: true }),
      fc.double({ min: 20, max: 120, noNaN: true }),
    );
    fc.assert(
      fc.property(fcPounds, ([a, b]) => {
        fc.pre(Math.abs(a - b) / Math.max(a, b) > 1e-6);
        const ta = convertSpine(amoSpine(a), 'astm-deflection').thousandths;
        const tb = convertSpine(amoSpine(b), 'astm-deflection').thousandths;
        if (a < b) expect(ta).toBeGreaterThan(tb);
        else expect(ta).toBeLessThan(tb);
      }),
    );
    fc.assert(
      fc.property(fcPounds, ([a, b]) => {
        fc.pre(Math.abs(a - b) / Math.max(a, b) > 1e-6);
        const pa = convertSpine(astmSpine(a), 'amo-pounds').pounds;
        const pb = convertSpine(astmSpine(b), 'amo-pounds').pounds;
        if (a < b) expect(pa).toBeGreaterThan(pb);
        else expect(pa).toBeLessThan(pb);
      }),
    );
  });
});

describe('round-trip conversions', () => {
  it('convertSpine(convertSpine(s, other), back) ≈ s (relative 1e-9)', () => {
    const fcPounds = fc.double({ min: 20, max: 120, noNaN: true });
    const fcThousandths = fc.double({ min: 100, max: 1000, noNaN: true });
    fc.assert(
      fc.property(fcPounds, (p) => {
        const s = amoSpine(p);
        const back = convertSpine(convertSpine(s, 'astm-deflection'), 'amo-pounds');
        expect(back.pounds / s.pounds).toBeCloseTo(1, 9);
      }),
    );
    fc.assert(
      fc.property(fcThousandths, (t) => {
        const s = astmSpine(t);
        const back = convertSpine(convertSpine(s, 'amo-pounds'), 'astm-deflection');
        expect(back.thousandths / s.thousandths).toBeCloseTo(1, 9);
      }),
    );
  });
});

describe('results carry their rig', () => {
  it('kinds and rig ids match the target convention', () => {
    const amo = convertSpine(astmSpine(500), 'amo-pounds');
    const astm = convertSpine(amoSpine(63), 'astm-deflection');
    expect(amo.kind).toBe('amo-spine');
    expect(amo.rig.id).toBe(AMO_POUNDS.id);
    expect(astm.kind).toBe('astm-spine');
    expect(astm.rig.id).toBe('astm-deflection');
  });
});

describe('type-level contract', () => {
  it('convertSpine takes a Spine, not a bare number', () => {
    expectTypeOf(convertSpine).parameter(0).toEqualTypeOf<Spine>();
    const rejectBareNumber = () => {
      // @ts-expect-error convertSpine(500, 'amo-pounds')
      convertSpine(500, 'amo-pounds');
    };
    expectTypeOf(rejectBareNumber).returns.toBeVoid();
  });
});

describe('validation', () => {
  it('rejects non-finite or non-positive spine values', () => {
    expect(() => amoSpine(Number.NaN)).toThrow(RangeError);
    expect(() => amoSpine(0)).toThrow(RangeError);
    expect(() => amoSpine(-63)).toThrow(RangeError);
    expect(() => astmSpine(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => astmSpine(0)).toThrow(RangeError);
  });

  it('factor used end-to-end stays the published one', () => {
    // Cross-check: convertSpine(amo→astm)·convertSpine(astm→amo) consistent
    // with deflectionFactor's inverse relationship.
    const p = 63;
    const t = convertSpine(amoSpine(p), 'astm-deflection').thousandths;
    const pBack = convertSpine(astmSpine(t), 'amo-pounds').pounds;
    expect(Math.abs(pBack - p) / p).toBeLessThan(1e-12);
    expect(deflectionFactor(AMO_POUNDS, AMO_POUNDS)).toBe(1);
  });
});
