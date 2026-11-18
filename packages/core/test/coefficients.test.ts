import { describe, expect, it } from 'vitest';
import {
  BOW_TYPE_OFFSETS_POUNDS,
  COEFFICIENTS,
  FLETCHING_REFERENCE_WEIGHTS_GR,
  SHELF_CUT_CORRECTIONS,
  STRING_MATERIAL_FACTORS,
  coefficient,
  type Coefficient,
  type CoefficientKind,
  type VerifyStatus,
} from '../src/coefficients';

const VALID_KINDS: readonly CoefficientKind[] = ['physics', 'empirical', 'convention'];

const VALID_VERIFY_STATUSES: readonly VerifyStatus[] = [
  'verified-against-oracle',
  'consistent-with-oracle',
  'unverified-community-rule',
];

describe('registry integrity', () => {
  it('has at least 24 entries', () => {
    expect(COEFFICIENTS.length).toBeGreaterThanOrEqual(24);
  });

  it('has unique keys', () => {
    const keys = COEFFICIENTS.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('every entry has non-empty source, uncertainty, valid kind and valid verifyStatus', () => {
    expect(COEFFICIENTS.length).toBeGreaterThan(0);
    for (const c of COEFFICIENTS as readonly Coefficient[]) {
      expect(c.source.trim().length, `source for ${c.key}`).toBeGreaterThan(0);
      expect(c.uncertainty.trim().length, `uncertainty for ${c.key}`).toBeGreaterThan(0);
      expect(VALID_KINDS, `kind for ${c.key}`).toContain(c.kind);
      expect(VALID_VERIFY_STATUSES, `verifyStatus for ${c.key}`).toContain(c.verifyStatus);
      expect(Number.isFinite(c.value), `value for ${c.key}`).toBe(true);
      expect(c.units.trim().length, `units for ${c.key}`).toBeGreaterThan(0);
    }
  });
});

describe('coefficient()', () => {
  it('returns entries by key', () => {
    for (const expected of COEFFICIENTS) {
      expect(coefficient(expected.key)).toBe(expected);
    }
  });

  it('throws RangeError on unknown key', () => {
    expect(() => coefficient('noSuchCoefficient')).toThrow(RangeError);
  });
});

describe('SHELF_CUT_CORRECTIONS', () => {
  it('has exactly 11 tabulated rows', () => {
    expect(SHELF_CUT_CORRECTIONS).toHaveLength(11);
  });

  it('is sorted ascending by cutIn', () => {
    for (let i = 1; i < SHELF_CUT_CORRECTIONS.length; i++) {
      const prev = SHELF_CUT_CORRECTIONS[i - 1]!;
      const cur = SHELF_CUT_CORRECTIONS[i]!;
      expect(cur.cutIn).toBeGreaterThan(prev.cutIn);
    }
  });

  it('is monotone strictly decreasing in correctionPounds as cut increases', () => {
    // More center cut (cutIn decreases) → higher correction required.
    for (let i = 1; i < SHELF_CUT_CORRECTIONS.length; i++) {
      const prev = SHELF_CUT_CORRECTIONS[i - 1]!;
      const cur = SHELF_CUT_CORRECTIONS[i]!;
      expect(cur.correctionPounds).toBeLessThan(prev.correctionPounds);
    }
  });

  it('gives +5 at zero cut and contains the tabulated endpoints', () => {
    const atZero = SHELF_CUT_CORRECTIONS.find((r) => r.cutIn === 0);
    expect(atZero?.correctionPounds).toBe(5);
    const first = SHELF_CUT_CORRECTIONS[0]!;
    const last = SHELF_CUT_CORRECTIONS[SHELF_CUT_CORRECTIONS.length - 1]!;
    expect(first).toEqual({ cutIn: -0.1875, correctionPounds: 18 });
    expect(last).toEqual({
      cutIn: 0.625,
      correctionPounds: -22,
    });
  });
});

describe('STRING_MATERIAL_FACTORS', () => {
  it('FastFlight stiffens relative to B50', () => {
    expect(STRING_MATERIAL_FACTORS.fastflight).toBeGreaterThan(STRING_MATERIAL_FACTORS.b50);
  });

  it('aliases registry values — no duplicated scalars', () => {
    expect(STRING_MATERIAL_FACTORS.b50).toBe(coefficient('stringFactorB50').value);
    expect(STRING_MATERIAL_FACTORS.fastflight).toBe(coefficient('stringFactorFastFlight').value);
    expect(FLETCHING_REFERENCE_WEIGHTS_GR.feathers).toBe(
      coefficient('fletchingWeightFeathersGr').value,
    );
    expect(FLETCHING_REFERENCE_WEIGHTS_GR.vanes).toBe(coefficient('fletchingWeightVanesGr').value);
  });
});

describe('BOW_TYPE_OFFSETS_POUNDS', () => {
  it('self bow is the neutral reference at 0', () => {
    expect(BOW_TYPE_OFFSETS_POUNDS.self).toBe(0);
  });

  it('shelf longbow at +5, centershot recurve at +10', () => {
    expect(BOW_TYPE_OFFSETS_POUNDS.shelfLongbow).toBe(5);
    expect(BOW_TYPE_OFFSETS_POUNDS.centershotRecurve).toBe(10);
  });

  it('performance recurve is at least as stiffening as centershot recurve', () => {
    expect(BOW_TYPE_OFFSETS_POUNDS.performanceRecurve).toBeGreaterThanOrEqual(
      BOW_TYPE_OFFSETS_POUNDS.centershotRecurve,
    );
  });
});

describe('amoAstmDeflectionRatio', () => {
  it('matches the computed rig ratio within ±5e-7 of the published 6-dp value', () => {
    const expected = (2 * 26 ** 3) / (1.94 * 28 ** 3);
    const entry = coefficient('amoAstmDeflectionRatio');
    expect(Math.abs(entry.value - expected)).toBeLessThanOrEqual(5e-7);
  });
});
