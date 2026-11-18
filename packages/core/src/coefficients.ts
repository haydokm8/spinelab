/**
 * Coefficient registry — single source of truth for every empirical
 * coefficient in the spine model.
 *
 * Anti-goal: hidden magic numbers. Later modules must import their constants
 * from this registry rather than embedding numeric literals; the UI working
 * panel also renders from this registry so users can see the provenance,
 * uncertainty and verification status of every number the model uses.
 *
 * The oracle files are local test oracles ONLY and are NEVER redistributed;
 * only transcribed and re-verified values appear here. Full citations:
 * - Stu Miller, Dynamic Spine Calculator Rev 6-12-09 (local .xls read as a
 *   test oracle only; NOT redistributed; formulas transcribed and re-verified
 *   against the spreadsheet's two cached result states)
 * - Stu Miller, Instructions for the Dynamic Spine Calculator (11-22-09),
 *   local PDF, NOT redistributed
 *
 * Verify status story:
 * - 'verified-against-oracle' — the value was locked by a test against the
 *   local Stu Miller spreadsheet oracle (see test/fixtures/oracle/).
 * - 'consistent-with-oracle' — transcribed from the source and spot-checked
 *   against the oracle, but not pinned by a dedicated fixture test.
 * - 'unverified-community-rule' — no authoritative source; flagged in
 *   architecture.md §4 for later empirical verification.
 */

/** Classification of a registry coefficient. */
export type CoefficientKind = 'physics' | 'empirical' | 'convention';

/** How well the value has been verified. */
export type VerifyStatus =
  'verified-against-oracle' | 'consistent-with-oracle' | 'unverified-community-rule';

/** One registry entry: a value plus its full provenance. */
export interface Coefficient {
  /** Stable lookup key, e.g. 'stringFactorB50'. */
  readonly key: string;
  /** Human-readable label for UI display. */
  readonly label: string;
  /** The coefficient value. */
  readonly value: number;
  /** Units string, or 'dimensionless'. */
  readonly units: string;
  /** Classification of the value. */
  readonly kind: CoefficientKind;
  /** Full citation of where the value came from. */
  readonly source: string;
  /** Human-readable uncertainty range. */
  readonly uncertainty: string;
  /** Verification status against the oracle. */
  readonly verifyStatus: VerifyStatus;
  /** Optional extra interpretation notes. */
  readonly notes?: string;
}

/**
 * Community bow-type chart rule source. Direction verified against 3Rivers
 * published charts; magnitude unverified (architecture.md §4 VERIFY flag).
 */
const COMMUNITY_SOURCE =
  'community chart rules; architecture.md §4 VERIFY flag. Direction verified: 3Rivers charts publish separate RECURVE/CENTER SHOT LONGBOW vs LONGBOW/SELF BOW columns with the longbow/self column recommending weaker arrows at equal bow weight (chart bow-weight bands are 5# wide)';

/**
 * The registry. Order follows the module design doc; keys are unique.
 */
