/*
 * fixture: Stu Miller Dynamic Spine Calculator Rev 6-12-09 — dynamic-spine
 *          model grid (40 points; bow-need and arrow-supply pairs).
 * source: Stu Miller, Dynamic Spine Calculator Rev 6-12-09 — local .xls read
 *         as a test oracle ONLY; the .xls is NOT redistributed
 * date: 2026-11-18
 * method: computed — expected values computed by a local generator
 *         transcribing the spreadsheet's published formulas; generator
 *         validated against BOTH spreadsheets' cached result states
 *         (Rev 6-12-09: 1916/29in/140gr/11gr nock/feathers/FastFlight/50#@28/
 *         draw28/shelf +1/8 -> dynamic 50.12513 vs spreadsheet 50.12512774,
 *         required 50.5 exact; Rev 1: 1916/29in/125gr/0 nock/feathers/B50/
 *         50#@28/draw29/shelf +1/8 -> dynamic 50.766 vs displayed 50.8,
 *         required 51.0 exact). Values are formula-computed, not transcribed
 *         from spreadsheet runs beyond those two cached states.
 * tolerance: +/-0.1#
 */

/**
 * Input half of one oracle grid point. Fletching and string literals are
 * lowercased versions of the spreadsheet's dropdown values.
 */
export interface StuMillerRev6FixturePoint {
  readonly inputs: {
    readonly astmThousandths: number;
    readonly bopIn: number;
    readonly pointGr: number;
    readonly nockGr: number;
    readonly fletching: 'feathers' | 'vanes';
    readonly ratedW: number;
    readonly ratedDraw: number;
    readonly yourDraw: number;
    readonly shelfCutIn: number;
    readonly string: 'b50' | 'fastflight';
  };
  readonly expected: {
    readonly arrowDynamicPounds: number;
    readonly bowRequiredPounds: number;
  };
}

/**
 * Provenance of the grid above, as data (mirrors the header comment so
 * tests can assert on it).
 */
export const FIXTURE_PROVENANCE = {
  source:
    'Stu Miller Dynamic Spine Calculator, Rev 6-12-09 (local .xls read as a test oracle only; NOT redistributed)',
  method:
    "expected values computed by a local generator transcribing the spreadsheet's published formulas; values are formula-computed, not transcribed from spreadsheet runs beyond the two cached result states below",
  validation:
    "generator validated against BOTH spreadsheets' cached result states: Rev 6-12-09 (1916/29in/140gr/11gr nock/feathers/FastFlight/50#@28/draw28/shelf +1/8) dynamic 50.12513 vs spreadsheet 50.12512774, required 50.5 exact; Rev 1 (1916/29in/125gr/0 nock/feathers/B50/50#@28/draw29/shelf +1/8) dynamic 50.766 vs displayed 50.8, required 51.0 exact",
  conventions:
    'deflection in ASTM thousandths (1.94 lb @ 28 in); dynamic spine + required spine in AMO pounds (2 lb @ 26 in); shelf cut inches, + = less than center cut',
  toleranceNote:
    'the spreadsheet multiplies deflections by 0.825 (4 dp); our implementation uses the published 0.825419, inducing up to 0.056# difference across the grid (max 0.0559# measured) — hence the +/-0.1# tolerance',
} as const;

/**
 * The 40-point oracle grid. Bow-need values are EXACT (the bow-required
 * formula involves no rounded constants); arrow-dynamic values carry the
 * 0.825-vs-0.825419 rounding described in {@link FIXTURE_PROVENANCE}.
 */
