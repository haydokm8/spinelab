/**
 * Length conversions.
 *
 * All constants here are exact by international agreement (International Yard
 * and Pound Agreement, 1959): 1 inch = 25.4 mm exactly.
 */

/** Millimetres per inch — exact (International Yard & Pound Agreement, 1959). */
export const MM_PER_IN = 25.4;

/** Metres per inch — exact (International Yard & Pound Agreement, 1959). */
export const M_PER_IN = 0.0254;

/**
 * Convert inches to millimetres (1 in = 25.4 mm, exact by definition).
 * @throws RangeError if `inches` is not a finite number.
 */
export function inToMm(inches: number): number {
  assertFinite(inches, 'inches');
  return inches * MM_PER_IN;
}

/**
 * Convert millimetres to inches.
 * @throws RangeError if `mm` is not a finite number.
 */
export function mmToIn(mm: number): number {
  assertFinite(mm, 'mm');
  return mm / MM_PER_IN;
}

/**
 * Convert inches to metres (1 in = 0.0254 m, exact).
 * @throws RangeError if `inches` is not a finite number.
 */
export function inchesToMeters(inches: number): number {
  assertFinite(inches, 'inches');
  return inches * M_PER_IN;
}

/**
 * Convert metres to inches.
 * @throws RangeError if `meters` is not a finite number.
 */
export function metersToInches(meters: number): number {
  assertFinite(meters, 'meters');
  return meters / M_PER_IN;
}

/** @internal */
function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number, got ${value}`);
  }
}
