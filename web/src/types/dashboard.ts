export type Condition = 'back' | 'shoulder' | 'knee';
export type Cohort = 'all' | 'back-only' | 'shoulder-only' | 'knee-only' | 'back-shoulder' | 'back-knee' | 'shoulder-knee' | 'all-three';

export interface Metrics {
  totalPatients: number;
  avgAge: number;
  genderSplit: { male: number; female: number };
  avgBMI: number;
  avgStartScore: number;
  avgROM: number;
  avgPain: number;
  comorbidities: number;
  avgPhysioScore: number;
  posSpecialTests: number;
  palpationFindings: number;
  neuroAbnormalities: number;
  totalPredictions: number;
  agreement: number;
  sensitivity: number;
  precision: number;
}

export interface CohortData {
  totalPatients: number;
  breakdown: {
    backOnly: number;
    shoulderOnly: number;
    kneeOnly: number;
    backShoulder: number;
    backKnee: number;
    shoulderKnee: number;
    allThree: number;
  };
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  onClick?: () => void;
  isClickable?: boolean;
}

export interface DrillDetailData {
  title: string;
  metric: string;
  isOpen: boolean;
  data?: any;
}
