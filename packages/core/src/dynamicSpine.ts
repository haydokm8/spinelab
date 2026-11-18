/**
 * Bow-need vs arrow-supply dynamic spine model (architecture.md §4).
 *
 * The SHAPE of the model mirrors the proven 3Rivers / Stu Miller dynamic
 * spine calculators, but this is OUR OWN implementation — no spreadsheet
 * code is copied or redistributed. Every empirical number comes from the
 * coefficient registry (`./coefficients.js`); the Stu Miller .xls oracle itself is a local test
 * oracle ONLY and is NEVER redistributed (its formulas live in the
 * generator that produced `test/fixtures/oracle/stu-miller-dynamic-spine.ts`,
 * not here).
 *
 * Model shape:
 *
 *   bowNeed     = drawWeightAtYourDraw × stringFactor
 *                 + shelfCorrection + silencerCorrection
 *   arrowSupply = staticSpineAmoPounds / (lengthFactor × weightFactor)
 *                 + footingCorrection
 *   match when |bowNeed − arrowSupply| ≤ matchTolerancePounds (±2#)
 *
 * COUNTERINTUITIVE DIVISION (documented because it looks like a bug at
 * first glance): `weightFactor` grows with point weight but sits in the
 * DENOMINATOR, so a HEAVIER point LOWERS the dynamic pound rating — the
 * arrow is dynamically WEAKER. Heavier nock-end weight does the opposite
 * (stiffens). The division is the calibrated oracle behaviour, locked by
 * the fixture above; do not "fix" it into a multiplication.
 */

import {
  BOW_TYPE_OFFSETS_POUNDS,
  FLETCHING_REFERENCE_WEIGHTS_GR,
  SHELF_CUT_CORRECTIONS,
  STRING_MATERIAL_FACTORS,
  coefficient,
  type BowType,
} from './coefficients.js';
import { convertSpine, type Spine } from './units/spine.js';

/** String material options that change bow need (string table of the oracle). */
export type StringMaterial = 'b50' | 'fastflight';

/** Fletching options that enter the arrow-supply weight factor. */
export type Fletching = 'feathers' | 'vanes';

/**
 * Length sensitivity of the arrow-supply division factor, applied to the
 * RELATIVE length change (Δbop / referenceBopLengthIn): the Rev 6-12-09
 * oracle multiplies the relative length change by 2.8. Bound to the
 * registry entry `lengthFactorSensitivity` (same literal, with full
 * provenance) rather than duplicated here.
 */
const LENGTH_FACTOR_SENSITIVITY = coefficient('lengthFactorSensitivity').value;

/**
 * Point/nock weight sensitivity of the arrow-supply division factor,
 * applied to the RELATIVE weight change (Δgr / 125 gr): the oracle's raw
 * literal is 0.4. Bound to the registry entry `weightFactorSensitivity`
 * (same literal, with full provenance).
 */
const WEIGHT_FACTOR_SENSITIVITY = coefficient('weightFactorSensitivity').value;

/** Inputs for the full bow-need path (measured shelf cut, no bow-type guess). */
export interface BowNeedInput {
  /** Factory draw weight rating, e.g. 50 for a "50#@28" bow. */
  readonly ratedWeightLb: number;
  /** Factory draw-length rating, e.g. 28 for a "50#@28" bow. */
  readonly ratedDrawIn: number;
  /** The archer's actual draw length in inches. */
  readonly yourDrawIn: number;
  /**
   * Shelf / strike-plate cut position in inches, Stu Miller convention:
   * POSITIVE = strike plate outside the string centerline (LESS than
   * center cut); negative = cut past center. More center cut → stiffer
   * arrow required.
   */
  readonly shelfCutIn: number;
  /** Bowstring material. */
  readonly stringMaterial: StringMaterial;
  /** Multiple or extra-heavy string silencers (instructions Quick Tip 3: −2#). */
  readonly heavyStringSilencers?: boolean;
}

/** Itemised contributions behind a {@link bowNeed} result. */
export interface BowNeedTerms {
  /** Draw weight at the archer's draw length, before string material. */
  readonly drawWeightAtYourDrawPounds: number;
  /** Multiplier applied for the string material (B50 1.0, FastFlight 1.05). */
  readonly stringFactor: number;
  /** Additive shelf-cut correction (interpolated between dropdown steps). */
  readonly shelfCorrectionPounds: number;
  /** Additive heavy-silencer correction (0 when absent). */
  readonly silencerCorrectionPounds: number;
}

