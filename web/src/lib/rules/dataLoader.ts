import { Patient, PatientWithScores, DomainScores } from '@/types/rulesEngine';
import { mockPatientsRaw } from '@/data/mockPatientsForRulesEngine';

/**
 * Normalize Start Score to 0-100 scale
 * Raw score is 0-9, multiply by 11.11 to get 0-100
 */
export function normalizeStartScore(rawScore: number): number {
  return Math.min(100, Math.max(0, (rawScore / 9) * 100));
}

/**
 * Normalize ROM Score to 0-100 scale
 * Average the 4 ROM angles, normalize to 0-100 (ideal is 90°, 30°, 40°, 40°)
 */
export function normalizeRomScore(flexion: number, extension: number, leftRotation: number, rightRotation: number): number {
  const maxFlexion = 90;
  const maxExtension = 30;
  const maxRotation = 45;

  const flexionScore = Math.min(100, (flexion / maxFlexion) * 100);
  const extensionScore = Math.min(100, (extension / maxExtension) * 100);
  const leftRotationScore = Math.min(100, (leftRotation / maxRotation) * 100);
  const rightRotationScore = Math.min(100, (rightRotation / maxRotation) * 100);

  const average = (flexionScore + extensionScore + leftRotationScore + rightRotationScore) / 4;
  return Math.min(100, Math.max(0, average));
}

/**
 * Normalize Physiotherapy Tests Score to 0-100 scale
 * Count positive tests out of 7 and convert to percentage
 */
export function normalizePhysioScore(physioTests: {
  slr: boolean;
  fabers: boolean;
  fair: boolean;
  hyperExtension: boolean;
  tendernessOnMuscles: boolean;
  tightness: boolean;
  muscleKnots: boolean;
}): number {
  const positivTests = Object.values(physioTests).filter(v => v === true).length;
  return (positivTests / 7) * 100;
}

/**
 * Normalize Comorbidities Score to 0-100 scale
 * Count comorbidity conditions out of 7 and convert to percentage
 */
export function normalizeComorScore(comorbidities: {
  hypertension: boolean;
  diabetic: boolean;
  osteoarthritis: boolean;
  osteoporosis: boolean;
  injury: boolean;
  surgical: boolean;
  thyroid: boolean;
}): number {
  const conditionCount = Object.values(comorbidities).filter(v => v === true).length;
  return (conditionCount / 7) * 100;
}

/**
 * Normalize Lifestyle Score to 0-100 scale
 * Default to 50 as no lifestyle data is captured in current assessment
 */
export function normalizeLifestyleScore(): number {
  return 50;
}

/**
 * Calculate domain scores for a single patient
 */
export function calculateDomainScores(patient: Patient): DomainScores {
  return {
    startScore: normalizeStartScore(patient.startScore),
    romScore: normalizeRomScore(
      patient.rom.flexion,
      patient.rom.extension,
      patient.rom.leftRotation,
      patient.rom.rightRotation
    ),
    physioScore: normalizePhysioScore(patient.physioTests),
    comorScore: normalizeComorScore(patient.comorbidities),
    lifestyleScore: normalizeLifestyleScore()
  };
}

/**
 * Load and normalize patient data from raw source
 * Converts array of Patient to array of PatientWithScores
 */
export function loadAndNormalizePatients(): PatientWithScores[] {
  const normalized: PatientWithScores[] = mockPatientsRaw.map(patient => ({
    ...patient,
    domains: calculateDomainScores(patient)
  }));

  // Verify distribution
  const distribution = {
    green: normalized.filter(p => p.clinicianCall === 'Green').length,
    amber: normalized.filter(p => p.clinicianCall === 'Amber').length,
    red: normalized.filter(p => p.clinicianCall === 'Red').length
  };

  console.log(
    `Loaded ${normalized.length} patients: ${distribution.green} Green, ${distribution.amber} Amber, ${distribution.red} Red`
  );

  return normalized;
}

/**
 * Get patient by serial number
 */
export function getPatientBySno(sno: number, patients?: PatientWithScores[]): PatientWithScores | undefined {
  const data = patients || loadAndNormalizePatients();
  return data.find(p => p.sno === sno);
}

/**
 * Filter patients by clinician call
 */
export function filterPatientsByTier(
  tier: 'Green' | 'Amber' | 'Red',
  patients?: PatientWithScores[]
): PatientWithScores[] {
  const data = patients || loadAndNormalizePatients();
  return data.filter(p => p.clinicianCall === tier);
}

/**
 * Get statistics on normalization ranges
 */
export function getNormalizationStats(patients?: PatientWithScores[]): Record<string, { min: number; max: number; avg: number }> {
  const data = patients || loadAndNormalizePatients();

  const stats = {
    startScore: { min: 100, max: 0, avg: 0 },
    romScore: { min: 100, max: 0, avg: 0 },
    physioScore: { min: 100, max: 0, avg: 0 },
    comorScore: { min: 100, max: 0, avg: 0 },
    lifestyleScore: { min: 100, max: 0, avg: 0 }
  };

  let sumStart = 0, sumRom = 0, sumPhysio = 0, sumComor = 0, sumLifestyle = 0;

  data.forEach(p => {
    // Start Score
    stats.startScore.min = Math.min(stats.startScore.min, p.domains.startScore);
    stats.startScore.max = Math.max(stats.startScore.max, p.domains.startScore);
    sumStart += p.domains.startScore;

    // ROM Score
    stats.romScore.min = Math.min(stats.romScore.min, p.domains.romScore);
    stats.romScore.max = Math.max(stats.romScore.max, p.domains.romScore);
    sumRom += p.domains.romScore;

    // Physio Score
    stats.physioScore.min = Math.min(stats.physioScore.min, p.domains.physioScore);
    stats.physioScore.max = Math.max(stats.physioScore.max, p.domains.physioScore);
    sumPhysio += p.domains.physioScore;

    // Comor Score
    stats.comorScore.min = Math.min(stats.comorScore.min, p.domains.comorScore);
    stats.comorScore.max = Math.max(stats.comorScore.max, p.domains.comorScore);
    sumComor += p.domains.comorScore;

    // Lifestyle Score
    stats.lifestyleScore.min = Math.min(stats.lifestyleScore.min, p.domains.lifestyleScore);
    stats.lifestyleScore.max = Math.max(stats.lifestyleScore.max, p.domains.lifestyleScore);
    sumLifestyle += p.domains.lifestyleScore;
  });

  const count = data.length;
  stats.startScore.avg = sumStart / count;
  stats.romScore.avg = sumRom / count;
  stats.physioScore.avg = sumPhysio / count;
  stats.comorScore.avg = sumComor / count;
  stats.lifestyleScore.avg = sumLifestyle / count;

  return stats;
}
