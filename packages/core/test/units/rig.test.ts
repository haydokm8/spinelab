import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  AMO_POUNDS,
  ASTM_DEFLECTION,
  convertDeflection,
  deflectionFactor,
  type DeflectionAtRig,
} from '../../src/index';
import { expectedFactor, toleranceFactor } from '../fixtures/oracle/stu-miller-conventions';

describe('deflectionFactor', () => {
  it("ASTM → AMO equals Oak Creek's published 0.825419", () => {
    const observed = deflectionFactor(ASTM_DEFLECTION, AMO_POUNDS);
    expect(Math.abs(observed - expectedFactor)).toBeLessThan(toleranceFactor);
    // Pin the observed value so drift is visible in the failure message.
    expect(observed).toBeGreaterThan(0.8254185);
    expect(observed).toBeLessThan(0.8254195);
  });

  it('is the exact beam ratio (F_to·L_to³)/(F_from·L_from³)', () => {
    expect(deflectionFactor(ASTM_DEFLECTION, AMO_POUNDS)).toBeCloseTo(
      (2 * 26 ** 3) / (1.94 * 28 ** 3),
      12,
    );
  });

  it('inverse direction ≈ 1/0.825419 = 1.2115066', () => {
    expect(deflectionFactor(AMO_POUNDS, ASTM_DEFLECTION)).toBeCloseTo(1 / expectedFactor, 5);
  });
});

describe('convertDeflection', () => {
  it('is identity when the rig is unchanged', () => {
    const d: DeflectionAtRig = { rig: AMO_POUNDS, meters: 0.01 };
    expect(convertDeflection(d, AMO_POUNDS)).toBe(d);
  });

  it('round-trips across rigs (relative 1e-9)', () => {
    const fcMeters = fc.double({ min: 1e-6, max: 1, noNaN: true });
    fc.assert(
      fc.property(fcMeters, (m) => {
        const d: DeflectionAtRig = { rig: ASTM_DEFLECTION, meters: m };
        const back = convertDeflection(convertDeflection(d, AMO_POUNDS), ASTM_DEFLECTION);
        expect(back.meters / m).toBeCloseTo(1, 9);
      }),
    );
  });

  it('preserves ordering: bigger deflection stays bigger', () => {
    const fcPair = fc.tuple(
      fc.double({ min: 1e-6, max: 1, noNaN: true }),
      fc.double({ min: 1e-6, max: 1, noNaN: true }),
    );
    fc.assert(
      fc.property(fcPair, ([a, b]) => {
        const da: DeflectionAtRig = { rig: ASTM_DEFLECTION, meters: a };
        const db: DeflectionAtRig = { rig: ASTM_DEFLECTION, meters: b };
        const ca = convertDeflection(da, AMO_POUNDS).meters;
        const cb = convertDeflection(db, AMO_POUNDS).meters;
        expect(Math.sign(ca - cb)).toBe(Math.sign(a - b));
      }),
    );
  });

  it('rejects non-finite or non-positive deflection', () => {
    const rig = AMO_POUNDS;
    expect(() => convertDeflection({ rig, meters: Number.NaN }, ASTM_DEFLECTION)).toThrow(
      RangeError,
    );
    expect(() => convertDeflection({ rig, meters: 0 }, ASTM_DEFLECTION)).toThrow(RangeError);
    expect(() => convertDeflection({ rig, meters: -0.01 }, ASTM_DEFLECTION)).toThrow(RangeError);
  });
});