/**
 * Draw weight at the archer's draw length.
 *
 * Calibrated to the oracle: rated + (your − rated)·(base + log10(rated /
 * (100 − rated))·scale). The log term vanishes at rated = 50#, so light
 * and heavy bows scale their per-inch sensitivity differently — that
 * asymmetry is the spreadsheet's published behaviour, locked by the
 * oracle fixture.
 *
 * @throws RangeError unless 0 < ratedWeightLb < 100 (the log-scale term
 *   diverges at the endpoints), or ratedDrawIn / yourDrawIn is not finite
 *   and > 0.
 */
export function drawWeightAtYourDraw(args: {
  readonly ratedWeightLb: number;
  readonly ratedDrawIn: number;
  readonly yourDrawIn: number;
}): number {
  const { ratedWeightLb, ratedDrawIn, yourDrawIn } = args;
  assertFinite(ratedWeightLb, 'ratedWeightLb');
  assertFinite(ratedDrawIn, 'ratedDrawIn');
  assertFinite(yourDrawIn, 'yourDrawIn');
  if (ratedWeightLb <= 0 || ratedWeightLb >= 100) {
    throw new RangeError(
      `ratedWeightLb must be > 0 and < 100 (the log-scale draw-length term diverges at the endpoints), got ${ratedWeightLb}`,
    );
  }
  if (ratedDrawIn <= 0) {
    throw new RangeError(`ratedDrawIn must be a finite number > 0, got ${ratedDrawIn}`);
  }
  if (yourDrawIn <= 0) {
    throw new RangeError(`yourDrawIn must be a finite number > 0, got ${yourDrawIn}`);
  }
  const base = coefficient('drawLengthSensitivityBasePoundsPerInch').value;
  const scale = coefficient('drawLengthLogScalePoundsPerDecade').value;
  return (
    ratedWeightLb +
    (yourDrawIn - ratedDrawIn) * (base + Math.log10(ratedWeightLb / (100 - ratedWeightLb)) * scale)
  );
}

/**
 * Additive bow-need correction for the shelf cut, in pounds.
 *
 * Exact at the 11 tabulated dropdown steps of the oracle; between steps we
 * interpolate LINEARLY. The interpolation is OUR extension, not oracle
 * behaviour — the spreadsheet only offers discrete dropdown steps, and we
 * interpolate so the UI can accept a measured strike-plate position.
 *
 * `shelfCutIn` uses Stu Miller's sign convention: positive = strike plate
 * OUTSIDE the string centerline (less than center cut).
 *
 * @throws RangeError if `shelfCutIn` is not finite or lies outside
 *   [SHELF_CUT_CORRECTIONS[0].cutIn, SHELF_CUT_CORRECTIONS.at(-1).cutIn].
 */
export function shelfCorrectionPounds(shelfCutIn: number): number {
  assertFinite(shelfCutIn, 'shelfCutIn');
  const first = SHELF_CUT_CORRECTIONS[0];
  const last = SHELF_CUT_CORRECTIONS[SHELF_CUT_CORRECTIONS.length - 1];
  if (first === undefined || last === undefined) {
    throw new RangeError('SHELF_CUT_CORRECTIONS table is empty');
  }
  if (shelfCutIn < first.cutIn || shelfCutIn > last.cutIn) {
    throw new RangeError(
      `shelfCutIn must be within [${first.cutIn}, ${last.cutIn}] (the oracle table only covers that range), got ${shelfCutIn}`,
    );
  }
  for (let i = 0; i < SHELF_CUT_CORRECTIONS.length - 1; i++) {
    const a = SHELF_CUT_CORRECTIONS[i];
    const b = SHELF_CUT_CORRECTIONS[i + 1];
    if (a === undefined || b === undefined || shelfCutIn > b.cutIn) {
      continue;
    }
    const t = (shelfCutIn - a.cutIn) / (b.cutIn - a.cutIn);
    return a.correctionPounds + t * (b.correctionPounds - a.correctionPounds);
  }
  return last.correctionPounds;
}

/**
 * Full bow-need path: what the bow demands of the arrow, in dynamic
 * pounds, from a rated weight/draw pair, the archer's draw, the measured
 * shelf cut and the string material.
 *
 * Do NOT combine this with {@link bowNeedQuick} — that path approximates
 * the shelf cut per bow type, this one measures it.
 *
 * @throws RangeError on non-physical inputs (see
 *   {@link drawWeightAtYourDraw} and {@link shelfCorrectionPounds}) or an
 *   unknown `stringMaterial` (runtime guard for JS callers).
 */
