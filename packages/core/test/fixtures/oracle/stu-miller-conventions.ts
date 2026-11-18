/*
 * fixture: AMO/ASTM spine conversion conventions (deflection factor 0.825419,
 *          ASTM→AMO) and the 500-thousandths → 63.0# worked example.
 * source: Stu Miller, Instructions for Dynamic Spine Calculator (11-22-09),
 *         p.1, NOTE A — local PDF at
 *         /home/sage/.hermes/references/spinelab-oracle/stu-miller-instructions.pdf
 *         (NOT redistributed)
 * source: Oak Creek Archery, Spine-O-Meter Instructions —
 *         https://oakcreekarchery.com/arrow_translation.pdf
 * date: 2026-11-18
 * method: Oak Creek publishes the ASTM→AMO conversion factor as 0.825419,
 *         derived from the rig parameters (2 lb @ 26 in) vs (1.94 lb @ 28 in)
 *         via δ = F·L³/(48·E·I): factor = (2·26³)/(1.94·28³) = 0.825419...
 *         Stu Miller's instructions state, verbatim: "Convert ATSM spine to
 *         AMO spine by dividing by 0.825." in the context: "The static spine
 *         must be per the AMO standard (2# @ 26" centers)... They report
 *         spine numbers based on an ASTM standard using 1.94# @ 28" centers."
 *         The ÷0.825 applies to the POUND pipeline (P_AMO = (26/δ_ASTM) /
 *         0.825419); deflection thousandths convert by MULTIPLYING by
 *         0.825419 (ASTM→AMO). Both routes must agree.
 * tolerance: factor within 5e-7 of 0.825419; worked example within 0.001 in
 *         deflection and 0.5# of the expected AMO values; the ×0.825419
 *         deflection route and the ÷0.825 pound route must agree within 0.1#.
 */

/**
 * Expected factor for ASTM→AMO deflection conversion: Oak Creek's published
 * 6-dp value of (2·26³)/(1.94·28³).
 */
export const expectedFactor = 0.825419;

/** Tolerance for the observed deflectionFactor vs Oak Creek's 6-dp value. */
export const toleranceFactor = 5e-7;

/**
 * Worked example from the sources: a carbon shaft reported as "500" on the
 * ASTM deflection convention corresponds to 63.0# on the AMO convention.
 */
export const workedExample = {
  astmThousandths: 500,
  expectedAmoDeflectionIn: 0.412709,
  toleranceIn: 0.001,
  expectedAmoPounds: 63.0,
  tolerancePounds: 0.5,
} as const;

/**
 * The two documented routes (multiply thousandths by 0.825419, and divide the
 * AMO pound number by 0.825419) must agree within this tolerance in pounds.
 */
export const routeAgreementTolerancePounds = 0.1;
