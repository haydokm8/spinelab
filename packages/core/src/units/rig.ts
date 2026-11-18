/**
 * Named measurement rigs for arrow static spine.
 *
 * A "rig" is the (force, span) pair used to measure static deflection of an
 * arrow shaft. The two conventions in common use:
 *
 * - AMO: 2.00 lb at 26 in span (the "AMO standard").
 * - ASTM: 1.94 lb at 28 in span (the F1325-style deflection rig).
 *
 * Beam deflection for a simply supported beam loaded at centre is
 * δ = F·L³/(48·E·I), so for the same shaft the deflection ratio between two
 * rigs is δ_to/δ_from = (F_to·L_to³)/(F_from·L_from³).
 *
 * Provenance:
 * - Stu Miller, Instructions for Dynamic Spine Calculator (11-22-09), p.1,
 *   NOTE A — local PDF at
 *   /home/sage/.hermes/references/spinelab-oracle/stu-miller-instructions.pdf
 *   (NOT redistributed).
 * - Oak Creek Archery, Spine-O-Meter Instructions —
 *   https://oakcreekarchery.com/arrow_translation.pdf (factor 0.825419,
 *   ASTM→AMO).
 */

import { M_PER_IN } from './length.js';

/** AMO rig: 2 lb load applied at 26 in span. */
export const AMO_POUNDS = {
  id: 'amo-pounds',
  label: 'AMO (2 lb @ 26 in)',
  forceLb: 2,
  spanIn: 26,
} as const;

/** ASTM rig: 1.94 lb load applied at 28 in span. */
export const ASTM_DEFLECTION = {
  id: 'astm-deflection',
  label: 'ASTM (1.94 lb @ 28 in)',
  forceLb: 1.94,
  spanIn: 28,
} as const;

export type Rig = typeof AMO_POUNDS | typeof ASTM_DEFLECTION;
export type RigId = Rig['id'];

/**
 * Physical deflection (in metres) of a shaft measured on a named rig.
 * Internal representation: converting between rigs never changes the shaft,
 * only re-expresses the same physical deflection.
 */
export interface DeflectionAtRig {
  readonly rig: Rig;
  readonly meters: number;
}

/**
 * Deflection conversion factor between rigs: multiply a deflection measured
 * on `from` by this to get the deflection on `to`.
 *
 * Derived from δ = F·L³/(48·E·I): factor = (F_to·L_to³)/(F_from·L_from³).
 * For ASTM→AMO this is (2·26³)/(1.94·28³) = 0.825419 (Oak Creek's published
 * 6-dp value).
 */
export function deflectionFactor(from: Rig, to: Rig): number {
  return (to.forceLb * to.spanIn ** 3) / (from.forceLb * from.spanIn ** 3);
}

/**
 * Re-express a deflection measured on one rig as the deflection the same
 * shaft would show on rig `to`. Identity when the rig ids match.
 * @throws RangeError if `d.meters` is not finite or not > 0.
 */
export function convertDeflection(d: DeflectionAtRig, to: Rig): DeflectionAtRig {
  assertPositiveFinite(d.meters, 'deflection meters');
  if (d.rig.id === to.id) {
    return d;
  }
  const meters = d.meters * deflectionFactor(d.rig, to);
  return { rig: to, meters };
}

/**
 * Convert a deflection in metres to inches for presentation.
 * @throws RangeError if `meters` is not finite or not > 0.
 */
export function deflectionMetersToInches(meters: number): number {
  assertPositiveFinite(meters, 'deflection meters');
  return meters / M_PER_IN;
}

/** @internal */
function assertPositiveFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite number > 0, got ${value}`);
  }
}
