export type Gender = 'M' | 'F';
export type ClinicianCall = 'Red' | 'Amber' | 'Green';
export type Goal = 'sensitivity' | 'precision' | 'balanced';
export type ScenarioStatus = 'development' | 'approved' | 'deployed';

export interface RomData {
  flexion: number;
  extension: number;
  leftRotation: number;
  rightRotation: number;
}

export interface PhysioTests {
  slr: boolean;
  fabers: boolean;
  fair: boolean;
  hyperExtension: boolean;
  tendernessOnMuscles: boolean;
  tightness: boolean;
  muscleKnots: boolean;
}

export interface Comorbidities {
  hypertension: boolean;
  diabetic: boolean;
  osteoarthritis: boolean;
  osteoporosis: boolean;
  injury: boolean;
  surgical: boolean;
  thyroid: boolean;
}

export interface Patient {
  sno: number;
  name: string;
  hospital: string;
  age: number;
  gender: Gender;
  bmi: number;
  startScore: number; // 0-9
  rom: RomData;
  physioTests: PhysioTests;
  comorbidities: Comorbidities;
  clinicianCall: ClinicianCall;
}

export interface DomainScores {
  startScore: number; // 0-100
  romScore: number; // 0-100
  physioScore: number; // 0-100
  comorScore: number; // 0-100
  lifestyleScore: number; // 0-100
}

export interface PatientWithScores extends Patient {
  domains: DomainScores;
}

export interface Weights {
  startScore: number;
  rom: number;
  physio: number;
  comorbidities: number;
  lifestyle: number;
}

export interface Thresholds {
  goal: Goal;
  redMin: number;
  amberMin: number;
}

export interface Metrics {
  totalCases: number;
  agreement: number; // %
  sensitivity: number; // %
  precision: number; // %
  accuracy: number; // %
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export interface Prediction {
  patient: Patient;
  domains: DomainScores;
  rpi: number;
  predicted: ClinicianCall;
  match: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  condition: 'back' | 'shoulder' | 'knee';
  goal: Goal;
  weights: Weights;
  metrics: Metrics;
  status: ScenarioStatus;
  createdAt: string;
  createdBy: string;
  description?: string;
}

export const DEFAULT_WEIGHTS: Weights = {
  startScore: 42,
  rom: 20,
  physio: 15,
  comorbidities: 8,
  lifestyle: 15
};

export const THRESHOLDS_MAP: Record<Goal, Thresholds> = {
  sensitivity: { goal: 'sensitivity', redMin: 50, amberMin: 25 },
  precision: { goal: 'precision', redMin: 70, amberMin: 40 },
  balanced: { goal: 'balanced', redMin: 60, amberMin: 35 }
};
