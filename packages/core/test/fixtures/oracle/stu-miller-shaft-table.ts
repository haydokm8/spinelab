/*
# fixture:   Easton XX75/X7 published static spine (aluminum), as transcribed in Stu Miller Dynamic Spine Calculator Rev 6-12-09
# source:    local .xls 'Dynamic Spine Calculator Rev 6-12-09' shaft table (oracle file NOT redistributed); deflections are Easton published values
# date:      2026-11-18
# method:    computed — transcribed programmatically from the spreadsheet's published table cells; OD/wall derived from the standard aluminum size code (first two digits/64 = OD in, last two digits/1000 = wall in)
# tolerance: ±8% on static deflection (published values rounded to 3 decimals; our E_eff calibration is a median over this same table)
*/

/**
 * One row of the published Easton aluminum static-spine table.
 *
 * `odIn` and `wallIn` are derived from the standard aluminum size code:
 * first two digits / 64 = OD in inches, last two digits / 1000 = wall in
 * inches (e.g. 1916 → OD 19/64, wall 0.016). `astmDeflectionIn` is the
 * Easton published static deflection in inches at the ASTM rig
 * (1.94 lb @ 28 in). `gpi` is grains per inch.
 */
export interface PublishedAluminumShaft {
  readonly size: string;
  readonly odIn: number;
  readonly wallIn: number;
  readonly astmDeflectionIn: number;
  readonly gpi: number;
}

/**
 * The published table cells, as [size, astmDeflectionIn, gpi]. OD and wall
 * are derived from the size code below so the transcription and the
 * geometry rule live in exactly one place.
 */
const PUBLISHED_ROWS: readonly (readonly [size: string, astmDeflectionIn: number, gpi: number])[] =
  [
    ['1416', 1.68, 7.14],
    ['1516', 1.4, 7.28],
    ['1616', 1.07, 8.34],
    ['1713', 1.03, 7.45],
    ['1716', 0.88, 9.03],
    ['1813', 0.86, 7.83],
    ['1816', 0.75, 9.24],
    ['1913', 0.725, 8.31],
    ['1914', 0.657, 9.24],
    ['1916', 0.62, 10.03],
    ['2013', 0.6, 9.03],
    ['2016', 0.53, 10.52],
    ['2018', 0.465, 12.31],
    ['2020', 0.445, 13.52],
    ['2113', 0.53, 9.31],
    ['2114', 0.5, 9.83],
    ['2115', 0.46, 10.79],
    ['2117', 0.402, 11.97],
    ['2213', 0.46, 9.79],
    ['2215', 0.413, 10.76],
    ['2216', 0.374, 12.0],
    ['2219', 0.336, 13.72],
    ['2312', 0.425, 9.55],
    ['2314', 0.387, 10.59],
    ['2315', 0.338, 11.66],
    ['2317', 0.295, 13.28],
    ['2413', 0.362, 10.41],
    ['2419', 0.264, 14.55],
  ];

/**
 * The 28 published Easton XX75/X7 rows. Ordered as in the spreadsheet's
 * shaft table.
 */
export const PUBLISHED_ALUMINUM_SHAFTS: readonly PublishedAluminumShaft[] = PUBLISHED_ROWS.map(
  ([size, astmDeflectionIn, gpi]) => ({
    size,
    odIn: Number(size.slice(0, 2)) / 64,
    wallIn: Number(size.slice(2)) / 1000,
    astmDeflectionIn,
    gpi,
  }),
);
