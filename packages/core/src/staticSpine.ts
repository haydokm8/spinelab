/**
 * Static spine beam model — Phase 1 T3.
 *
 * Simply supported beam loaded at centre (architecture.md §3):
 *
 *   δ = F·L³ / (48·E·I)
 *
 * Geometry comes in inches (the units every published spine chart, shaft
 * size code and rig spec is written in) and is converted internally to SI
 * using the exact constants from `units/` — no new magic numbers here.
 *
 * E is NOT a material constant: callers must pass a CALIBRATED effective
 * modulus from the coefficient registry, e.g.
 *
 *   import { coefficient } from './coefficients.js';
 *   const modulusPa = coefficient('eEffectiveAluminumGPa').value * 1e9;
 *
 * `eEffectiveAluminumGPa` is the median-E calibration over the Easton
 * published static-deflection table (fixture
 * `test/fixtures/oracle/stu-miller-shaft-table.ts`); `eEffectiveCarbonGPa`
 * is a single-point calibration. Both are effective moduli that absorb
 * published-rating rounding and tube tolerances — see architecture.md §3.
 */

import { M_PER_IN } from './units/length.js';
import { poundsToNewtons } from './units/force.js';
import {
  AMO_POUNDS,
  ASTM_DEFLECTION,
  type DeflectionAtRig,
  type Rig,
  type RigId,
} from './units/rig.js';
import { fromDeflection, type Spine } from './units/spine.js';

/**
 * Second moment of area of an annular tube cross-section, in m⁴.
 *
 * I = π(od⁴ − id⁴)/64 with the diameters converted from inches to metres
 * (architecture.md §3). Both diameters in inches.
 *
 * @throws RangeError if either diameter is not finite and > 0, or if
 *   `idIn` is not strictly less than `odIn`.
 */
export function momentOfInertiaTube(odIn: number, idIn: number): number {
  assertPositiveFinite(odIn, 'tube OD (in)');
  assertPositiveFinite(idIn, 'tube ID (in)');
  if (idIn >= odIn) {
    throw new RangeError(`tube ID must be < OD, got ID ${idIn} vs OD ${odIn}`);
  }
  return ((Math.PI * (odIn ** 4 - idIn ** 4)) / 64) * M_PER_IN ** 4;
}

/**
 * Second moment of area of a solid circular cross-section, in m⁴.
 *
 * I = π·d⁴/64 with the diameter converted from inches to metres
 * (architecture.md §3). NOTE: for wood shafts this is an idealisation —
 * real wood shafts taper along their length, so a single mid-shaft diameter
 * only approximates the true stiffness distribution (architecture.md §3).
 *
 * @throws RangeError if `diameterIn` is not finite and > 0.
 */
export function momentOfInertiaSolid(diameterIn: number): number {
  assertPositiveFinite(diameterIn, 'solid diameter (in)');
  return ((Math.PI * diameterIn ** 4) / 64) * M_PER_IN ** 4;
}

/**
 * Centre-load deflection of a simply supported beam, in metres:
 * δ = F·L³/(48·E·I) (architecture.md §3).
 *
 * Inputs are mixed-unit by design — the rig quantities arrive in imperial
 * (`forceLb` in pounds-force, `spanIn` in inches) while stiffness arrives
 * in SI (`modulusPa` in pascals, `momentInertiaM4` in m⁴). Conversion uses
 * the exact constants from `units/`: lb→N via `poundsToNewtons`,
 * in→m via `M_PER_IN`.
 *
 * @throws RangeError if any argument is not finite and > 0.
 */
export function beamDeflectionMeters(args: {
  forceLb: number;
  spanIn: number;
  modulusPa: number;
  momentInertiaM4: number;
}): number {
  const { forceLb, spanIn, modulusPa, momentInertiaM4 } = args;
  assertPositiveFinite(forceLb, 'force (lb)');
  assertPositiveFinite(spanIn, 'span (in)');
  assertPositiveFinite(modulusPa, 'modulus (Pa)');
  assertPositiveFinite(momentInertiaM4, 'moment of inertia (m^4)');
  const forceN = poundsToNewtons(forceLb);
  const spanM = spanIn * M_PER_IN;
  return (forceN * spanM ** 3) / (48 * modulusPa * momentInertiaM4);
}

/**
 * Static deflection of a shaft measured on a given rig.
 *
 * The shaft is a tube when `idIn` is given (0 < idIn < odIn) and solid
 * otherwise. The measurement rig supplies both the load and the span
 * (`rig.forceLb`, `rig.spanIn`) — e.g. AMO_POUNDS (2 lb @ 26 in) or
 * ASTM_DEFLECTION (1.94 lb @ 28 in).
 *
 * Wood-shaft caveat (architecture.md §3): the solid `I = π·d⁴/64` treats
 * the shaft as a uniform cylinder, but real wood shafts taper, so the
 * result is an idealisation — the calibrated effective modulus for wood
 * would absorb part of that error, not all of it.
 *
 * @throws RangeError on invalid geometry or non-finite/non-positive
 *   modulus (propagated from the beam model).
 */
export function staticDeflection(
  shaft: { modulusPa: number; odIn: number; idIn?: number },
  rig: Rig,
): DeflectionAtRig {
  const momentInertiaM4 =
    shaft.idIn === undefined
      ? momentOfInertiaSolid(shaft.odIn)
      : momentOfInertiaTube(shaft.odIn, shaft.idIn);
  return {
    rig,
    meters: beamDeflectionMeters({
      forceLb: rig.forceLb,
      spanIn: rig.spanIn,
      modulusPa: shaft.modulusPa,
      momentInertiaM4,
    }),
  };
}

/**
 * Static spine of a shaft in the named presentation convention
 * ('amo-pounds' or 'astm-deflection').
 *
 * The physical deflection is computed at that convention's rig and then
 * presented via `fromDeflection` from `units/spine.ts`, so every published
 * number flows through the locked convention code (including the
 * direction-of-0.825 rule).
 *
 * Example — an aluminum 1916 against the calibrated effective modulus:
 *
 *   import { coefficient } from './coefficients.js';
 *   const spine = staticSpineAt(
 *     {
 *       modulusPa: coefficient('eEffectiveAluminumGPa').value * 1e9,
 *       odIn: 19 / 64,
 *       idIn: 19 / 64 - 2 * 0.016,
 *     },
 *     'astm-deflection',
 *   );
 *   // spine.kind === 'astm-spine'; spine.thousandths ≈ published rating
 *
 * @throws RangeError on invalid geometry/modulus (propagated from
 *   `staticDeflection`).
 */
export function staticSpineAt(
  shaft: { modulusPa: number; odIn: number; idIn?: number },
  convention: RigId,
): Spine {
  const rig = convention === 'amo-pounds' ? AMO_POUNDS : ASTM_DEFLECTION;
  return fromDeflection(staticDeflection(shaft, rig), convention);
}

/** @internal */
function assertPositiveFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite number > 0, got ${value}`);
  }
}
