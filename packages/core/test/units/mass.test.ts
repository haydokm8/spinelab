import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { grainsToGrams, gramsToGrains } from '../../src/index';

describe('mass conversions (exact values)', () => {
  it('7000 grains = 453.59237 g exactly', () => {
    expect(grainsToGrams(7000)).toBe(453.59237);
  });

  it('1 grain = 0.06479891 g exactly', () => {
    expect(grainsToGrams(1)).toBe(0.06479891);
  });

  it('round-trips grains → grams → grains', () => {
    const fcGrains = fc.double({ min: 1e-3, max: 1e6, noNaN: true });
    fc.assert(
      fc.property(fcGrains, (x) => {
        expect(gramsToGrains(grainsToGrams(x)) / x).toBeCloseTo(1, 9);
      }),
    );
  });
});
