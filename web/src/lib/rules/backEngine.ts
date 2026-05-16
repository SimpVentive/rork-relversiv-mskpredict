import { BackAssessment } from "@/types/backAssessment";
import {
  ClinicalRule,
  FiredRule,
  PredictionResult,
  estimateChronicityWeeks,
  riskBandToCall,
  scoreToRiskBand,
} from "./types";

const backRules: ClinicalRule[] = [
  // Red Flag rules (B-001 to B-004)
  {
    id: "B-001",
    name: "Cauda Equina Syndrome",
    category: "Red Flag",
    description: "Bilateral neurological deficit with severe SLR limitation",
    weight: 40,
    evaluate: (input: BackAssessment) => {
      const hasNeuroDeficit =
        !input.physioExam.sensationIntact ||
        !input.physioExam.strengthNormal ||
        !input.physioExam.reflexesNormal;

      const bilateralSLRSevere =
        input.physioExam.slrLeft.graded === 5 &&
        input.physioExam.slrRight.graded === 5;

      return hasNeuroDeficit && bilateralSLRSevere;
    },
  },

  {
    id: "B-002",
    name: "Significant Neurological Deficit",
    category: "Red Flag",
    description: "Multiple neurological findings indicating nerve root compromise",
    weight: 22,
    evaluate: (input: BackAssessment) => {
      const deficits = [
        !input.physioExam.sensationIntact,
        !input.physioExam.strengthNormal,
        !input.physioExam.reflexesNormal,
      ].filter((x) => x).length;
      return deficits >= 2;
    },
  },

  {
    id: "B-003",
    name: "History of Cancer",
    category: "Red Flag",
    description: "Increased risk of metastatic disease",
    weight: 14,
    evaluate: (input: BackAssessment) => input.comorbidities.cancer,
  },

  {
    id: "B-004",
    name: "Significant Trauma History",
    category: "Red Flag",
    description: "Major trauma increases fracture risk",
    weight: 18,
    evaluate: (input: BackAssessment) =>
      input.clinical.painOnset === "Acute" &&
      input.clinical.painDuration.includes("Acute"),
  },

  // Clinical rules (B-010 to B-023)
  {
    id: "B-010",
    name: "High STarT Back Score",
    category: "Clinical",
    description: "STarT Back tool score ≥ 5 indicates high risk",
    weight: 18,
    evaluate: (input: BackAssessment) => input.startBack.rawScore >= 5,
  },

  {
    id: "B-011",
    name: "Moderate STarT Back Score",
    category: "Clinical",
    description: "STarT Back tool score = 4 indicates moderate risk",
    weight: 10,
    evaluate: (input: BackAssessment) => input.startBack.rawScore === 4,
  },

  {
    id: "B-012",
    name: "Severe Pain Intensity",
    category: "Clinical",
    description: "VAS pain score ≥ 7/10",
    weight: 12,
    evaluate: (input: BackAssessment) => input.clinical.painIntensity >= 7,
  },

  {
    id: "B-013",
    name: "Chronic Pain Duration",
    category: "Clinical",
    description: "Pain lasting > 3 months",
    weight: 14,
    evaluate: (input: BackAssessment) =>
      input.clinical.painDuration.includes("Chronic"),
  },

  {
    id: "B-014",
    name: "Pain Radiation",
    category: "Clinical",
    description: "Radiating pain suggests nerve involvement",
    weight: 10,
    evaluate: (input: BackAssessment) => input.clinical.painRadiation,
  },

  {
    id: "B-015",
    name: "Night Pain",
    category: "Clinical",
    description: "Night pain indicates significant pathology",
    weight: 12,
    evaluate: (input: BackAssessment) => input.clinical.nightPain,
  },

  {
    id: "B-016",
    name: "Morning Stiffness",
    category: "Clinical",
    description: "Morning stiffness ≥ 30 minutes",
    weight: 10,
    evaluate: (input: BackAssessment) =>
      input.clinical.morningStiffness &&
      input.clinical.morningStiffnessMinutes >= 30,
  },

  {
    id: "B-017",
    name: "Severe Disability",
    category: "Clinical",
    description: "Severe or disabling pain",
    weight: 13,
    evaluate: (input: BackAssessment) =>
      input.clinical.disabilityLevel === "Severe" ||
      input.clinical.disabilityLevel === "Disabling",
  },

  {
    id: "B-018",
    name: "Limited Lumbar Flexion",
    category: "Clinical",
    description: "Flexion ROM < 60°",
    weight: 8,
    evaluate: (input: BackAssessment) =>
      input.rom.flexion.angleDegrees < 60,
  },

  {
    id: "B-019",
    name: "Positive SLR Test",
    category: "Clinical",
    description: "SLR positive bilaterally",
    weight: 9,
    evaluate: (input: BackAssessment) =>
      input.physioExam.slrLeft.graded >= 3 ||
      input.physioExam.slrRight.graded >= 3,
  },

  {
    id: "B-020",
    name: "Muscle Tenderness",
    category: "Clinical",
    description: "Marked paraspinal muscle tenderness",
    weight: 6,
    evaluate: (input: BackAssessment) =>
      input.physioExam.muscleTenderness.graded === 5,
  },

  {
    id: "B-021",
    name: "Postural Abnormality",
    category: "Clinical",
    description: "Significant postural abnormality present",
    weight: 7,
    evaluate: (input: BackAssessment) =>
      input.physioExam.lossOfLumbarLordosis ||
      input.physioExam.increasedThoracicKyphosis ||
      input.physioExam.scoliosis,
  },

  {
    id: "B-022",
    name: "MRI Evidence of Disc Extrusion",
    category: "Clinical",
    description: "MRI shows disc extrusion",
    weight: 15,
    evaluate: (input: BackAssessment) =>
      input.investigations.mriDone &&
      input.investigations.mriDiscHerniationSeverity === "Extrusion",
  },

  {
    id: "B-023",
    name: "Facet Joint Tenderness",
    category: "Clinical",
    description: "Facet joint tenderness on palpation",
    weight: 6,
    evaluate: (input: BackAssessment) =>
      input.physioExam.facetJointTenderness,
  },

  {
    id: "B-060",
    name: "Elevated Inflammatory Markers",
    category: "Clinical",
    description: "ESR > 20 or CRP > 10",
    weight: 14,
    evaluate: (input: BackAssessment) =>
      input.investigations.esrValue > 20 ||
      input.investigations.crpValue > 10,
  },

  {
    id: "B-061",
    name: "Sacroiliac Joint Involvement",
    category: "Clinical",
    description: "SIJ tenderness with imaging correlation",
    weight: 8,
    evaluate: (input: BackAssessment) =>
      input.physioExam.sacroiliacJointTenderness,
  },

  {
    id: "B-062",
    name: "Recurrent Episodes",
    category: "Clinical",
    description: "Previous back injury or surgery",
    weight: 9,
    evaluate: (input: BackAssessment) =>
      input.comorbidities.previousBackInjury ||
      input.comorbidities.previousBackSurgery,
  },

  {
    id: "B-063",
    name: "Structural Spine Pathology",
    category: "Clinical",
    description: "Osteoarthritis or osteoporosis",
    weight: 11,
    evaluate: (input: BackAssessment) =>
      input.comorbidities.osteoarthritis ||
      input.comorbidities.osteoporosis,
  },

  // Demographic rules (B-030 to B-032)
  {
    id: "B-030",
    name: "Advanced Age",
    category: "Demographic",
    description: "Age > 60 years",
    weight: 7,
    evaluate: (input: BackAssessment) => input.demographics.age > 60,
  },

  {
    id: "B-031",
    name: "Elevated BMI",
    category: "Demographic",
    description: "BMI > 30 (obese)",
    weight: 10,
    evaluate: (input: BackAssessment) => {
      const h = input.demographics.heightCm / 100;
      const bmi =
        h > 0
          ? input.demographics.weightKg / (h * h)
          : 0;
      return bmi > 30;
    },
  },

  {
    id: "B-032",
    name: "Occupational Risk",
    category: "Demographic",
    description: "Sedentary or heavy lifting occupation",
    weight: 6,
    evaluate: (input: BackAssessment) =>
      input.lifestyle.standing5Plus ||
      input.lifestyle.sitting5Plus ||
      input.lifestyle.heavyLiftingFrequency === "Frequent",
  },

  // Lifestyle rules (B-040 to B-047)
  {
    id: "B-040",
    name: "Smoking History",
    category: "Lifestyle",
    description: "Current smoker",
    weight: 8,
    evaluate: (input: BackAssessment) =>
      input.lifestyle.smokingStatus === "Regular" ||
      input.lifestyle.smokingStatus === "Heavy",
  },

  {
    id: "B-041",
    name: "Poor Sleep Quality",
    category: "Lifestyle",
    description: "Sleep quality Poor or Fair",
    weight: 7,
    evaluate: (input: BackAssessment) =>
      input.lifestyle.sleepQuality === "Poor" ||
      input.lifestyle.sleepQuality === "Fair",
  },

  {
    id: "B-042",
    name: "Insufficient Sleep Duration",
    category: "Lifestyle",
    description: "Sleep < 6 hours per night",
    weight: 6,
    evaluate: (input: BackAssessment) =>
      input.lifestyle.sleepHoursPerNight < 6,
  },

  {
    id: "B-043",
    name: "Poor Desk Ergonomics",
    category: "Lifestyle",
    description: "Desk ergonomics Poor or Fair",
    weight: 7,
    evaluate: (input: BackAssessment) =>
      input.lifestyle.deskErgonomics === "Poor" ||
      input.lifestyle.deskErgonomics === "Fair",
  },

  {
    id: "B-044",
    name: "Sedentary Lifestyle",
    category: "Lifestyle",
    description: "Exercise frequency Never or Rare",
    weight: 9,
    evaluate: (input: BackAssessment) =>
      input.lifestyle.exerciseFrequency === "Never" ||
      input.lifestyle.exerciseFrequency === "Rare",
  },

  {
    id: "B-045",
    name: "Frequent Heavy Lifting",
    category: "Lifestyle",
    description: "Frequent heavy lifting with poor technique",
    weight: 10,
    evaluate: (input: BackAssessment) =>
      input.lifestyle.heavyLiftingFrequency === "Frequent" &&
      !input.lifestyle.properLiftingTechnique,
  },

  {
    id: "B-046",
    name: "High Job Stress",
    category: "Lifestyle",
    description: "Job stress level ≥ 7/10",
    weight: 7,
    evaluate: (input: BackAssessment) =>
      input.lifestyle.jobStressLevel >= 7,
  },

  {
    id: "B-047",
    name: "High Life Stress",
    category: "Lifestyle",
    description: "Life stress level ≥ 7/10",
    weight: 8,
    evaluate: (input: BackAssessment) =>
      input.lifestyle.lifeStressLevel >= 7,
  },

  // Psychosocial rules (B-050 to B-052)
  {
    id: "B-050",
    name: "Mental Health Disorder",
    category: "Psychosocial",
    description: "Depression or anxiety disorder",
    weight: 7,
    evaluate: (input: BackAssessment) =>
      input.comorbidities.mentalHealthDisorder,
  },

  {
    id: "B-051",
    name: "Catastrophizing",
    category: "Psychosocial",
    description: "High perceived disability",
    weight: 6,
    evaluate: (input: BackAssessment) =>
      input.clinical.disabilityLevel === "Severe" ||
      input.clinical.disabilityLevel === "Disabling",
  },

  {
    id: "B-052",
    name: "Chronic Comorbidities",
    category: "Psychosocial",
    description: "Multiple chronic conditions",
    weight: 8,
    evaluate: (input: BackAssessment) => {
      const conditions = [
        input.comorbidities.hypertension,
        input.comorbidities.diabetes,
        input.comorbidities.osteoarthritis,
        input.comorbidities.osteoporosis,
        input.comorbidities.rheumatoidArthritis,
      ].filter((x) => x).length;
      return conditions >= 2;
    },
  },
];

