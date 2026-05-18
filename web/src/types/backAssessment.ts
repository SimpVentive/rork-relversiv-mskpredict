export interface Demographics {
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  waistCm: number;
  hipCm: number;
  bmi?: number;
}

export interface ROMComponent {
  angleDegrees: number;
  scale: number; // 0-3
}

export interface ROM {
  flexion: ROMComponent;
  extension: ROMComponent;
  leftRotation: ROMComponent;
  rightRotation: ROMComponent;
  lateralFlexionLeftDegrees: number;
  lateralFlexionRightDegrees: number;
  measurementTool: string;
  notes: string;
}

export interface GradedFinding {
  graded: 0 | 1 | 2 | 3 | 4 | 5; // 0 = Normal, 3 = Mild, 5 = Marked
  location: string;
}

export interface Comorbidities {
  hypertension: boolean;
  hypertensionYears: number;
  diabetes: boolean;
  diabetesType: string;
  osteoarthritis: boolean;
  osteoarthritisSeverity: string;
  osteoporosis: boolean;
  previousBackInjury: boolean;
  previousBackSurgery: boolean;
  thyroidDisorder: boolean;
  rheumatoidArthritis: boolean;
  asthma: boolean;
  copd: boolean;
  cardiovascularDisease: boolean;
  kidneyDisease: boolean;
  liverDisease: boolean;
  cancer: boolean;
  mentalHealthDisorder: boolean;
  notes: string;
}

export interface PhysioExam {
  slrLeft: GradedFinding;
  slrRight: GradedFinding;
  faberLeft: GradedFinding;
  faberRight: GradedFinding;
  fair: GradedFinding;
  hyperextension: GradedFinding;
  muscleTenderness: GradedFinding;
  muscleTightness: GradedFinding;
  muscleKnots: GradedFinding;
  muscleSpasm: GradedFinding;
  forwardHeadPosture: boolean;
  increasedThoracicKyphosis: boolean;
  lossOfLumbarLordosis: boolean;
  scoliosis: boolean;
  sensationIntact: boolean;
  strengthNormal: boolean;
  reflexesNormal: boolean;
  spinousProcessTenderness: boolean;
  facetJointTenderness: boolean;
  sacroiliacJointTenderness: boolean;
  painfulArcPresent: boolean;
  painWithMovement: string;
  examNotes: string;
}

export interface Lifestyle {
  smokingStatus: string; // Non-smoker / Occasional / Regular / Heavy
  cigarettesPerDay: number;
  packYears: number;
  alcoholStatus: string; // Teetotaler / Occasional / Regular
  drinksPerWeek: number;
  standing5Plus: boolean;
  sitting5Plus: boolean;
  standingHoursPerDay: number;
  sittingHoursPerDay: number;
  deskErgonomics: string; // Poor / Fair / Good / Excellent
  frequentPostureChanges: boolean;
  exerciseFrequency: string; // Never / Rare / 1x/week / 2-3x/week / Daily
  exerciseDurationMinutes: number;
  sleepHoursPerNight: number;
  sleepQuality: string; // Poor / Fair / Good / Excellent
  jobStressLevel: number; // 0-10
  lifeStressLevel: number; // 0-10
  heavyLiftingFrequency: string; // Never / Rare / Occasional / Frequent
  properLiftingTechnique: boolean;
}

export interface Clinical {
  chiefComplaint: string;
  painOnset: string; // Acute / Insidious / Gradual / Sudden
  painDuration: string; // Acute (<6w) / Subacute (6-12w) / Chronic (>3m)
  painLocation: string;
  painRadiation: boolean;
  painRadiationLocation: string;
  painIntensity: number; // 0-10 VAS
  painFrequency: string; // Constant / Intermittent / Occasional / Rare
  painWorseWith: string;
  painBetterWith: string;
  nightPain: boolean;
  morningStiffness: boolean;
  morningStiffnessMinutes: number;
  disabilityLevel: string; // Minimal / Mild / Moderate / Severe / Disabling
  clinicianDiagnosis: string;
  clinicianNotes: string;
}

export interface Investigations {
  xrayDone: boolean;
  mriDone: boolean;
  mriDiscHerniationLevel: string;
  mriDiscHerniationSeverity: string; // Bulge / Protrusion / Extrusion
  ctDone: boolean;
  ultrasoundDone: boolean;
  esrValue: number;
  crpValue: number;
  notes: string;
}

export interface StartBack {
  rawScore: number; // 0-9
  toolVersion: string;
  riskCategory?: string; // Computed from rawScore
}

export interface BackAssessment {
  demographics: Demographics;
  startBack: StartBack;
  rom: ROM;
  comorbidities: Comorbidities;
  physioExam: PhysioExam;
  lifestyle: Lifestyle;
  clinical: Clinical;
  investigations: Investigations;
}
