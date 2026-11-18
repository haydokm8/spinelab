import { describe, expect, expectTypeOf, it } from 'vitest';
import fc from 'fast-check';
import { inToMm, mmToIn, inchesToMeters, metersToInches } from '../../src/index';

describe('length conversions (exact values)', () => {
  it('1 in = 25.4 mm exactly', () => {
    expect(inToMm(1)).toBe(25.4);
  });

  it('round-trips inches → millimetres → inches (relative 1e-9)', () => {
    const fcInches = fc.double({ min: 1e-3, max: 1e6, noNaN: true });
    fc.assert(
      fc.property(fcInches, (x) => {
        expect(mmToIn(inToMm(x)) / x).toBeCloseTo(1, 9);
      }),
    );
  });

  it('round-trips inches → metres → inches (relative 1e-9)', () => {
    const fcInches = fc.double({ min: 1e-3, max: 1e6, noNaN: true });
    fc.assert(
      fc.property(fcInches, (x) => {
        expect(metersToInches(inchesToMeters(x)) / x).toBeCloseTo(1, 9);
      }),
    );
  });

  it('rejects non-finite input with RangeError', () => {
    expect(() => inToMm(Number.NaN)).toThrow(RangeError);
    expect(() => inToMm(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => mmToIn(Number.NaN)).toThrow(RangeError);
    expect(() => inchesToMeters(Number.NaN)).toThrow(RangeError);
    expect(() => metersToInches(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  it('has exact types', () => {
    expectTypeOf(inToMm).parameter(0).toEqualTypeOf<number>();
    expectTypeOf(inToMm).returns.toEqualTypeOf<number>();
  });
});