export function evaluateBack(
  input: BackAssessment
): PredictionResult {
  const firedRules: FiredRule[] = [];
  let rawScore = 0;

  for (const rule of backRules) {
    if (rule.evaluate(input)) {
      firedRules.push({
        rule,
        evidence: generateBackEvidence(rule.id, input),
      });
      rawScore += rule.weight;
    }
  }

  rawScore = Math.min(rawScore, 100);
  const band = scoreToRiskBand(rawScore);
  const predictedCall = riskBandToCall(band);
  const chronicityWeeks = estimateChronicityWeeks(input.clinical.painDuration);

  return {
    id: `back-${Date.now()}`,
    createdAt: new Date(),
    region: "back",
    score: rawScore,
    band,
    firedRules,
    chronicityWeeks,
    predictedCall,
  };
}

function generateBackEvidence(ruleId: string, input: BackAssessment): string {
  const evidenceMap: Record<string, string> = {
    "B-001": `Bilateral SLR graded ${Math.max(input.physioExam.slrLeft.graded, input.physioExam.slrRight.graded)}/5 with neurological deficit`,
    "B-002": `Multiple neurological findings (sensation: ${input.physioExam.sensationIntact ? "intact" : "impaired"}, strength: ${input.physioExam.strengthNormal ? "normal" : "weak"}, reflexes: ${input.physioExam.reflexesNormal ? "normal" : "abnormal"})`,
    "B-003": "History of cancer documented",
    "B-004": `Acute pain onset (${input.clinical.painOnset}) with ${input.clinical.painDuration}`,
    "B-010": `STarT Back score ${input.startBack.rawScore}/9 (≥5: high risk)`,
    "B-011": `STarT Back score ${input.startBack.rawScore}/9 (=4: moderate risk)`,
    "B-012": `Pain intensity ${input.clinical.painIntensity}/10 (≥7)`,
    "B-013": `Chronic pain duration (${input.clinical.painDuration})`,
    "B-014": `Pain radiating to ${input.clinical.painRadiationLocation}`,
    "B-015": "Night pain reported",
    "B-016": `Morning stiffness ${input.clinical.morningStiffnessMinutes} minutes (≥30)`,
    "B-017": `Disability level: ${input.clinical.disabilityLevel}`,
    "B-018": `Lumbar flexion ${input.rom.flexion.angleDegrees}° (<60°)`,
    "B-019": `SLR test: L ${input.physioExam.slrLeft.graded}/5, R ${input.physioExam.slrRight.graded}/5`,
    "B-020": `Paraspinal muscle tenderness graded ${input.physioExam.muscleTenderness.graded}/5`,
    "B-021": `Postural abnormality: ${input.physioExam.lossOfLumbarLordosis ? "loss of lordosis " : ""}${input.physioExam.increasedThoracicKyphosis ? "increased kyphosis " : ""}${input.physioExam.scoliosis ? "scoliosis" : ""}`,
    "B-022": `MRI: disc ${input.investigations.mriDiscHerniationSeverity} at ${input.investigations.mriDiscHerniationLevel}`,
    "B-023": "Facet joint tenderness on palpation",
    "B-060": `Elevated markers: ESR ${input.investigations.esrValue}, CRP ${input.investigations.crpValue}`,
    "B-061": "SIJ tenderness confirmed",
    "B-062": `Previous back injury: ${input.comorbidities.previousBackInjury}, surgery: ${input.comorbidities.previousBackSurgery}`,
    "B-063": `Structural pathology: OA ${input.comorbidities.osteoarthritis}, OP ${input.comorbidities.osteoporosis}`,
    "B-030": `Age ${input.demographics.age} (>60)`,
    "B-031": `BMI ${(input.demographics.weightKg / Math.pow(input.demographics.heightCm / 100, 2)).toFixed(1)} (>30)`,
    "B-032": `Occupational risk: standing ${input.lifestyle.standing5Plus}, sitting ${input.lifestyle.sitting5Plus}, lifting ${input.lifestyle.heavyLiftingFrequency}`,
    "B-040": `Smoking status: ${input.lifestyle.smokingStatus}`,
    "B-041": `Sleep quality: ${input.lifestyle.sleepQuality}`,
    "B-042": `Sleep ${input.lifestyle.sleepHoursPerNight}h/night (<6h)`,
    "B-043": `Desk ergonomics: ${input.lifestyle.deskErgonomics}`,
    "B-044": `Exercise frequency: ${input.lifestyle.exerciseFrequency}`,
    "B-045": `Heavy lifting: ${input.lifestyle.heavyLiftingFrequency}, technique: ${input.lifestyle.properLiftingTechnique ? "proper" : "poor"}`,
    "B-046": `Job stress ${input.lifestyle.jobStressLevel}/10 (≥7)`,
    "B-047": `Life stress ${input.lifestyle.lifeStressLevel}/10 (≥7)`,
    "B-050": "Mental health disorder present",
    "B-051": `High perceived disability: ${input.clinical.disabilityLevel}`,
    "B-052": `Multiple chronic comorbidities: ${[input.comorbidities.hypertension && "HTN", input.comorbidities.diabetes && "DM", input.comorbidities.osteoarthritis && "OA", input.comorbidities.osteoporosis && "OP", input.comorbidities.rheumatoidArthritis && "RA"].filter(Boolean).join(", ")}`,
  };

  return evidenceMap[ruleId] || "Rule fired";
}
