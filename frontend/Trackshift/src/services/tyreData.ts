
export type Compound = 'SOFT' | 'MEDIUM' | 'HARD';


export interface DegradationRate {
  compound: Compound;
  
  rate: number;
  ciLower: number;
  ciUpper: number;
  
  stints: number;
  
  durabilityRank: number;
}

export interface CurvePoint {
  
  tyreAge: number;
  
  paceLoss: number;
}

export interface YearlyDegradation {
  year: number;
  compound: Compound;
  stints: number;
  medianDegradation: number;
}

export interface CVFoldResult {
  fold: number;
  trainRows: number;
  testRows: number;
  mae: number;
  rmse: number;
  r2: number;
}

export interface ErrorByAge {
  tyreAge: number;
  laps: number;
  mae: number;
  medianError: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}


export const DEGRADATION_RATES: Record<Compound, DegradationRate> = {
  SOFT: {
    compound: 'SOFT',
    rate: 0.04596158203502332,
    ciLower: 0.03500000000000000,
    ciUpper: 0.06000000000000000,
    stints: 525,
    durabilityRank: 2,
  },
  MEDIUM: {
    compound: 'MEDIUM',
    rate: 0.06225038098722555,
    ciLower: 0.05000000000000000,
    ciUpper: 0.07500000000000000,
    stints: 1044,
    durabilityRank: 3,
  },
  HARD: {
    compound: 'HARD',
    rate: 0.051501953362365564,
    ciLower: 0.04000000000000000,
    ciUpper: 0.06500000000000000,
    stints: 401,
    durabilityRank: 1,
  },
};


export const DEGRADATION_CURVES: Record<Compound, CurvePoint[]> = {
  SOFT: [
    { tyreAge: 2, paceLoss: 0.0 },
    { tyreAge: 3, paceLoss: 0.0950883750868233 },
    { tyreAge: 4, paceLoss: 0.1901767501736466 },
    { tyreAge: 5, paceLoss: 0.2852651252604699 },
    { tyreAge: 6, paceLoss: 0.3803535003472932 },
    { tyreAge: 7, paceLoss: 0.47544187543411653 },
    { tyreAge: 8, paceLoss: 0.5705302505209398 },
    { tyreAge: 9, paceLoss: 0.6656186256077631 },
    { tyreAge: 10, paceLoss: 0.7607070006945864 },
    { tyreAge: 11, paceLoss: 0.8557953757814097 },
    { tyreAge: 12, paceLoss: 0.9508837508682331 },
    { tyreAge: 13, paceLoss: 1.0459721259550563 },
    { tyreAge: 14, paceLoss: 1.1410605010418795 },
    { tyreAge: 15, paceLoss: 1.236148876128703 },
    { tyreAge: 16, paceLoss: 1.3312372512155262 },
    { tyreAge: 17, paceLoss: 1.4263256263023496 },
    { tyreAge: 18, paceLoss: 1.5214140013891728 },
    { tyreAge: 19, paceLoss: 1.616502376475996 },
    { tyreAge: 20, paceLoss: 1.7115907515628195 },
  ],
  MEDIUM: [
    { tyreAge: 2, paceLoss: 0.0 },
    { tyreAge: 3, paceLoss: 0.04931599170600939 },
    { tyreAge: 4, paceLoss: 0.09863198341201879 },
    { tyreAge: 5, paceLoss: 0.14794797511802818 },
    { tyreAge: 6, paceLoss: 0.19726396682403757 },
    { tyreAge: 7, paceLoss: 0.24657995853004697 },
    { tyreAge: 8, paceLoss: 0.29589595023605636 },
    { tyreAge: 9, paceLoss: 0.3452119419420657 },
    { tyreAge: 10, paceLoss: 0.39452793364807515 },
    { tyreAge: 11, paceLoss: 0.44384392535408457 },
    { tyreAge: 12, paceLoss: 0.49315991706009393 },
    { tyreAge: 13, paceLoss: 0.5424759087661033 },
    { tyreAge: 14, paceLoss: 0.5917919004721127 },
    { tyreAge: 15, paceLoss: 0.6411078921781221 },
    { tyreAge: 16, paceLoss: 0.6904238838841315 },
    { tyreAge: 17, paceLoss: 0.7397398755901409 },
    { tyreAge: 18, paceLoss: 0.7890558672961503 },
    { tyreAge: 19, paceLoss: 0.8383718590021597 },
    { tyreAge: 20, paceLoss: 0.8876878507081691 },
  ],
  HARD: [
    { tyreAge: 2, paceLoss: 0.0 },
    { tyreAge: 3, paceLoss: 0.0009493520409101333 },
    { tyreAge: 4, paceLoss: 0.0018987040818202667 },
    { tyreAge: 5, paceLoss: 0.0028480561227304 },
    { tyreAge: 6, paceLoss: 0.0037974081636405334 },
    { tyreAge: 7, paceLoss: 0.004746760204550666 },
    { tyreAge: 8, paceLoss: 0.0056961122454608 },
    { tyreAge: 9, paceLoss: 0.006645464286370933 },
    { tyreAge: 10, paceLoss: 0.007594816327281067 },
    { tyreAge: 11, paceLoss: 0.0085441683681912 },
    { tyreAge: 12, paceLoss: 0.009493520409101333 },
    { tyreAge: 13, paceLoss: 0.010442872450011466 },
    { tyreAge: 14, paceLoss: 0.0113922244909216 },
    { tyreAge: 15, paceLoss: 0.012341576531831733 },
    { tyreAge: 16, paceLoss: 0.013290928572741867 },
    { tyreAge: 17, paceLoss: 0.014240280613652 },
    { tyreAge: 18, paceLoss: 0.015189632654562133 },
    { tyreAge: 19, paceLoss: 0.016138984695472265 },
    { tyreAge: 20, paceLoss: 0.0170883367363824 },
  ],
};


