import { ShoulderAssessment } from "@/types/shoulderAssessment";
import {
  ClinicalRule,
  FiredRule,
  PredictionResult,
  estimateChronicityWeeks,
  riskBandToCall,
  scoreToRiskBand,
} from "./types";

const shoulderRules: ClinicalRule[] = [
  // Red Flag rules (S-001 to S-004)
  {
    id: "S-001",
    name: "Severe Neurological Compromise",
    category: "Red Flag",
    description: "Significant nerve root or brachial plexus involvement",
    weight: 25,
    evaluate: (input: ShoulderAssessment) =>
      !input.physioExam.sensationIntact &&
      !input.physioExam.strengthNormal,
  },

  {
    id: "S-002",
    name: "Acute Severe Injury",
    category: "Red Flag",
    description: "Acute traumatic injury with severe findings",
    weight: 18,
    evaluate: (input: ShoulderAssessment) =>
      input.shoulderPain.painOnset === "Acute" &&
      input.shoulderPain.painIntensity >= 8,
  },

  {
    id: "S-003",
    name: "History of Cancer",
    category: "Red Flag",
    description: "Increased risk of metastatic disease",
    weight: 14,
    evaluate: () => false, // Not evaluated in this dataset
  },

  {
    id: "S-004",
    name: "Full-Thickness Rotator Cuff Tear",
    category: "Red Flag",
    description: "Positive drop arm test indicates severe cuff tear",
    weight: 20,
    evaluate: (input: ShoulderAssessment) =>
      input.physioExam.dropArm.graded === 5,
  },

  // Clinical rules (S-010 to S-025)
  {
    id: "S-010",
    name: "Severe Pain Intensity",
    category: "Clinical",
    description: "VAS pain score ≥ 7/10",
    weight: 12,
    evaluate: (input: ShoulderAssessment) =>
      input.shoulderPain.painIntensity >= 7,
  },

  {
    id: "S-011",
    name: "Chronic Pain Duration",
    category: "Clinical",
    description: "Pain lasting > 3 months",
    weight: 13,
    evaluate: (input: ShoulderAssessment) =>
      input.shoulderPain.painDuration.includes("Chronic"),
  },

  {
    id: "S-012",
    name: "High Functional Limitation",
    category: "Clinical",
    description: "Functional limitation score ≥ 6/10",
    weight: 14,
    evaluate: (input: ShoulderAssessment) =>
      input.shoulderPain.functionalLimitation >= 6,
  },

  {
    id: "S-013",
    name: "Night Pain",
    category: "Clinical",
    description: "Night pain reported",
    weight: 11,
    evaluate: (input: ShoulderAssessment) =>
      input.shoulderPain.nightPain,
  },

  {
    id: "S-014",
    name: "Pain Radiation",
    category: "Clinical",
    description: "Pain radiating to arm/neck",
    weight: 10,
    evaluate: (input: ShoulderAssessment) =>
      input.shoulderPain.painRadiation,
  },

  {
    id: "S-015",
    name: "Impingement Syndrome",
    category: "Clinical",
    description: "Positive Hawkins-Kennedy or Neer impingement test",
    weight: 13,
    evaluate: (input: ShoulderAssessment) =>
      input.physioExam.hawkinsKennedy.graded >= 3 ||
      input.physioExam.impingementTest.graded >= 3,
  },

  {
    id: "S-016",
    name: "Labral Pathology",
    category: "Clinical",
    description: "Positive O'Brien active compression test",
    weight: 11,
    evaluate: (input: ShoulderAssessment) =>
      input.physioExam.obrien.graded >= 3,
  },

  {
    id: "S-017",
    name: "Rotator Cuff Weakness",
    category: "Clinical",
    description: "Rotator cuff MMT ≤ 3/5",
    weight: 14,
    evaluate: (input: ShoulderAssessment) => {
      const minStrength = Math.min(
        input.physioExam.supraspinatusStrength,
        input.physioExam.infraspinatusStrength,
        input.physioExam.subscapularisStrength
      );
      return minStrength <= 3;
    },
  },

  {
    id: "S-018",
    name: "Muscle Tenderness",
    category: "Clinical",
    description: "Marked rotator cuff muscle tenderness",
    weight: 7,
    evaluate: (input: ShoulderAssessment) =>
      input.physioExam.muscleTenderness.graded === 5,
  },

  {
    id: "S-019",
    name: "Limited External Rotation",
    category: "Clinical",
    description: "External rotation at side < 30°",
    weight: 9,
    evaluate: (input: ShoulderAssessment) =>
      input.rom.externalRotationAtSide.angleDegrees < 30,
  },

  {
    id: "S-020",
    name: "Limited Abduction",
    category: "Clinical",
    description: "Abduction ROM < 90°",
    weight: 8,
    evaluate: (input: ShoulderAssessment) =>
      input.rom.abduction.angleDegrees < 90,
  },

  {
    id: "S-021",
    name: "Postural Abnormality",
    category: "Clinical",
    description: "Forward head posture or rounded shoulders",
    weight: 7,
    evaluate: (input: ShoulderAssessment) =>
      input.physioExam.forwardHeadPosture ||
      input.physioExam.roundedShoulders ||
      input.physioExam.scapularWinging,
  },

  {
    id: "S-022",
    name: "MRI Evidence of Rotator Cuff Tear",
    category: "Clinical",
    description: "MRI shows rotator cuff pathology",
    weight: 16,
    evaluate: (input: ShoulderAssessment) =>
      input.investigations.mriDone &&
      (input.investigations.mriRotatorCuffFindings.includes("tear") ||
        input.investigations.mriRotatorCuffFindings.includes("Tear") ||
        input.investigations.mriRotatorCuffFindings.includes("tendinopathy")),
  },

  {
    id: "S-023",
    name: "MRI Evidence of Labral Tear",
    category: "Clinical",
    description: "MRI shows SLAP or Bankart lesion",
    weight: 12,
    evaluate: (input: ShoulderAssessment) =>
      input.investigations.mriDone &&
      (input.investigations.mriLabralFindings.includes("SLAP") ||
        input.investigations.mriLabralFindings.includes("Bankart") ||
        input.investigations.mriLabralFindings.length > 0),
  },

  {
    id: "S-024",
    name: "Elevated Inflammatory Markers",
    category: "Clinical",
    description: "ESR > 20 or CRP > 10",
    weight: 10,
    evaluate: (input: ShoulderAssessment) =>
      input.investigations.esrValue > 20 ||
      input.investigations.crpValue > 10,
  },

  {
    id: "S-025",
    name: "Previous Shoulder Surgery",
    category: "Clinical",
    description: "History of shoulder surgery",
    weight: 8,
    evaluate: (input: ShoulderAssessment) =>
      input.comorbidities.previousShoulderSurgery,
  },

  // Demographic rules (S-030 to S-032)
  {
    id: "S-030",
    name: "Advanced Age",
    category: "Demographic",
    description: "Age > 50 years (higher cuff tear risk)",
    weight: 8,
    evaluate: (input: ShoulderAssessment) =>
      input.demographics.age > 50,
  },

  {
    id: "S-031",
    name: "Elevated BMI",
    category: "Demographic",
    description: "BMI > 30 (obese)",
    weight: 6,
    evaluate: (input: ShoulderAssessment) => {
      const h = input.demographics.heightCm / 100;
      const bmi =
        h > 0
          ? input.demographics.weightKg / (h * h)
          : 0;
      return bmi > 30;
    },
  },

  {
    id: "S-032",
    name: "Male Gender",
    category: "Demographic",
    description: "Male gender (higher rotator cuff tear risk)",
    weight: 5,
    evaluate: (input: ShoulderAssessment) =>
      input.demographics.gender.toLowerCase() === "male",
  },

  // Lifestyle rules (S-040 to S-048)
  {
    id: "S-040",
    name: "High Overhead Work",
    category: "Lifestyle",
    description: "Overhead work ≥ 4 hours/day",
    weight: 11,
    evaluate: (input: ShoulderAssessment) =>
      input.lifestyle.overheadWorkHoursPerDay >= 4,
  },

  {
    id: "S-041",
    name: "Frequent Heavy Lifting",
    category: "Lifestyle",
    description: "Frequent lifting of heavy loads",
    weight: 10,
    evaluate: (input: ShoulderAssessment) =>
      input.lifestyle.liftingFrequency === "Frequent" ||
      input.lifestyle.liftingFrequency === "Constant",
  },

  {
    id: "S-042",
    name: "Repetitive Arm Motion",
    category: "Lifestyle",
    description: "Repetitive arm motion activities",
    weight: 9,
    evaluate: (input: ShoulderAssessment) =>
      input.lifestyle.repetitiveArmMotion,
  },

  {
    id: "S-043",
    name: "Throwing Activities",
    category: "Lifestyle",
    description: "Regular throwing or overhead sports",
    weight: 10,
    evaluate: (input: ShoulderAssessment) =>
      input.lifestyle.throwingActivities ||
      (input.lifestyle.sportsParticipation &&
        (input.lifestyle.sportType.includes("baseball") ||
          input.lifestyle.sportType.includes("tennis") ||
          input.lifestyle.sportType.includes("volleyball"))),
  },

  {
    id: "S-044",
    name: "Poor Ergonomics",
    category: "Lifestyle",
    description: "Inappropriate desk/keyboard height or position",
    weight: 8,
    evaluate: (input: ShoulderAssessment) =>
      !input.lifestyle.deskHeightAppropriate ||
      !input.lifestyle.keyboardPositionAppropriate ||
      !input.lifestyle.mousePositionAppropriate ||
      !input.lifestyle.monitorHeightAppropriate ||
      input.lifestyle.chairArmrestHeight === "Too low" ||
      input.lifestyle.chairArmrestHeight === "Too high",
  },

  {
    id: "S-045",
    name: "Sedentary Lifestyle",
    category: "Lifestyle",
    description: "Exercise frequency Never or Rare",
    weight: 7,
    evaluate: (input: ShoulderAssessment) =>
      input.lifestyle.exerciseFrequency === "Never" ||
      input.lifestyle.exerciseFrequency === "Rare",
  },

  {
    id: "S-046",
    name: "Poor Sleep Quality",
    category: "Lifestyle",
    description: "Sleep quality Poor or Fair, or affected by shoulder pain",
    weight: 8,
    evaluate: (input: ShoulderAssessment) =>
      input.lifestyle.sleepQuality === "Poor" ||
      input.lifestyle.sleepQuality === "Fair" ||
      input.lifestyle.shoulderPainAffectsSleep,
  },

  {
    id: "S-047",
    name: "High Job Stress",
    category: "Lifestyle",
    description: "Job stress level ≥ 7/10",
    weight: 6,
    evaluate: (input: ShoulderAssessment) =>
      input.lifestyle.jobStressLevel >= 7,
  },

  {
    id: "S-048",
    name: "Smoking History",
    category: "Lifestyle",
    description: "Current smoker",
    weight: 7,
    evaluate: (input: ShoulderAssessment) =>
      input.lifestyle.smokingStatus === "Regular" ||
      input.lifestyle.smokingStatus === "Heavy",
  },

  // Psychosocial rules (S-050 to S-052)
  {
    id: "S-050",
    name: "Mental Health Disorder",
    category: "Psychosocial",
    description: "Depression or anxiety disorder",
    weight: 6,
    evaluate: (input: ShoulderAssessment) =>
      input.comorbidities.mentalHealthDisorder,
  },

  {
    id: "S-051",
    name: "Severe Disability",
    category: "Psychosocial",
    description: "High perceived disability level",
    weight: 7,
    evaluate: (input: ShoulderAssessment) =>
      input.clinical.disabilityLevel === "Severe" ||
      input.clinical.disabilityLevel === "Disabling",
  },

  {
    id: "S-052",
    name: "Chronic Comorbidities",
    category: "Psychosocial",
    description: "Multiple chronic conditions",
    weight: 7,
    evaluate: (input: ShoulderAssessment) => {
      const conditions = [
        input.comorbidities.diabetes,
        input.comorbidities.rheumatoidArthritis,
        input.comorbidities.osteoarthritis,
      ].filter((x) => x).length;
      return conditions >= 2;
    },
  },
];

