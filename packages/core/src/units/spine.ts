/**
 * Spine values and AMO/ASTM convention conversion.
 *
 * Two presentation conventions exist for the same physical measurement:
 *
 * - AMO spine: a pound rating P = 26 / δ_AMO(inches) — the "26" is the AMO
 *   span (Oak Creek Archery, Spine-O-Meter Instructions,
 *   https://oakcreekarchery.com/arrow_translation.pdf).
 * - ASTM spine: deflection in thousandths of an inch at the ASTM rig
 *   (1.94 lb @ 28 in), i.e. thousandths = δ_ASTM(in) × 1000.
 *
 * DIRECTION-OF-0.825 RULE (locked by the oracle fixture
 * test/fixtures/oracle/stu-miller-conventions.ts):
 *
 *   Deflection thousandths convert between rigs by MULTIPLYING by 0.825419
 *   (ASTM→AMO). The "divide by 0.825" in Stu Miller's instructions applies
 *   only in the POUND pipeline: P_AMO = (26/δ_ASTM) / 0.825419. Both routes
 *   give 63.0# for a carbon "500". Do NOT implement thousandths→AMO as a
 *   division.
 *
 *   Verbatim from Stu Miller, Instructions for Dynamic Spine Calculator
 *   (11-22-09), p.1, NOTE A (local PDF at
 *   /home/sage/.hermes/references/spinelab-oracle/stu-miller-instructions.pdf,
 *   NOT redistributed): "Convert ATSM spine to AMO spine by dividing by
 *   0.825." — that instruction is about the pound numbers, not the raw
 *   deflection reading.
 */

import {
  AMO_POUNDS,
  ASTM_DEFLECTION,
  convertDeflection,
  deflectionMetersToInches,
  type DeflectionAtRig,
  type RigId,
} from './rig.js';
import { M_PER_IN } from './length.js';

/** Spine expressed in the AMO pound convention (2 lb @ 26 in). */
export interface AmoSpine {
  readonly kind: 'amo-spine';
  readonly rig: typeof AMO_POUNDS;
  readonly pounds: number;
}

/** Spine expressed in the ASTM deflection convention (1.94 lb @ 28 in), in thousandths of an inch. */
export interface AstmSpine {
  readonly kind: 'astm-spine';
  readonly rig: typeof ASTM_DEFLECTION;
  readonly thousandths: number;
}

export type Spine = AmoSpine | AstmSpine;

/**
 * Build an AMO spine value.
 * @throws RangeError if `pounds` is not finite or not > 0.
 */
export function amoSpine(pounds: number): AmoSpine {
  assertPositiveFinite(pounds, 'pounds');
  return { kind: 'amo-spine', rig: AMO_POUNDS, pounds };
}

/**
 * Build an ASTM deflection spine value (thousandths of an inch at the ASTM rig).
 * @throws RangeError if `thousandths` is not finite or not > 0.
 */
export function astmSpine(thousandths: number): AstmSpine {
  assertPositiveFinite(thousandths, 'thousandths');
  return { kind: 'astm-spine', rig: ASTM_DEFLECTION, thousandths };
}

/**
 * The physical deflection this spine value corresponds to, at the rig named
 * by the value itself:
 * - AmoSpine → δ_AMO in metres = (AMO_POUNDS.spanIn / pounds) × M_PER_IN
 *   (P = 26/δ(in), Oak Creek).
 * - AstmSpine → δ_ASTM in metres = (thousandths / 1000) × M_PER_IN.
 */
export function toDeflection(s: Spine): DeflectionAtRig {
  if (s.kind === 'amo-spine') {
    const inches = AMO_POUNDS.spanIn / s.pounds;
    return { rig: AMO_POUNDS, meters: inches * M_PER_IN };
  }
  const inches = s.thousandths / 1000;
  return { rig: ASTM_DEFLECTION, meters: inches * M_PER_IN };
}

/**
 * Re-express a deflection as a spine value in the given convention. The
 * deflection is first converted to the target rig via convertDeflection
 * (deflections MULTIPLY by 0.825419 ASTM→AMO), then presented:
 * - 'amo-pounds' → pounds = AMO_POUNDS.spanIn / δ_in
 * - 'astm-deflection' → thousandths = δ_in × 1000
 */
export function fromDeflection(d: DeflectionAtRig, convention: RigId): Spine {
  const atRig = convertDeflection(d, convention === 'amo-pounds' ? AMO_POUNDS : ASTM_DEFLECTION);
  const inches = deflectionMetersToInches(atRig.meters);
  if (atRig.rig.id === 'amo-pounds') {
    return amoSpine(AMO_POUNDS.spanIn / inches);
  }
  return astmSpine(inches * 1000);
}

export function convertSpine(s: AstmSpine, to: 'amo-pounds'): AmoSpine;
export function convertSpine(s: AmoSpine, to: 'astm-deflection'): AstmSpine;
export function convertSpine(s: Spine, to: RigId): Spine;
/**
 * Convert a spine value between conventions. Equivalent to
 * fromDeflection(toDeflection(s), to).
 */
export function convertSpine(s: Spine, to: RigId): Spine {
  return fromDeflection(toDeflection(s), to);
}

/** @internal */
function assertPositiveFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite number > 0, got ${value}`);
  }
}
