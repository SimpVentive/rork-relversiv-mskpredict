export type AssessmentCondition = 'back' | 'shoulder' | 'knee';
export type TierLevel = 'Red' | 'Amber' | 'Green';
export type Gender = 'M' | 'F' | 'Other';

export interface Assessment {
  id: string;
  patientId: string;
  patientName: string;
  condition: AssessmentCondition;
  assessmentDate: string; // ISO format
  age: number;
  gender: Gender;
  hospital: string;
  clinicianTier: TierLevel;
  modelTier: TierLevel;
  agreement: boolean;
  rpiScore: number;
  // Condition-specific fields
  startScore?: number; // Back only
  romFlexion?: number;
  physioScore: number;
  painIntensity: number;
  // Additional detail fields for modal
  bmi?: number;
  romExtension?: number;
  specialTests?: string[];
  comorbidities?: string[];
  clinicianDiagnosis?: string;
}

export interface TableState {
  data: Assessment[];
  sortBy: keyof Assessment;
  sortOrder: 'asc' | 'desc';
  filterCondition: 'all' | AssessmentCondition;
  searchTerm: string;
  anonymized: boolean;
  selectedRow: Assessment | null;
}

export interface FilterOptions {
  condition: 'all' | AssessmentCondition;
  searchTerm: string;
  anonymized: boolean;
}

export interface SortOptions {
  by: keyof Assessment;
  order: 'asc' | 'desc';
}