export function evaluateShoulder(
  input: ShoulderAssessment
): PredictionResult {
  const firedRules: FiredRule[] = [];
  let rawScore = 0;

  for (const rule of shoulderRules) {
    if (rule.evaluate(input)) {
      firedRules.push({
        rule,
        evidence: generateShoulderEvidence(rule.id, input),
      });
      rawScore += rule.weight;
    }
  }

  rawScore = Math.min(rawScore, 100);
  const band = scoreToRiskBand(rawScore);
  const predictedCall = riskBandToCall(band);
  const chronicityWeeks = estimateChronicityWeeks(
    input.shoulderPain.painDuration
  );

  return {
    id: `shoulder-${Date.now()}`,
    createdAt: new Date(),
    region: "shoulder",
    score: rawScore,
    band,
    firedRules,
    chronicityWeeks,
    predictedCall,
  };
}

function generateShoulderEvidence(
  ruleId: string,
  input: ShoulderAssessment
): string {
  const evidenceMap: Record<string, string> = {
    "S-001": "Neurological compromise: sensation impaired and weakness present",
    "S-002": `Acute severe injury with pain intensity ${input.shoulderPain.painIntensity}/10`,
    "S-003": "History of cancer (not evaluated)",
    "S-004": "Drop arm test positive (full-thickness tear suspected)",
    "S-010": `Pain intensity ${input.shoulderPain.painIntensity}/10 (≥7)`,
    "S-011": `Chronic pain duration (${input.shoulderPain.painDuration})`,
    "S-012": `Functional limitation ${input.shoulderPain.functionalLimitation}/10 (≥6)`,
    "S-013": "Night pain affecting sleep",
    "S-014": `Pain radiating to ${input.shoulderPain.painRadiationLocation}`,
    "S-015": `Impingement: Hawkins-Kennedy ${input.physioExam.hawkinsKennedy.graded}/5, Neer ${input.physioExam.impingementTest.graded}/5`,
    "S-016": `O'Brien test ${input.physioExam.obrien.graded}/5 (labral pathology)`,
    "S-017": `Rotator cuff weakness: Supraspin ${input.physioExam.supraspinatusStrength}/5, Infraspin ${input.physioExam.infraspinatusStrength}/5, Subscap ${input.physioExam.subscapularisStrength}/5`,
    "S-018": `Muscle tenderness graded ${input.physioExam.muscleTenderness.graded}/5`,
    "S-019": `External rotation at side ${input.rom.externalRotationAtSide.angleDegrees}° (<30°)`,
    "S-020": `Abduction ROM ${input.rom.abduction.angleDegrees}° (<90°)`,
    "S-021": `Postural abnormality: FHP ${input.physioExam.forwardHeadPosture}, rounded shoulders ${input.physioExam.roundedShoulders}, scapular winging ${input.physioExam.scapularWinging}`,
    "S-022": `MRI rotator cuff findings: ${input.investigations.mriRotatorCuffFindings}`,
    "S-023": `MRI labral findings: ${input.investigations.mriLabralFindings}`,
    "S-024": `Elevated markers: ESR ${input.investigations.esrValue}, CRP ${input.investigations.crpValue}`,
    "S-025": "Previous shoulder surgery",
    "S-030": `Age ${input.demographics.age} (>50)`,
    "S-031": `BMI ${(input.demographics.weightKg / Math.pow(input.demographics.heightCm / 100, 2)).toFixed(1)} (>30)`,
    "S-032": `Gender ${input.demographics.gender}`,
    "S-040": `Overhead work ${input.lifestyle.overheadWorkHoursPerDay}h/day (≥4)`,
    "S-041": `Lifting frequency: ${input.lifestyle.liftingFrequency} (${input.lifestyle.liftingWeightKg}kg)`,
    "S-042": `Repetitive arm motion: ${input.lifestyle.repetitiveArmMotion}`,
    "S-043": `Throwing activities: ${input.lifestyle.throwingActivities}, sports: ${input.lifestyle.sportsParticipation ? input.lifestyle.sportType : "none"}`,
    "S-044": `Ergonomics: desk ${input.lifestyle.deskHeightAppropriate}, keyboard ${input.lifestyle.keyboardPositionAppropriate}, mouse ${input.lifestyle.mousePositionAppropriate}, monitor ${input.lifestyle.monitorHeightAppropriate}`,
    "S-045": `Exercise frequency: ${input.lifestyle.exerciseFrequency}`,
    "S-046": `Sleep quality: ${input.lifestyle.sleepQuality}, affected by pain: ${input.lifestyle.shoulderPainAffectsSleep}`,
    "S-047": `Job stress ${input.lifestyle.jobStressLevel}/10 (≥7)`,
    "S-048": `Smoking status: ${input.lifestyle.smokingStatus}`,
    "S-050": "Mental health disorder present",
    "S-051": `High disability: ${input.clinical.disabilityLevel}`,
    "S-052": `Multiple comorbidities: ${[input.comorbidities.diabetes && "DM", input.comorbidities.rheumatoidArthritis && "RA", input.comorbidities.osteoarthritis && "OA"].filter(Boolean).join(", ")}`,
  };

  return evidenceMap[ruleId] || "Rule fired";
}
