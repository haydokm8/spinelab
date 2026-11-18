/**
 * Mass conversions.
 *
 * Constants are exact: the avoirdupois grain is 0.06479891 g (International
 * Yard & Pound Agreement, 1959: 1 lb = 453.59237 g = 7000 grains exactly).
 */

/** Grams per (avoirdupois) grain — exact. */
export const GRAMS_PER_GRAIN = 0.06479891;

/**
 * Convert grains to grams.
 * @throws RangeError if `grains` is not a finite number.
 */
export function grainsToGrams(grains: number): number {
  assertFinite(grains, 'grains');
  return grains * GRAMS_PER_GRAIN;
}

/**
 * Convert grams to grains.
 * @throws RangeError if `grams` is not a finite number.
 */
export function gramsToGrains(grams: number): number {
  assertFinite(grams, 'grams');
  return grams / GRAMS_PER_GRAIN;
}

/**
 * Convert grams to kilograms.
 * @throws RangeError if `grams` is not a finite number.
 */
export function gramsToKilograms(grams: number): number {
  assertFinite(grams, 'grams');
  return grams / 1000;
}

/**
 * Convert kilograms to grams.
 * @throws RangeError if `kilograms` is not a finite number.
 */
export function kilogramsToGrams(kilograms: number): number {
  assertFinite(kilograms, 'kilograms');
  return kilograms * 1000;
}

/** @internal */
function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number, got ${value}`);
  }
}