export const COEFFICIENTS: readonly Coefficient[] = [
  {
    key: 'amoAstmDeflectionRatio',
    label: 'ASTM→AMO deflection rig ratio',
    value: (2 * 26 ** 3) / (1.94 * 28 ** 3),
    units: 'dimensionless',
    kind: 'physics',
    source:
      'δ = F·L³/(48·E·I) rig ratio (2·26³)/(1.94·28³); Oak Creek Archery Spine-O-Meter, https://oakcreekarchery.com/arrow_translation.pdf (published 6-dp value 0.825419)',
    uncertainty: '±5e-7 of published 6-dp value',
    verifyStatus: 'verified-against-oracle',
    notes:
      'Deflections multiply by this ASTM→AMO; the pound pipeline divides. Locked by test/fixtures/oracle/stu-miller-conventions.ts (T2).',
  },
  {
    key: 'referenceBopLengthIn',
    label: 'Reference BOP arrow length',
    value: 29,
    units: 'inches',
    kind: 'convention',
    source: 'spreadsheet formula (length factor reference)',
    uncertainty: 'exact by definition of the reference',
    verifyStatus: 'consistent-with-oracle',
  },
  {
    key: 'lengthFactorSensitivity',
    label: 'Length factor sensitivity of dynamic spine',
    value: 2.8,
    units: 'multiplier on relative BOP-length change (× ΔL/L_ref, L_ref = 29 in)',
    kind: 'empirical',
    source: 'spreadsheet arrow dynamic spine formula',
    uncertainty: 'no independent second source; identical in Rev 1 and Rev 6-12-09',
    verifyStatus: 'consistent-with-oracle',
    notes:
      'equivalently 2.8/29 ≈ 9.66% dynamic-spine change per inch of BOP length — consistent with the ~5#/in community rule near 50#; longer = dynamically weaker',
  },
  {
    key: 'referencePointWeightGr',
    label: 'Reference point weight',
    value: 125,
    units: 'grains',
    kind: 'convention',
    source: 'spreadsheet formula (weight factor reference)',
    uncertainty: 'exact by definition',
    verifyStatus: 'consistent-with-oracle',
  },
  {
    key: 'weightFactorSensitivity',
    label: 'Point weight factor sensitivity of dynamic spine',
    value: 0.4,
    units: 'multiplier on relative front-mass change (× ΔW/W_ref, W_ref = 125 gr)',
    kind: 'empirical',
    source: 'spreadsheet',
    uncertainty: 'no independent second source',
    verifyStatus: 'consistent-with-oracle',
    notes:
      'equivalently 0.4/125 = 0.32% per grain — consistent with the −5# per +25–40 gr community rule near 50#; heavier point = dynamically weaker',
  },
  {
    key: 'fletchingWeightFeathersGr',
    label: 'Feather fletching reference weight',
    value: 9.6,
    units: 'grains',
    kind: 'empirical',
    source: 'spreadsheet fletching table',
    uncertainty: 'representative Trueflight feather set',
    verifyStatus: 'consistent-with-oracle',
  },
  {
    key: 'fletchingWeightVanesGr',
    label: 'Vane fletching reference weight',
    value: 32,
    units: 'grains',
    kind: 'empirical',
    source: "spreadsheet + instructions p.2 ('a total of 32 grains for three generic 4\" vanes')",
    uncertainty: 'representative generic vanes',
    verifyStatus: 'consistent-with-oracle',
  },
  {
    key: 'nockBaselineOffsetGr',
    label: 'Nock baseline offset in weight factor',
    value: 10,
    units: 'grains',
    kind: 'empirical',
    source: 'spreadsheet (+10 constant in the weight factor)',
    uncertainty: 'fudge balancing the feather baseline; interpretation ours',
    verifyStatus: 'consistent-with-oracle',
    notes:
      'makes the feather-fletched 125-gr-point reference neutral; heavier nock ends act to STIFFEN the dynamic spine',
  },
  {
    key: 'woodLengthOffsetIn',
    label: 'Wood shaft length offset',
    value: 0.9,
    units: 'inches',
    kind: 'empirical',
    source: 'spreadsheet Rev 6-12-09 formula (IF(B4="Wood Shaft",-0.9,0))',
    uncertainty: 'absent in Rev 1, added by Rev 6-12-09; magnitude uncorroborated',
    verifyStatus: 'consistent-with-oracle',
    notes: 'wood shafts are treated as 0.9" longer for dynamic response (weaker)',
  },
  {
    key: 'drawLengthSensitivityBasePoundsPerInch',
    label: 'Base draw-length sensitivity of bow need',
    value: 3,
    units: 'lb/in',
    kind: 'empirical',
    source:
      "spreadsheet bow-required formula; 3Rivers ArrowCharts.pdf (https://www.3riversarchery.com/pdf/ArrowCharts.pdf) says 'roughly 2-3# different for every inch'",
    uncertainty: '±1 #/in',
    verifyStatus: 'consistent-with-oracle',
  },
  {
    key: 'drawLengthLogScalePoundsPerDecade',
    label: 'Log-scale draw-length sensitivity of bow need',
    value: 3,
    units: 'lb/in per decade of ratedW/(100−ratedW)',
    kind: 'empirical',
    source: 'spreadsheet formula (3+LOG(K4/(100−K4))*3)',
    uncertainty: 'at ratedW=50 the log term vanishes; ±1 #/in',
    verifyStatus: 'consistent-with-oracle',
    notes: 'Excel LOG = log10',
  },
  {
    key: 'stringFactorB50',
    label: 'String material factor: B50',
    value: 1.0,
    units: 'dimensionless',
    kind: 'empirical',
    source: 'spreadsheet string table (B50 1.00)',
    uncertainty: 'exact in source',
    verifyStatus: 'verified-against-oracle',
  },
  {
    key: 'stringFactorFastFlight',
    label: 'String material factor: FastFlight',
    value: 1.05,
    units: 'dimensionless',
    kind: 'empirical',
    source:
      "spreadsheet string table (FastFlight 1.05); corroborated qualitatively by 3Rivers chart note 'Spine Charts: +5 for Fast Flight® bow strings' (same PDF)",
    uncertainty: '±0.02 (5% vs 3Rivers +5# flat rule diverge at extreme draw weights)',
    verifyStatus: 'consistent-with-oracle',
  },
  {
    key: 'shelfCutCorrections',
    label: 'Shelf cut correction table (tabulated)',
    value: 0,
    units: 'pounds at named shelf cuts',
    kind: 'empirical',
    source: 'spreadsheet dropdown table H17:I27',
    uncertainty:
      'exact at the 11 tabulated steps; between steps our implementation interpolates linearly (the spreadsheet only offers discrete steps)',
    verifyStatus: 'verified-against-oracle',
    notes:
      "cutIn uses Stu Miller's sign convention: positive = strike plate OUTSIDE string centerline (less than center cut), negative = past center. More center cut → stiffer arrow required. See SHELF_CUT_CORRECTIONS for the tabulated rows.",
  },
  {
    key: 'bowTypeOffsetSelfPounds',
    label: 'Bow-type offset: self bow',
    value: 0,
    units: 'pounds',
    kind: 'empirical',
    source: COMMUNITY_SOURCE,
    uncertainty: '±5#',
    verifyStatus: 'unverified-community-rule',
    notes:
      'Stu Miller Rev 6-12-09 has NO bow-type term — it models shelf cut continuously instead. These offsets are a coarse community approximation of typical shelf position per bow type; do NOT stack with a separately-entered shelf cut (see bowNeedQuick docs). Bracketing check: the oracle shelf table gives +5 at center cut vs −2 at 1/8 less than center → 7# recurve-vs-longbow delta, which lies between the +5 and +10 offsets.',
  },
  {
    key: 'bowTypeOffsetShelfLongbowPounds',
    label: 'Bow-type offset: shelf longbow',
    value: 5,
    units: 'pounds',
    kind: 'empirical',
    source: COMMUNITY_SOURCE,
    uncertainty: '±5#',
    verifyStatus: 'unverified-community-rule',
    notes:
      'Stu Miller Rev 6-12-09 has NO bow-type term — it models shelf cut continuously instead. These offsets are a coarse community approximation of typical shelf position per bow type; do NOT stack with a separately-entered shelf cut (see bowNeedQuick docs). Bracketing check: the oracle shelf table gives +5 at center cut vs −2 at 1/8 less than center → 7# recurve-vs-longbow delta, which lies between the +5 and +10 offsets.',
  },
  {
    key: 'bowTypeOffsetDeflexReflexLongbowPounds',
    label: 'Bow-type offset: deflex/reflex longbow',
    value: 5,
    units: 'pounds',
    kind: 'empirical',
    source: COMMUNITY_SOURCE,
    uncertainty: '±5#',
    verifyStatus: 'unverified-community-rule',
    notes:
      'Stu Miller Rev 6-12-09 has NO bow-type term — it models shelf cut continuously instead. These offsets are a coarse community approximation of typical shelf position per bow type; do NOT stack with a separately-entered shelf cut (see bowNeedQuick docs). Bracketing check: the oracle shelf table gives +5 at center cut vs −2 at 1/8 less than center → 7# recurve-vs-longbow delta, which lies between the +5 and +10 offsets.',
  },
  {
    key: 'bowTypeOffsetCentershotRecurvePounds',
    label: 'Bow-type offset: centershot recurve',
    value: 10,
    units: 'pounds',
    kind: 'empirical',
    source: COMMUNITY_SOURCE,
    uncertainty: '±5#',
    verifyStatus: 'unverified-community-rule',
    notes:
      'Stu Miller Rev 6-12-09 has NO bow-type term — it models shelf cut continuously instead. These offsets are a coarse community approximation of typical shelf position per bow type; do NOT stack with a separately-entered shelf cut (see bowNeedQuick docs). Bracketing check: the oracle shelf table gives +5 at center cut vs −2 at 1/8 less than center → 7# recurve-vs-longbow delta, which lies between the +5 and +10 offsets.',
  },
  {
    key: 'bowTypeOffsetPerformanceRecurvePounds',
    label: 'Bow-type offset: performance recurve',
    value: 10,
    units: 'pounds',
    kind: 'empirical',
    source: COMMUNITY_SOURCE,
    uncertainty: '±5#',
    verifyStatus: 'unverified-community-rule',
    notes:
      'Stu Miller Rev 6-12-09 has NO bow-type term — it models shelf cut continuously instead. These offsets are a coarse community approximation of typical shelf position per bow type; do NOT stack with a separately-entered shelf cut (see bowNeedQuick docs). Bracketing check: the oracle shelf table gives +5 at center cut vs −2 at 1/8 less than center → 7# recurve-vs-longbow delta, which lies between the +5 and +10 offsets.',
  },
  {
    key: 'footingTaperDynamicPounds',
    label: 'Footing/taper dynamic spine adjustment',
    value: -2,
    units: 'pounds of dynamic spine',
    kind: 'empirical',
    source:
      "instructions PDF Quick Tip 1 ('subtract 2# from the arrows dynamic spine number' for tapered wood or front-loaded carbon)",
    uncertainty: '±1#',
    verifyStatus: 'consistent-with-oracle',
  },
  {
    key: 'footingFocPercent',
    label: 'Footing/taper FOC adjustment',
    value: 1.5,
    units: '% FOC',
    kind: 'empirical',
    source: "instructions PDF Quick Tip 1 ('add 1.5% to the FOC number')",
    uncertainty: '±0.5%',
    verifyStatus: 'consistent-with-oracle',
    notes: 'used by build.ts in Phase 2; registered now for completeness',
  },
  {
    key: 'heavySilencerBowNeedPounds',
    label: 'Heavy string silencer bow-need adjustment',
    value: -2,
    units: 'pounds of bow need',
    kind: 'empirical',
    source:
      "instructions PDF Quick Tip 3 ('multiple or extra heavy string silencers ... Subtract 2#')",
    uncertainty: '±1#',
    verifyStatus: 'consistent-with-oracle',
  },
  {
    key: 'matchTolerancePounds',
    label: 'Arrow-to-arrow match tolerance',
    value: 2,
    units: 'pounds',
    kind: 'convention',
    source:
      "instructions PDF ('approx within 2#', 'more than ~2# apart') and 3Rivers/Stu Miller UX; architecture.md §4 '±2# convention'",
    uncertainty: 'exact convention',
    verifyStatus: 'verified-against-oracle',
  },
  {
    key: 'eEffectiveAluminumGPa',
    label: 'Effective modulus of aluminum shafts (calibrated)',
    value: 71.88,
    units: 'GPa',
    kind: 'empirical',
    source:
      'calibrated as the median over 28 Easton XX75/X7 published static deflections (table as transcribed in Stu Miller Rev 6-12-09); OD/wall from the standard aluminum size code (first two digits/64 = OD, last two/1000 = wall)',
    uncertainty:
      '66.4–77.2 GPa across the 28 sizes; static-spine prediction residuals within ±7.6% (worst 1516)',
    verifyStatus: 'consistent-with-oracle',
    notes:
      'EFFECTIVE modulus, calibrated — explicitly NOT a material constant. Nominal 6063/7075 alloy E ≈ 69 GPa; the +4% offset reflects published-rating rounding and tube tolerance',
  },
  {
    key: 'eEffectiveCarbonGPa',
    label: 'Effective modulus of carbon shafts (calibrated)',
    value: 62.8,
    units: 'GPa',
    kind: 'empirical',
    source:
      'calibrated at the single point Carbon 500 (0.500" ASTM) assuming OD 0.295" / ID 0.245" — dims ASSUMED, not measured; carbon IDs vary widely between manufacturers',
    uncertainty: 'highly assumption-sensitive (order ±20%); single calibration point',
    verifyStatus: 'consistent-with-oracle',
    notes:
      'EFFECTIVE modulus, calibrated. The dynamic model consumes a measured static spine, so this E_eff only powers indicative static predictions for carbon; see docs/model-notes.md',
  },
];