export function bowNeed(input: BowNeedInput): {
  readonly pounds: number;
  readonly terms: BowNeedTerms;
} {
  const draw = drawWeightAtYourDraw(input);
  const stringFactor = STRING_MATERIAL_FACTORS[input.stringMaterial];
  if (stringFactor === undefined) {
    throw new RangeError(`unknown stringMaterial: ${String(input.stringMaterial)}`);
  }
  const shelf = shelfCorrectionPounds(input.shelfCutIn);
  const silencer =
    input.heavyStringSilencers === true ? coefficient('heavySilencerBowNeedPounds').value : 0;
  return {
    pounds: draw * stringFactor + shelf + silencer,
    terms: {
      drawWeightAtYourDrawPounds: draw,
      stringFactor,
      shelfCorrectionPounds: shelf,
      silencerCorrectionPounds: silencer,
    },
  };
}

/** Inputs for the community-rule quick bow-need path. */
export interface BowNeedQuickInput {
  /** The bow's draw weight at the archer's draw, in pounds. */
  readonly drawWeightLb: number;
  /** Coarse bow-type class for the community offset rule. */
  readonly bowType: BowType;
}

/**
 * QUICK bow-need path: drawWeightLb + bow-type offset.
 *
 * WARNING — community-rule coarse path (architecture.md §4 VERIFY): the
 * Stu Miller oracle has NO bow-type term; these offsets approximate the
 * TYPICAL shelf position per bow type. They must NOT be combined with a
 * separately-entered shelf cut — that double-counts the shelf effect. Use
 * {@link bowNeed} whenever an actual shelf/strike-plate measurement is
 * available.
 *
 * @throws RangeError if `drawWeightLb` is not finite and > 0, or
 *   `bowType` is unknown (runtime guard for JS callers).
 */
export function bowNeedQuick(input: BowNeedQuickInput): {
  readonly pounds: number;
  readonly offsetPounds: number;
} {
  assertPositiveFinite(input.drawWeightLb, 'drawWeightLb');
  const offsetPounds = BOW_TYPE_OFFSETS_POUNDS[input.bowType];
  if (offsetPounds === undefined) {
    throw new RangeError(`unknown bowType: ${String(input.bowType)}`);
  }
  return { pounds: input.drawWeightLb + offsetPounds, offsetPounds };
}

/** Inputs for the arrow-supply path (what the arrow delivers, dynamic pounds). */
export interface ArrowSupplyInput {
  /** Measured or chart-looked-up static spine, AMO or ASTM convention. */
  readonly staticSpine: Spine;
  /** Distance from the bottom of the nock groove to the back of the point, inches. */
  readonly bopLengthIn: number;
  /** Total front-end weight (point + insert/outsert), grains. */
  readonly pointWeightGr: number;
  /** Total rear-of-nock-end weight (nock + pin + wrap), grains. */
  readonly nockEndWeightGr: number;
  /** Fletching kind entering the weight factor. */
  readonly fletching: Fletching;
  /** Footed or tapered shaft (instructions Quick Tip 1: −2# dynamic). */
  readonly footedOrTapered?: boolean;
  /** Wood shaft (the oracle treats wood as ~0.9" longer than measured). */
  readonly woodShaft?: boolean;
}

/** Itemised contributions behind an {@link arrowSupply} result. */
export interface ArrowSupplyTerms {
  /** Static spine re-expressed in AMO pounds (2 lb @ 26 in). */
  readonly staticSpineAmoPounds: number;
  /** Length division factor (longer → larger → weaker). */
  readonly lengthFactor: number;
  /** Weight division factor (heavier point → larger → weaker). */
  readonly weightFactor: number;
  /** Additive footing/taper correction (0 when not footed/tapered). */
  readonly footingCorrectionPounds: number;
}