export const DEGRADATION_BY_YEAR: YearlyDegradation[] = [
  { year: 2022, compound: 'SOFT',   stints: 134, medianDegradation: 0.08143584281428198 },
  { year: 2022, compound: 'MEDIUM', stints: 222, medianDegradation: 0.07135551677332108 },
  { year: 2022, compound: 'HARD',   stints: 53,  medianDegradation: -0.03709825975019802 },
  { year: 2023, compound: 'SOFT',   stints: 107, medianDegradation: 0.09403265821649144 },
  { year: 2023, compound: 'MEDIUM', stints: 176, medianDegradation: 0.047039178466061496 },
  { year: 2023, compound: 'HARD',   stints: 79,  medianDegradation: 0.05115996617199713 },
  { year: 2024, compound: 'SOFT',   stints: 102, medianDegradation: 0.1314121652636705 },
  { year: 2024, compound: 'MEDIUM', stints: 251, medianDegradation: 0.056417708757607495 },
  { year: 2024, compound: 'HARD',   stints: 80,  medianDegradation: 0.020024898190747296 },
  { year: 2025, compound: 'SOFT',   stints: 182, medianDegradation: 0.084373886422693 },
  { year: 2025, compound: 'MEDIUM', stints: 395, medianDegradation: 0.03236206607159069 },
  { year: 2025, compound: 'HARD',   stints: 189, medianDegradation: -0.009862174069012417 },
];


export const CV_FOLD_RESULTS: CVFoldResult[] = [
  { fold: 1, trainRows: 23397, testRows: 5850, mae: 6.194564714814535,  rmse: 10.1640610245763,  r2: 0.5334975962876258 },
  { fold: 2, trainRows: 23397, testRows: 5850, mae: 6.150701728025258,  rmse: 10.076887370319143, r2: 0.5631723893425694 },
  { fold: 3, trainRows: 23398, testRows: 5849, mae: 5.883336698107199,  rmse: 9.669714449521402,  r2: 0.5693035212178679 },
  { fold: 4, trainRows: 23398, testRows: 5849, mae: 5.9650651335798575, rmse: 9.907285466481865,  r2: 0.5505079282787926 },
  { fold: 5, trainRows: 23398, testRows: 5849, mae: 6.120930465846943,  rmse: 10.105481315172707, r2: 0.5330549309770654 },
];

export const CV_SUMMARY = {
  meanMAE:  CV_FOLD_RESULTS.reduce((s, f) => s + f.mae, 0)  / CV_FOLD_RESULTS.length,
  meanRMSE: CV_FOLD_RESULTS.reduce((s, f) => s + f.rmse, 0) / CV_FOLD_RESULTS.length,
  meanR2:   CV_FOLD_RESULTS.reduce((s, f) => s + f.r2, 0)   / CV_FOLD_RESULTS.length,
};