/**
 * Look up a coefficient by its registry key.
 * @throws RangeError if `key` is not in the registry.
 */
export function coefficient(key: string): Coefficient {
  const found = COEFFICIENTS.find((c) => c.key === key);
  if (found === undefined) {
    throw new RangeError(`unknown coefficient key: ${key}`);
  }
  return found;
}

/**
 * Shelf-cut correction table, exactly as tabulated in the spreadsheet
 * dropdown (H17:I27). Between steps, consumers interpolate linearly.
 *
 * `cutIn` uses Stu Miller's sign convention: positive = strike plate OUTSIDE
 * the string centerline (less than center cut), negative = past center.
 * More center cut → stiffer arrow required (higher correction).
 */
export const SHELF_CUT_CORRECTIONS: readonly {
  readonly cutIn: number;
  readonly correctionPounds: number;
}[] = [
  { cutIn: -0.1875, correctionPounds: 18 },
  { cutIn: -0.125, correctionPounds: 15 },
  { cutIn: -0.0625, correctionPounds: 10 },
  { cutIn: 0, correctionPounds: 5 },
  { cutIn: 0.0625, correctionPounds: 2 },
  { cutIn: 0.125, correctionPounds: -2 },
  { cutIn: 0.1875, correctionPounds: -5 },
  { cutIn: 0.25, correctionPounds: -10 },
  { cutIn: 0.375, correctionPounds: -14 },
  { cutIn: 0.5, correctionPounds: -18 },
  { cutIn: 0.625, correctionPounds: -22 },
];

