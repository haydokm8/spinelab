import { describe, expect, it } from 'vitest';
import { inToMm } from '../src/index';

describe('inToMm', () => {
  it('converts inches to millimetres', () => {
    expect(inToMm(1)).toBeCloseTo(25.4);
    expect(inToMm(0.5)).toBeCloseTo(12.7);
    expect(inToMm(0)).toBe(0);
  });

  it('is the identity in reverse direction', () => {
    expect(inToMm(2) / 25.4).toBeCloseTo(2);
  });
});