export const ERROR_BY_AGE: ErrorByAge[] = [
  { tyreAge: 2,  laps: 4025, mae: 4.500134790008734,  medianError: -1.646888549804686 },
  { tyreAge: 3,  laps: 1368, mae: 14.63491996809753,  medianError: -5.60390713500977 },
  { tyreAge: 4,  laps: 2156, mae: 10.869851237932252, medianError: -4.146796417236331 },
  { tyreAge: 5,  laps: 2388, mae: 9.821128199668387,  medianError: -4.815056762695313 },
  { tyreAge: 6,  laps: 1774, mae: 10.241733413851113, medianError: -3.989085601806636 },
  { tyreAge: 7,  laps: 1607, mae: 9.260736554224742,  medianError: -3.5112849121093745 },
  { tyreAge: 8,  laps: 1706, mae: 7.2807905536754465, medianError: -2.237772888183592 },
  { tyreAge: 9,  laps: 1570, mae: 5.683339661499801,  medianError: -1.3969296875000055 },
  { tyreAge: 10, laps: 1530, mae: 4.898889261323019,  medianError: -1.1484274291992165 },
  { tyreAge: 11, laps: 1630, mae: 3.93887256802986,   medianError: -0.8274406433105455 },
  { tyreAge: 12, laps: 1553, mae: 3.1210566590966833, medianError: -0.5410664672851624 },
  { tyreAge: 13, laps: 1488, mae: 2.602454670034429,  medianError: -0.4683635864257809 },
  { tyreAge: 14, laps: 1414, mae: 2.368128063153344,  medianError: -0.4733334960937441 },
  { tyreAge: 15, laps: 1303, mae: 2.2826673060290554, medianError: -0.5772373657226524 },
  { tyreAge: 16, laps: 1090, mae: 2.089679492859447,  medianError: -0.5790912780761701 },
  { tyreAge: 17, laps: 901,  mae: 2.287776295991108,  medianError: -0.7108701782226632 },
  { tyreAge: 18, laps: 730,  mae: 2.3992864760307415, medianError: -0.829390075683591 },
  { tyreAge: 19, laps: 578,  mae: 2.785516018771795,  medianError: -1.0150072326660151 },
  { tyreAge: 20, laps: 436,  mae: 2.8608869665303365, medianError: -1.0835924682617204 },
];


export const TOP_FEATURES: FeatureImportance[] = [
  { feature: 'Azerbaijan GP',    importance: 0.14704154 },
  { feature: 'Austrian GP',      importance: 0.13522172 },
  { feature: 'Belgian GP',       importance: 0.07829067 },
  { feature: 'São Paulo GP',     importance: 0.06185786 },
  { feature: 'Dutch GP',         importance: 0.05279199 },
  { feature: 'Monaco GP',        importance: 0.05136208 },
  { feature: 'Spanish GP',       importance: 0.03631242 },
  { feature: 'Canadian GP',      importance: 0.03213093 },
  { feature: 'Air Temp',         importance: 0.01027291 },
  { feature: 'Track Temp',       importance: 0.00931769 },
  { feature: 'Humidity',         importance: 0.00864962 },
  { feature: 'Tyre Age',         importance: 0.00774645 },
  { feature: 'Compound (SOFT)',  importance: 0.00701339 },
];


export const DATASET_PROVENANCE = {
  era: '2022–2025 comparable tyre era',
  compounds: ['SOFT', 'MEDIUM', 'HARD'] as Compound[],
  rawLoadedLaps: 74951,
  filteredCandidateLaps: 34757,
  representativeLaps: 30207,
  qualifiedStints: 1970,
  totalStintsByCompound: {
    SOFT: 525,
    MEDIUM: 1044,
    HARD: 401,
  },
};



export function computeAdditionalPaceLoss(
  compound: Compound,
  additionalLaps: number,
): number {
  return DEGRADATION_RATES[compound].rate * additionalLaps;
}


export function getCurvePoints(compound: Compound): CurvePoint[] {
  return DEGRADATION_CURVES[compound];
}


export function getCIBandPoints(
  compound: Compound,
  side: 'upper' | 'lower',
): CurvePoint[] {
  const r = DEGRADATION_RATES[compound];
  const offset = side === 'upper'
    ? r.ciUpper - r.rate
    : -(r.rate - r.ciLower);
  return DEGRADATION_CURVES[compound].map(pt => ({
    tyreAge: pt.tyreAge,
    paceLoss: pt.paceLoss + offset * (pt.tyreAge - 2),
  }));
}


export function getPaceLossAtAge(compound: Compound, tyreAge: number): number {
  const clampedAge = Math.max(2, Math.min(20, tyreAge));
  const idx = clampedAge - 2;
  const pts = DEGRADATION_CURVES[compound];
  if (idx < pts.length) return pts[idx].paceLoss;
  return DEGRADATION_RATES[compound].rate * (clampedAge - 2);
}


export const COMPOUND_STRATEGY_PROFILE: Record<Compound, {
  headline: string;
  subline: string;
  implication: string;
}> = {
  SOFT: {
    headline: 'HIGHEST INITIAL PACE',
    subline: '+0.046 sec/lap',
    implication: 'Fastest starting lap pace (~80.0s), linear degradation of 0.046s/lap.',
  },
  MEDIUM: {
    headline: 'HIGHEST LINEAR DEGRADATION',
    subline: '+0.062 sec/lap',
    implication: 'Moderate baseline pace (~85.9s), higher rate of pace regression across stint.',
  },
  HARD: {
    headline: 'BALANCED LONG-STINT PACE',
    subline: '+0.052 sec/lap',
    implication: 'Consistent degradation trajectory with low initial variance.',
  },
};