/**
 * String material factors for the dynamic-spine formula, built from the
 * registry (never duplicated as literals here).
 */
export const STRING_MATERIAL_FACTORS: {
  readonly b50: number;
  readonly fastflight: number;
} = {
  b50: coefficient('stringFactorB50').value,
  fastflight: coefficient('stringFactorFastFlight').value,
};

/**
 * Fletching reference weights (grains) used by the weight factor, built from
 * the registry.
 */
export const FLETCHING_REFERENCE_WEIGHTS_GR: {
  readonly feathers: number;
  readonly vanes: number;
} = {
  feathers: coefficient('fletchingWeightFeathersGr').value,
  vanes: coefficient('fletchingWeightVanesGr').value,
};

/** Bow types supported by the community bow-type offset rule. */
export type BowType =
  'self' | 'shelfLongbow' | 'deflexReflexLongbow' | 'centershotRecurve' | 'performanceRecurve';

/**
 * Bow-type offsets in pounds of required bow need, built from the registry.
 * Community approximation only — do NOT stack with a separately-entered
 * shelf cut.
 */
export const BOW_TYPE_OFFSETS_POUNDS: Record<BowType, number> = {
  self: coefficient('bowTypeOffsetSelfPounds').value,
  shelfLongbow: coefficient('bowTypeOffsetShelfLongbowPounds').value,
  deflexReflexLongbow: coefficient('bowTypeOffsetDeflexReflexLongbowPounds').value,
  centershotRecurve: coefficient('bowTypeOffsetCentershotRecurvePounds').value,
  performanceRecurve: coefficient('bowTypeOffsetPerformanceRecurvePounds').value,
};
