/**
 * Force conversions.
 *
 * N_PER_LBF is exact: 1 lbm = 0.45359237 kg (exact, International Yard & Pound
 * Agreement, 1959) times standard gravity g = 9.80665 m/s² (exact, 3rd CGPM
 * 1901) gives 1 lbf = 4.4482216152605 N exactly.
 */

/** Newtons per pound-force — exact (0.45359237 kg × 9.80665 m/s²). */
export const N_PER_LBF = 4.4482216152605;

/**
 * Convert pounds-force to newtons.
 * @throws RangeError if `pounds` is not a finite number.
 */
export function poundsToNewtons(pounds: number): number {
  assertFinite(pounds, 'pounds');
  return pounds * N_PER_LBF;
}

/**
 * Convert newtons to pounds-force.
 * @throws RangeError if `newtons` is not a finite number.
 */
export function newtonsToPounds(newtons: number): number {
  assertFinite(newtons, 'newtons');
  return newtons / N_PER_LBF;
}

/** @internal */
function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number, got ${value}`);
  }
}
