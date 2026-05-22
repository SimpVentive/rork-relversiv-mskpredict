export interface DomainConstraint {
  min: number;
  max: number;
}

export interface QuestionConstraint {
  [question: string]: DomainConstraint;
}

export interface AssessmentConfig {
  domains: string[];
  defaultWeights: Record<string, number>;
  constraints: Record<string, DomainConstraint>;
  questions: Record<string, string[]>;
  questionConstraints: Record<string, QuestionConstraint>;
}

export const SHOULDER_ASSESSMENT_CONFIG: AssessmentConfig = {
  domains: ['Severity', 'ROM', 'Rotator Cuff', 'Physio Exam', 'Occupational', 'Comorbidity'],
  defaultWeights: {
    'Severity': 25,
    'ROM': 25,
    'Rotator Cuff': 15,
    'Physio Exam': 15,
    'Occupational': 12,
    'Comorbidity': 8
  },
  constraints: {
    'Severity': { min: 18, max: 40 },
    'ROM': { min: 15, max: 35 },
    'Rotator Cuff': { min: 10, max: 25 },
    'Physio Exam': { min: 12, max: 20 },
    'Occupational': { min: 8, max: 20 },
    'Comorbidity': { min: 5, max: 15 }
  },
  questions: {
    'Severity': ['Pain Level', 'Functional Impact'],
    'ROM': ['Abduction', 'Adduction', 'Internal Rotation', 'External Rotation', 'Horizontal Adduction', 'Horizontal Abduction'],
    'Rotator Cuff': ['Strength', 'Impingement Test'],
    'Physio Exam': ["Neer's Test", "Hawkins Test", 'Drop Arm Test', "O'Brien's Test", 'Tenderness', 'ROM Quality'],
    'Occupational': ['Overhead Work', 'Lifting Frequency']
  },
  questionConstraints: {
    'Severity': { 'Pain Level': { min: 10, max: 25 }, 'Functional Impact': { min: 10, max: 25 } },
    'ROM': {
      'Abduction': { min: 8, max: 20 },
      'Adduction': { min: 8, max: 20 },
      'Internal Rotation': { min: 8, max: 20 },
      'External Rotation': { min: 8, max: 20 },
      'Horizontal Adduction': { min: 8, max: 20 },
      'Horizontal Abduction': { min: 8, max: 20 }
    },
    'Rotator Cuff': { 'Strength': { min: 10, max: 20 }, 'Impingement Test': { min: 10, max: 20 } },
    'Physio Exam': {
      "Neer's Test": { min: 8, max: 18 },
      "Hawkins Test": { min: 8, max: 18 },
      'Drop Arm Test': { min: 8, max: 18 },
      "O'Brien's Test": { min: 8, max: 18 },
      'Tenderness': { min: 8, max: 18 },
      'ROM Quality': { min: 8, max: 18 }
    },
    'Occupational': { 'Overhead Work': { min: 10, max: 20 }, 'Lifting Frequency': { min: 10, max: 20 } }
  }
};

export const ASSESSMENT_CONFIGS: Record<string, AssessmentConfig> = {
  shoulder: SHOULDER_ASSESSMENT_CONFIG,
};

export function getAssessmentConfig(assessmentType: string): AssessmentConfig | null {
  return ASSESSMENT_CONFIGS[assessmentType] || null;
}
