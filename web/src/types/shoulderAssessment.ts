import { Demographics, GradedFinding, ROMComponent, Comorbidities, Lifestyle } from "./backAssessment";

export interface ShoulderPain {
  painIntensity: number; // 0-10
  painOnset: string;
  painDuration: string;
  painLocation: string; // Anterior/Lateral/Posterior/Superior/Bilateral
  painRadiation: boolean;
  painRadiationLocation: string;
  painFrequency: string;
  painWorseWith: string;
  painBetterWith: string;
  nightPain: boolean;
  functionalLimitation: number; // 0-10
}

export interface ShoulderROM {
  flexion: ROMComponent;
  abduction: ROMComponent;
  externalRotationAtSide: ROMComponent;
  internalRotationAtSide: ROMComponent;
  externalRotation90Abducted: ROMComponent;
  horizontalAdduction: ROMComponent;
  measurementTool: string;
  notes: string;
}

export interface ShoulderPhysioExam {
  impingementTest: GradedFinding;
  hawkinsKennedy: GradedFinding;
  obrien: GradedFinding;
  dropArm: GradedFinding;
  supraspinatusStrength: number; // 0-5
  infraspinatusStrength: number; // 0-5
  subscapularisStrength: number; // 0-5
  muscleTenderness: GradedFinding;
  muscleTightness: GradedFinding;
  muscleSpasm: GradedFinding;
  forwardHeadPosture: boolean;
  roundedShoulders: boolean;
  scapularWinging: boolean;
  posturalAsymmetry: string;
  sensationIntact: boolean;
  strengthNormal: boolean;
  examNotes: string;
}

export interface ShoulderComorbidities {
  hypertension: boolean;
  diabetes: boolean;
  osteoarthritis: boolean;
  osteoporosis: boolean;
  previousShoulderInjury: boolean;
  previousShoulderSurgery: boolean;
  thyroidDisorder: boolean;
  rheumatoidArthritis: boolean;
  mentalHealthDisorder: boolean;
  notes: string;
}

export interface ShoulderLifestyle {
  smokingStatus: string;
  cigarettesPerDay: number;
  packYears: number;
  alcoholStatus: string;
  drinksPerWeek: number;
  overheadWorkHoursPerDay: number;
  liftingFrequency: string; // Never/Rare/Occasional/Frequent/Constant
  liftingWeightKg: number;
  repetitiveArmMotion: boolean;
  throwingActivities: boolean;
  keyboardUseHoursPerDay: number;
  deskHeightAppropriate: boolean;
  chairArmrestHeight: string; // Too low / Appropriate / Too high
  keyboardPositionAppropriate: boolean;
  mousePositionAppropriate: boolean;
  monitorHeightAppropriate: boolean;
  frequentPostureChanges: boolean;
  exerciseFrequency: string;
  exerciseType: string;
  shoulderSpecificExercise: boolean;
  exerciseDurationMinutes: number;
  sleepHoursPerNight: number;
  sleepQuality: string;
  sleepPosition: string;
  shoulderPainAffectsSleep: boolean;
  jobStressLevel: number;
  lifeStressLevel: number;
  sportsParticipation: boolean;
  sportType: string;
  sportFrequency: string;
}

export interface ShoulderClinical {
  chiefComplaint: string;
  shoulderAffected: string; // Left / Right / Bilateral
  disabilityLevel: string;
  clickingClunking: boolean;
  catchingSensation: boolean;
  instabilityFeeling: boolean;
  muscleWeakness: boolean;
  numbnessTingling: boolean;
  clinicianDiagnosis: string;
  suspectedPathology: string;
  clinicianNotes: string;
}

export interface ShoulderInvestigations {
  xrayDone: boolean;
  xrayFindings: string;
  mriDone: boolean;
  mriFindings: string;
  mriRotatorCuffFindings: string;
  mriLabralFindings: string;
  ultrasoundDone: boolean;
  ultrasoundFindings: string;
  esrValue: number;
  crpValue: number;
  notes: string;
}

export interface ShoulderAssessment {
  demographics: Demographics;
  shoulderPain: ShoulderPain;
  rom: ShoulderROM;
  physioExam: ShoulderPhysioExam;
  comorbidities: ShoulderComorbidities;
  lifestyle: ShoulderLifestyle;
  clinical: ShoulderClinical;
  investigations: ShoulderInvestigations;
}