export const STU_MILLER_REV6_DYNAMIC_FIXTURES: readonly StuMillerRev6FixturePoint[] = [
  {
    inputs: {
      astmThousandths: 465,
      bopIn: 27,
      pointGr: 100,
      nockGr: 11,
      fletching: 'feathers',
      ratedW: 45,
      ratedDraw: 28,
      yourDraw: 30,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 94.79286575555948, bowRequiredPounds: 68.4770989456866 },
  },
  {
    inputs: {
      astmThousandths: 400,
      bopIn: 29,
      pointGr: 100,
      nockGr: 11,
      fletching: 'feathers',
      ratedW: 45,
      ratedDraw: 28,
      yourDraw: 27,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 88.91734243846919, bowRequiredPounds: 60.2614505271567 },
  },
  {
    inputs: {
      astmThousandths: 530,
      bopIn: 29,
      pointGr: 100,
      nockGr: 13.5,
      fletching: 'feathers',
      ratedW: 55,
      ratedDraw: 28,
      yourDraw: 29,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 67.7188297519449, bowRequiredPounds: 76.2614505271567 },
  },
  {
    inputs: {
      astmThousandths: 400,
      bopIn: 30,
      pointGr: 100,
      nockGr: 13.5,
      fletching: 'feathers',
      ratedW: 35,
      ratedDraw: 28,
      yourDraw: 28,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 81.82691928360006, bowRequiredPounds: 53 },
  },
  {
    inputs: {
      astmThousandths: 620,
      bopIn: 30,
      pointGr: 100,
      nockGr: 13.5,
      fletching: 'feathers',
      ratedW: 55,
      ratedDraw: 28,
      yourDraw: 28,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 52.791560828129086, bowRequiredPounds: 73 },
  },
  {
    inputs: {
      astmThousandths: 620,
      bopIn: 28,
      pointGr: 100,
      nockGr: 13.5,
      fletching: 'feathers',
      ratedW: 35,
      ratedDraw: 28,
      yourDraw: 26,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 64.07525321887422, bowRequiredPounds: 48.61307187375548 },
  },
  {
    inputs: {
      astmThousandths: 620,
      bopIn: 30,
      pointGr: 100,
      nockGr: 13.5,
      fletching: 'feathers',
      ratedW: 35,
      ratedDraw: 28,
      yourDraw: 30,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 52.791560828129086, bowRequiredPounds: 57.38692812624452 },
  },
  {
    inputs: {
      astmThousandths: 465,
      bopIn: 31,
      pointGr: 100,
      nockGr: 11,
      fletching: 'feathers',
      ratedW: 35,
      ratedDraw: 28,
      yourDraw: 29,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 64.1084699040489, bowRequiredPounds: 55.19346406312226 },
  },
  {
    inputs: {
      astmThousandths: 500,
      bopIn: 31,
      pointGr: 100,
      nockGr: 9.8,
      fletching: 'feathers',
      ratedW: 55,
      ratedDraw: 28,
      yourDraw: 28,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 59.36361324804374, bowRequiredPounds: 73 },
  },
  {
    inputs: {
      astmThousandths: 620,
      bopIn: 27,
      pointGr: 100,
      nockGr: 13.5,
      fletching: 'feathers',
      ratedW: 35,
      ratedDraw: 28,
      yourDraw: 27,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 71.7423775356626, bowRequiredPounds: 50.80653593687774 },
  },
  {
    inputs: {
      astmThousandths: 620,
      bopIn: 28,
      pointGr: 100,
      nockGr: 9.8,
      fletching: 'feathers',
      ratedW: 45,
      ratedDraw: 28,
      yourDraw: 29,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 63.22275973843614, bowRequiredPounds: 65.7385494728433 },
  },
  {
    inputs: {
      astmThousandths: 465,
      bopIn: 30,
      pointGr: 100,
      nockGr: 11,
      fletching: 'feathers',
      ratedW: 45,
      ratedDraw: 28,
      yourDraw: 27,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 69.75324083899662, bowRequiredPounds: 60.2614505271567 },
  },
  {
    inputs: {
      astmThousandths: 620,
      bopIn: 29,
      pointGr: 100,
      nockGr: 11,
      fletching: 'feathers',
      ratedW: 35,
      ratedDraw: 28,
      yourDraw: 30,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 57.36602737965755, bowRequiredPounds: 57.38692812624452 },
  },
  {
    inputs: {
      astmThousandths: 620,
      bopIn: 31,
      pointGr: 100,
      nockGr: 9.8,
      fletching: 'feathers',
      ratedW: 35,
      ratedDraw: 28,
      yourDraw: 27,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 47.873881651648176, bowRequiredPounds: 50.80653593687774 },
  },
  {
    inputs: {
      astmThousandths: 620,
      bopIn: 30,
      pointGr: 100,
      nockGr: 13.5,
      fletching: 'feathers',
      ratedW: 35,
      ratedDraw: 28,
      yourDraw: 30,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 52.791560828129086, bowRequiredPounds: 57.38692812624452 },
  },
  {
    inputs: {
      astmThousandths: 465,
      bopIn: 31,
      pointGr: 100,
      nockGr: 11,
      fletching: 'feathers',
      ratedW: 35,
      ratedDraw: 28,
      yourDraw: 28,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 64.1084699040489, bowRequiredPounds: 53 },
  },
  {
    inputs: {
      astmThousandths: 530,
      bopIn: 30,
      pointGr: 100,
      nockGr: 13.5,
      fletching: 'feathers',
      ratedW: 55,
      ratedDraw: 28,
      yourDraw: 29,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 61.756165497056664, bowRequiredPounds: 76.2614505271567 },
  },
  {
    inputs: {
      astmThousandths: 465,
      bopIn: 31,
      pointGr: 100,
      nockGr: 11,
      fletching: 'feathers',
      ratedW: 45,
      ratedDraw: 28,
      yourDraw: 29,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 64.1084699040489, bowRequiredPounds: 65.7385494728433 },
  },
  {
    inputs: {
      astmThousandths: 620,
      bopIn: 30,
      pointGr: 100,
      nockGr: 11,
      fletching: 'feathers',
      ratedW: 45,
      ratedDraw: 28,
      yourDraw: 27,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 52.314930629247456, bowRequiredPounds: 60.2614505271567 },
  },
  {
    inputs: {
      astmThousandths: 530,
      bopIn: 27,
      pointGr: 100,
      nockGr: 13.5,
      fletching: 'feathers',
      ratedW: 35,
      ratedDraw: 28,
      yourDraw: 29,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 83.925045419077, bowRequiredPounds: 55.19346406312226 },
  },
  {
    inputs: {
      astmThousandths: 620,
      bopIn: 29,
      pointGr: 100,
      nockGr: 11,
      fletching: 'feathers',
      ratedW: 45,
      ratedDraw: 28,
      yourDraw: 28,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 57.36602737965755, bowRequiredPounds: 63 },
  },
  {
    inputs: {
      astmThousandths: 465,
      bopIn: 30,
      pointGr: 100,
      nockGr: 13.5,
      fletching: 'feathers',
      ratedW: 55,
      ratedDraw: 28,
      yourDraw: 27,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 70.38874777083878, bowRequiredPounds: 69.7385494728433 },
  },
  {
    inputs: {
      astmThousandths: 500,
      bopIn: 30,
      pointGr: 100,
      nockGr: 11,
      fletching: 'feathers',
      ratedW: 35,
      ratedDraw: 28,
      yourDraw: 30,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 64.87051398026685, bowRequiredPounds: 57.38692812624452 },
  },
  {
    inputs: {
      astmThousandths: 400,
      bopIn: 29,
      pointGr: 100,
      nockGr: 9.8,
      fletching: 'feathers',
      ratedW: 55,
      ratedDraw: 28,
      yourDraw: 26,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 88.53366458544453, bowRequiredPounds: 66.4770989456866 },
  },
  {
    inputs: {
      astmThousandths: 500,
      bopIn: 28,
      pointGr: 100,
      nockGr: 9.8,
      fletching: 'vanes',
      ratedW: 55,
      ratedDraw: 28,
      yourDraw: 29,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 85.26393961377109, bowRequiredPounds: 76.2614505271567 },
  },
  {
    inputs: {
      astmThousandths: 400,
      bopIn: 27,
      pointGr: 100,
      nockGr: 11,
      fletching: 'feathers',
      ratedW: 35,
      ratedDraw: 28,
      yourDraw: 27,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 110.1967064408379, bowRequiredPounds: 50.80653593687774 },
  },
  {
    inputs: {
      astmThousandths: 500,
      bopIn: 27,
      pointGr: 100,
      nockGr: 11,
      fletching: 'feathers',
      ratedW: 45,
      ratedDraw: 28,
      yourDraw: 30,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 88.15736515267031, bowRequiredPounds: 68.4770989456866 },
  },
  {
    inputs: {
      astmThousandths: 400,
      bopIn: 29,
      pointGr: 100,
      nockGr: 13.5,
      fletching: 'feathers',
      ratedW: 35,
      ratedDraw: 28,
      yourDraw: 29,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 89.72744942132698, bowRequiredPounds: 55.19346406312226 },
  },
  {
    inputs: {
      astmThousandths: 620,
      bopIn: 29,
      pointGr: 100,
      nockGr: 11,
      fletching: 'feathers',
      ratedW: 45,
      ratedDraw: 28,
      yourDraw: 27,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 57.36602737965755, bowRequiredPounds: 60.2614505271567 },
  },
  {
    inputs: {
      astmThousandths: 530,
      bopIn: 30,
      pointGr: 100,
      nockGr: 9.8,
      fletching: 'feathers',
      ratedW: 55,
      ratedDraw: 28,
      yourDraw: 29,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 60.93452647390273, bowRequiredPounds: 76.2614505271567 },
  },
  {
    inputs: {
      astmThousandths: 500,
      bopIn: 31,
      pointGr: 100,
      nockGr: 9.8,
      fletching: 'feathers',
      ratedW: 55,
      ratedDraw: 28,
      yourDraw: 28,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 59.36361324804374, bowRequiredPounds: 73 },
  },
  {
    inputs: {
      astmThousandths: 620,
      bopIn: 27,
      pointGr: 100,
      nockGr: 9.8,
      fletching: 'feathers',
      ratedW: 35,
      ratedDraw: 28,
      yourDraw: 28,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 70.78787628833447, bowRequiredPounds: 53 },
  },
  {
    inputs: {
      astmThousandths: 500,
      bopIn: 27,
      pointGr: 100,
      nockGr: 9.8,
      fletching: 'feathers',
      ratedW: 35,
      ratedDraw: 28,
      yourDraw: 27,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 87.77696659753474, bowRequiredPounds: 50.80653593687774 },
  },
  {
    inputs: {
      astmThousandths: 620,
      bopIn: 29,
      pointGr: 100,
      nockGr: 11,
      fletching: 'feathers',
      ratedW: 35,
      ratedDraw: 28,
      yourDraw: 26,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 57.36602737965755, bowRequiredPounds: 48.61307187375548 },
  },
  {
    inputs: {
      astmThousandths: 400,
      bopIn: 29,
      pointGr: 100,
      nockGr: 13.5,
      fletching: 'feathers',
      ratedW: 55,
      ratedDraw: 28,
      yourDraw: 29,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 89.72744942132698, bowRequiredPounds: 76.2614505271567 },
  },
  {
    inputs: {
      astmThousandths: 465,
      bopIn: 31,
      pointGr: 100,
      nockGr: 9.8,
      fletching: 'feathers',
      ratedW: 45,
      ratedDraw: 28,
      yourDraw: 30,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 63.83184220219756, bowRequiredPounds: 68.4770989456866 },
  },
  {
    inputs: {
      astmThousandths: 530,
      bopIn: 29,
      pointGr: 100,
      nockGr: 11,
      fletching: 'feathers',
      ratedW: 55,
      ratedDraw: 28,
      yourDraw: 29,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 67.10742825544845, bowRequiredPounds: 76.2614505271567 },
  },
  {
    inputs: {
      astmThousandths: 620,
      bopIn: 31,
      pointGr: 100,
      nockGr: 11,
      fletching: 'feathers',
      ratedW: 45,
      ratedDraw: 28,
      yourDraw: 29,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 48.08135242803667, bowRequiredPounds: 65.7385494728433 },
  },
  {
    inputs: {
      astmThousandths: 400,
      bopIn: 28,
      pointGr: 100,
      nockGr: 13.5,
      fletching: 'feathers',
      ratedW: 55,
      ratedDraw: 28,
      yourDraw: 29,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 99.31664248925505, bowRequiredPounds: 76.2614505271567 },
  },
  {
    inputs: {
      astmThousandths: 530,
      bopIn: 30,
      pointGr: 100,
      nockGr: 11,
      fletching: 'feathers',
      ratedW: 45,
      ratedDraw: 28,
      yourDraw: 26,
      shelfCutIn: -0.1875,
      string: 'b50',
    },
    expected: { arrowDynamicPounds: 61.19859809459136, bowRequiredPounds: 57.5229010543134 },
  },
];
