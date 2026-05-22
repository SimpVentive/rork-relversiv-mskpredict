import { SHOULDER_ASSESSMENT_CONFIG, type AssessmentConfig } from './assessmentConfigs';

// Convert AssessmentConfig to weight and sub_weights format for storage
export function assessmentConfigToWeights(config: AssessmentConfig) {
  const weights: Record<string, number> = { ...config.defaultWeights };

  const sub_weights: Record<string, Record<string, number>> = {};

  for (const [domain, questions] of Object.entries(config.questions)) {
    const questionWeights: Record<string, number> = {};
    const constraints = config.questionConstraints[domain] || {};

    // Distribute weights evenly among questions in each domain
    const domainWeight = weights[domain] || 0;
    const questionsCount = questions.length;
    const baseWeight = questionsCount > 0 ? domainWeight / questionsCount : 0;

    for (const question of questions) {
      const constraint = constraints[question];
      if (constraint) {
        // Use the midpoint of the constraint range
        questionWeights[question] = (constraint.min + constraint.max) / 2;
      } else {
        questionWeights[question] = baseWeight;
      }
    }

    sub_weights[domain] = questionWeights;
  }

  return { weights, sub_weights };
}

// Create a default weight config for shoulder assessment
export function createShoulderWeightConfig(name: string = 'Shoulder Assessment Default', site: string = 'ALL', isDefault: boolean = false) {
  const { weights, sub_weights } = assessmentConfigToWeights(SHOULDER_ASSESSMENT_CONFIG);

  return {
    name,
    site,
    is_default: isDefault,
    weights,
    sub_weights,
    tga: 50, // Threshold for Amber (can be adjusted)
    tar: 75, // Threshold for Red (can be adjusted)
  };
}

// Validate assessment config weights
export function validateAssessmentConfig(config: AssessmentConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check that all domains have weights
  for (const domain of config.domains) {
    if (!(domain in config.defaultWeights)) {
      errors.push(`Domain '${domain}' missing from defaultWeights`);
    }
    if (!(domain in config.constraints)) {
      errors.push(`Domain '${domain}' missing from constraints`);
    }
    if (!(domain in config.questions)) {
      errors.push(`Domain '${domain}' missing from questions`);
    }
    if (!(domain in config.questionConstraints)) {
      errors.push(`Domain '${domain}' missing from questionConstraints`);
    }
  }

  // Check weight sums
  const totalWeight = Object.values(config.defaultWeights).reduce((a, b) => a + b, 0);
  if (Math.abs(totalWeight - 100) > 0.01) {
    errors.push(`Total defaultWeights should sum to 100, got ${totalWeight}`);
  }

  // Check that constraints are valid ranges
  for (const [domain, constraint] of Object.entries(config.constraints)) {
    if (constraint.min > constraint.max) {
      errors.push(`Domain '${domain}' constraint: min (${constraint.min}) > max (${constraint.max})`);
    }
  }

  return { valid: errors.length === 0, errors };
}
