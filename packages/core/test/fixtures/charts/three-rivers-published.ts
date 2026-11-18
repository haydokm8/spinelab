/*
 * fixture: 3Rivers published chart facts (string rule + bow-type chart
 *          structure + aluminum letter-legend disagreement).
 * source:  https://www.3riversarchery.com/pdf/ArrowCharts.pdf and
 *          https://www.3riversarchery.com/pdf/AluminiumSpineChart.pdf
 *          (3Rivers Archery published PDFs)
 * date:    2026-11-18
 * method:  manual-copy from the retrieved PDF text
 * tolerance: exact quoted statements (±0)
 */

/**
 * Published chart facts from the current 3Rivers arrow-selection PDFs.
 * Only statements the charts actually publish are recorded here — the
 * bow-type offsets in `coefficients.ts` cite this structure as their
 * DIRECTION-ONLY verification (magnitude is flagged
 * 'unverified-community-rule' in the registry).
 */
export const THREE_RIVERS_CHART_FACTS = {
  /** Chart note: 'Spine Charts: +5 for Fast Flight® bow strings'. */
  fastFlightSpineAdjustmentPounds: 5,
  /** Chart rows are 5# bands (31-35, 36-40, ...). */
  bowWeightBandPounds: 5,
  /** Column headers exactly as published. */
  bowTypeColumns: ['RECURVE/CENTER SHOT LONGBOW', 'LONGBOW / SELF BOW'],
  /**
   * For equal bow weight the LONGBOW / SELF BOW column recommends weaker
   * arrows than the RECURVE/CENTER SHOT column (more center cut → stiffer
   * arrow needed).
   */
  bowTypeColumnNote:
    'For equal bow weight the LONGBOW / SELF BOW column recommends weaker arrows than the RECURVE/CENTER SHOT column (more center cut → stiffer arrow needed).',
} as const;

/**
 * A genuine published disagreement between the two current 3Rivers PDFs:
 * they assign DIFFERENT aluminum sizes to the same legend letters.
 *
 * ArrowCharts.pdf maps 1716=A, 1816=B, ... 2413=O (15 sizes).
 * AluminiumSpineChart.pdf drops 1716 and shifts every letter one size
 * later (1816=A, ... 2413=O). Recorded as chart-neighborhood context,
 * NOT as an authoritative mapping — do not consume these as data.
 */
export const ALUMINUM_LETTER_LEGENDS = {
  arrowChartsPdf: {
    '1716': 'A',
    '1816': 'B',
    '1916': 'C',
    '2013': 'D',
    '2016': 'E',
    '2018': 'F',
    '2117': 'G',
    '2213': 'H',
    '2215': 'I',
    '2216': 'J',
    '2219': 'K',
    '2314': 'L',
    '2315': 'M',
    '2317': 'N',
    '2413': 'O',
  },
  aluminiumSpineChartPdf: {
    '1816': 'A',
    '1916': 'B',
    '2013': 'C',
    '2016': 'D',
    '2018': 'E',
    '2020': 'F',
    '2117': 'G',
    '2213': 'H',
    '2215': 'I',
    '2216': 'J',
    '2219': 'K',
    '2314': 'L',
    '2315': 'M',
    '2317': 'N',
    '2413': 'O',
  },
  disagreementNote:
    'The two current 3Rivers PDFs assign different sizes to the same legend letters (1716 present in ArrowCharts.pdf only; every subsequent letter shifts one size). Genuine published-chart disagreement; recorded as chart-neighborhood context, NOT as an authoritative mapping.',
} as const;