/**
 * Arrow-supply path: the arrow's dynamic spine, in pounds, from its
 * measured static spine and build.
 *
 * The length and weight factors DIVIDE the static AMO pound rating (see
 * the module doc for why heavier points come out dynamically weaker).
 * The length factor treats wood shafts as ~0.9" longer than measured,
 * replicating the oracle's sign convention exactly:
 *
 *   Δ = bop − refBop − (woodShaft ? −woodLengthOffsetIn : 0)
 *
 * @throws RangeError on non-physical inputs: static spine not a valid
 *   `Spine` value or non-positive, `bopLengthIn` / `pointWeightGr` not
 *   finite and > 0, `nockEndWeightGr` negative or non-finite, unknown
 *   `fletching` (runtime guard for JS callers), or a length/weight
 *   factor pushed non-positive by extreme inputs.
 */
export function arrowSupply(input: ArrowSupplyInput): {
  readonly pounds: number;
  readonly terms: ArrowSupplyTerms;
} {
  const staticSpineAmoPounds = staticSpineToAmoPounds(input.staticSpine);
  assertPositiveFinite(input.bopLengthIn, 'bopLengthIn');
  assertPositiveFinite(input.pointWeightGr, 'pointWeightGr');
  assertNonNegativeFinite(input.nockEndWeightGr, 'nockEndWeightGr');
  const fletchWeight = FLETCHING_REFERENCE_WEIGHTS_GR[input.fletching];
  if (fletchWeight === undefined) {
    throw new RangeError(`unknown fletching: ${String(input.fletching)}`);
  }

  const refBop = coefficient('referenceBopLengthIn').value;
  const refPoint = coefficient('referencePointWeightGr').value;
  const nockBaseline = coefficient('nockBaselineOffsetGr').value;
  // Sign note: the oracle SUBTRACTS a negative offset for wood shafts, so
  // a wood shaft is treated as woodLengthOffsetIn LONGER than measured.
  const woodTerm = input.woodShaft === true ? -coefficient('woodLengthOffsetIn').value : 0;

  const lengthFactor =
    1 + ((input.bopLengthIn - refBop - woodTerm) / refBop) * LENGTH_FACTOR_SENSITIVITY;
  const weightFactor =
    1 +
    ((input.pointWeightGr - refPoint - fletchWeight + nockBaseline - input.nockEndWeightGr) /
      refPoint) *
      WEIGHT_FACTOR_SENSITIVITY;
  if (!(lengthFactor > 0) || !(weightFactor > 0)) {
    throw new RangeError(
      `inputs push a division factor non-positive (lengthFactor ${lengthFactor}, weightFactor ${weightFactor})`,
    );
  }

  const footing =
    input.footedOrTapered === true ? coefficient('footingTaperDynamicPounds').value : 0;
  return {
    pounds: staticSpineAmoPounds / (lengthFactor * weightFactor) + footing,
    terms: {
      staticSpineAmoPounds,
      lengthFactor,
      weightFactor,
      footingCorrectionPounds: footing,
    },
  };
}

/** Verdict of comparing arrow supply against bow need. */
export type MatchVerdict = 'weak' | 'match' | 'stiff';

/**
 * Compare the arrow's dynamic pounds against the bow's requirement.
 *
 * `supply > need + tol` → 'stiff' (the arrow is stiffer — a higher pound
 * rating — than needed); `supply < need − tol` → 'weak'; else 'match'.
 * The ±2# tolerance is the proven 3Rivers/Stu Miller UX convention
 * (`matchTolerancePounds`).
 */
export function matchVerdict(bowNeedPounds: number, arrowSupplyPounds: number): MatchVerdict {
  const tol = coefficient('matchTolerancePounds').value;
  if (arrowSupplyPounds > bowNeedPounds + tol) {
    return 'stiff';
  }
  if (arrowSupplyPounds < bowNeedPounds - tol) {
    return 'weak';
  }
  return 'match';
}

/** Re-express any `Spine` value as AMO pounds, validating on the way. */
function staticSpineToAmoPounds(s: Spine): number {
  if (s.kind === 'amo-spine') {
    assertPositiveFinite(s.pounds, 'staticSpine.pounds');
    return s.pounds;
  }
  if (s.kind === 'astm-spine') {
    return convertSpine(s, 'amo-pounds').pounds;
  }
  throw new RangeError(
    `staticSpine must be an AmoSpine or AstmSpine value, got kind ${String((s as { kind?: unknown }).kind)}`,
  );
}

/** @internal */
function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number, got ${value}`);
  }
}

/** @internal */
function assertPositiveFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite number > 0, got ${value}`);
  }
}

/** @internal */
function assertNonNegativeFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite number >= 0, got ${value}`);
  }
}
