import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { poundsToNewtons, newtonsToPounds } from '../../src/index';

describe('force conversions (exact values)', () => {
  it('1 lbf = 4.4482216152605 N exactly', () => {
    expect(poundsToNewtons(1)).toBe(4.4482216152605);
  });

  it('round-trips pounds → newtons → pounds', () => {
    const fcPounds = fc.double({ min: 1e-3, max: 1e6, noNaN: true });
    fc.assert(
      fc.property(fcPounds, (x) => {
        expect(newtonsToPounds(poundsToNewtons(x)) / x).toBeCloseTo(1, 9);
      }),
    );
  });
});
