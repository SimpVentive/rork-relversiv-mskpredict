'use client';

import { useState, useEffect, useMemo } from 'react';

// Types
type Condition = 'back' | 'shoulder' | 'knee';
type ClinicianTier = 'Red' | 'Amber' | 'Green';

interface Assessment {
  id: string;
  age: number;
  gender: 'M' | 'F';
  htn: boolean;
  rpiScore: number;
  clinicianTier: ClinicianTier;
}

interface Metrics {
  precision: number;
  sensitivity: number;
  accuracy: number;
  agreement: { correct: number; total: number };
  tierBreakdown: Record<ClinicianTier, { correct: number; clinicianCalls: number; predicted: number }>;
}

interface Threshold {
  tga: number;
  tar: number;
}

interface DomainConstraint {
  min: number;
  max: number;
}

interface SavedScenario {
  id: string;
  name: string;
  date: string;
  weights: Record<string, number>;
  constraints: Record<string, DomainConstraint>;
  metrics: Metrics;
  thresholds: Threshold;
  goal: 'precision' | 'sensitivity' | 'accuracy';
  assessmentCount: number;
}

// Domain structures for each condition
const DOMAIN_STRUCTURES: Record<Condition, {
  domains: string[];
  defaultWeights: Record<string, number>;
  constraints: Record<string, DomainConstraint>;
  questions: Record<string, string[]>;
  questionConstraints: Record<string, Record<string, DomainConstraint>>;
}> = {
  back: {
    domains: ['STarT Back', 'ROM', 'Physio Exam', 'Anthropometric', 'Comorbidity', 'Lifestyle'],
    defaultWeights: {
      'STarT Back': 42,
      'ROM': 25,
      'Physio Exam': 15,
      'Anthropometric': 12,
      'Comorbidity': 8,
      'Lifestyle': 5
    },
    constraints: {
      'STarT Back': { min: 20, max: 60 },
      'ROM': { min: 15, max: 40 },
      'Physio Exam': { min: 10, max: 25 },
      'Anthropometric': { min: 8, max: 18 },
      'Comorbidity': { min: 5, max: 15 },
      'Lifestyle': { min: 3, max: 10 }
    },
    questions: {
      'STarT Back': ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9'],
      'ROM': ['Flexion', 'Extension', 'L Rotation', 'R Rotation'],
      'Physio Exam': ['SLR', 'FABER', 'Tenderness', 'Tightness']
    },
    questionConstraints: {
      'STarT Back': {
        'Q1': { min: 1, max: 15 }, 'Q2': { min: 1, max: 15 }, 'Q3': { min: 1, max: 15 },
        'Q4': { min: 1, max: 15 }, 'Q5': { min: 1, max: 15 }, 'Q6': { min: 1, max: 15 },
        'Q7': { min: 1, max: 15 }, 'Q8': { min: 1, max: 15 }, 'Q9': { min: 1, max: 15 }
      },
      'ROM': {
        'Flexion': { min: 10, max: 35 }, 'Extension': { min: 10, max: 35 },
        'L Rotation': { min: 10, max: 35 }, 'R Rotation': { min: 10, max: 35 }
      },
      'Physio Exam': {
        'SLR': { min: 10, max: 30 }, 'FABER': { min: 10, max: 30 },
        'Tenderness': { min: 10, max: 30 }, 'Tightness': { min: 10, max: 30 }
      }
    }
  },
  shoulder: {
    domains: ['Severity', 'ROM', 'Rotator Cuff', 'Occupational', 'Comorbidity'],
    defaultWeights: {
      'Severity': 30,
      'ROM': 25,
      'Rotator Cuff': 20,
      'Occupational': 15,
      'Comorbidity': 10
    },
    constraints: {
      'Severity': { min: 20, max: 45 },
      'ROM': { min: 15, max: 35 },
      'Rotator Cuff': { min: 12, max: 30 },
      'Occupational': { min: 10, max: 25 },
      'Comorbidity': { min: 5, max: 20 }
    },
    questions: {
      'Severity': ['Pain Level', 'Functional Impact'],
      'ROM': ['Abduction', 'External Rotation', 'Internal Rotation'],
      'Rotator Cuff': ['Strength', 'Impingement Test'],
      'Occupational': ['Overhead Work', 'Lifting Frequency']
    },
    questionConstraints: {
      'Severity': { 'Pain Level': { min: 10, max: 25 }, 'Functional Impact': { min: 10, max: 25 } },
      'ROM': { 'Abduction': { min: 10, max: 20 }, 'External Rotation': { min: 10, max: 20 }, 'Internal Rotation': { min: 10, max: 20 } },
      'Rotator Cuff': { 'Strength': { min: 10, max: 20 }, 'Impingement Test': { min: 10, max: 20 } },
      'Occupational': { 'Overhead Work': { min: 10, max: 20 }, 'Lifting Frequency': { min: 10, max: 20 } }
    }
  },
  knee: {
    domains: ['Severity', 'ROM', 'Meniscal Tests', 'Occupational', 'Comorbidity'],
    defaultWeights: {
      'Severity': 30,
      'ROM': 25,
      'Meniscal Tests': 20,
      'Occupational': 15,
      'Comorbidity': 10
    },
    constraints: {
      'Severity': { min: 20, max: 45 },
      'ROM': { min: 15, max: 35 },
      'Meniscal Tests': { min: 12, max: 30 },
      'Occupational': { min: 10, max: 25 },
      'Comorbidity': { min: 5, max: 20 }
    },
    questions: {
      'Severity': ['Pain Level', 'Swelling'],
      'ROM': ['Flexion', 'Extension'],
      'Meniscal Tests': ['McMurray Test', 'Lachman Test'],
      'Occupational': ['Standing Hours', 'Stair Climbing']
    },
    questionConstraints: {
      'Severity': { 'Pain Level': { min: 10, max: 25 }, 'Swelling': { min: 10, max: 25 } },
      'ROM': { 'Flexion': { min: 15, max: 35 }, 'Extension': { min: 15, max: 35 } },
      'Meniscal Tests': { 'McMurray Test': { min: 10, max: 20 }, 'Lachman Test': { min: 10, max: 20 } },
      'Occupational': { 'Standing Hours': { min: 10, max: 20 }, 'Stair Climbing': { min: 10, max: 20 } }
    }
  }
};

// Mock data generation
function generateMockAssessments(condition: Condition, count: number = 43): Assessment[] {
  const assessments: Assessment[] = [];
  const greenCount = Math.round(count * 0.63);
  const amberCount = Math.round(count * 0.33);
  const redCount = count - greenCount - amberCount;

  let id = 1;

  // Green assessments
  for (let i = 0; i < greenCount; i++) {
    assessments.push({
      id: `${condition}-${id++}`,
      age: Math.floor(Math.random() * 40) + 25,
      gender: Math.random() > 0.5 ? 'M' : 'F',
      htn: Math.random() > 0.7,
      rpiScore: Math.floor(Math.random() * 25) + 10,
      clinicianTier: 'Green'
    });
  }

  // Amber assessments
  for (let i = 0; i < amberCount; i++) {
    assessments.push({
      id: `${condition}-${id++}`,
      age: Math.floor(Math.random() * 40) + 30,
      gender: Math.random() > 0.5 ? 'M' : 'F',
      htn: Math.random() > 0.5,
      rpiScore: Math.floor(Math.random() * 30) + 35,
      clinicianTier: 'Amber'
    });
  }

  // Red assessments
  for (let i = 0; i < redCount; i++) {
    assessments.push({
      id: `${condition}-${id++}`,
      age: Math.floor(Math.random() * 30) + 40,
      gender: Math.random() > 0.5 ? 'M' : 'F',
      htn: Math.random() > 0.3,
      rpiScore: Math.floor(Math.random() * 35) + 65,
      clinicianTier: 'Red'
    });
  }

  return assessments.sort(() => Math.random() - 0.5);
}

// Calculate thresholds from assessments
function calculateThresholds(assessments: Assessment[]): Threshold {
  const greenScores = assessments.filter(a => a.clinicianTier === 'Green').map(a => a.rpiScore);
  const redScores = assessments.filter(a => a.clinicianTier === 'Red').map(a => a.rpiScore);

  const maxGreen = greenScores.length > 0 ? Math.max(...greenScores) : 35;
  const minRed = redScores.length > 0 ? Math.min(...redScores) : 65;

  return {
    tga: Math.round(maxGreen + 2),
    tar: Math.round(minRed - 2)
  };
}

// Calculate metrics
function calculateMetrics(assessments: Assessment[], thresholds: Threshold): Metrics {
  const predictions = assessments.map(a => {
    if (a.rpiScore < thresholds.tga) return 'Green';
    if (a.rpiScore < thresholds.tar) return 'Amber';
    return 'Red';
  });

  let correct = 0;
  const tierBreakdown: Record<ClinicianTier, { correct: number; clinicianCalls: number; predicted: number }> = {
    Red: { correct: 0, clinicianCalls: 0, predicted: 0 },
    Amber: { correct: 0, clinicianCalls: 0, predicted: 0 },
    Green: { correct: 0, clinicianCalls: 0, predicted: 0 }
  };

  assessments.forEach((a, i) => {
    const predicted = predictions[i] as ClinicianTier;
    tierBreakdown[a.clinicianTier].clinicianCalls++;
    tierBreakdown[predicted].predicted++;

    if (a.clinicianTier === predicted) {
      correct++;
      tierBreakdown[a.clinicianTier].correct++;
    }
  });

  const accuracy = (correct / assessments.length) * 100;
  const precision = tierBreakdown.Red.predicted > 0
    ? (tierBreakdown.Red.correct / tierBreakdown.Red.predicted) * 100
    : 0;
  const sensitivity = tierBreakdown.Red.clinicianCalls > 0
    ? (tierBreakdown.Red.correct / tierBreakdown.Red.clinicianCalls) * 100
    : 0;

  return {
    precision: Math.round(precision),
    sensitivity: Math.round(sensitivity),
    accuracy: Math.round(accuracy),
    agreement: { correct, total: assessments.length },
    tierBreakdown
  };
}

// Main component
export function RulesEngine() {
  const [condition, setCondition] = useState<Condition>('back');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [thresholds, setThresholds] = useState<Threshold>({ tga: 35, tar: 60 });
  const [weights, setWeights] = useState<Record<string, Record<string, number>>>({});
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [scenarios, setScenarios] = useState<Record<Condition, SavedScenario[]>>({
    back: [],
    shoulder: [],
    knee: []
  });
  const [optimizationGoal, setOptimizationGoal] = useState<'precision' | 'sensitivity' | 'accuracy'>('precision');

  // Initialize on mount
  useEffect(() => {
    const newAssessments = generateMockAssessments(condition);
    setAssessments(newAssessments);
    setThresholds(calculateThresholds(newAssessments));

    const structure = DOMAIN_STRUCTURES[condition];
    const newWeights: Record<string, Record<string, number>> = {};

    structure.domains.forEach(domain => {
      newWeights[domain] = {};
      newWeights[domain]['_total'] = structure.defaultWeights[domain];

      const questions = structure.questions[domain];
      if (questions) {
        const qWeight = structure.defaultWeights[domain] / questions.length;
        questions.forEach(q => {
          newWeights[domain][q] = qWeight;
        });
      }
    });

    setWeights(newWeights);

    // Load scenarios from localStorage
    const saved = localStorage.getItem(`scenarios_${condition}`);
    if (saved) {
      setScenarios(prev => ({
        ...prev,
        [condition]: JSON.parse(saved)
      }));
    }
  }, [condition]);

  const metrics = useMemo(() => calculateMetrics(assessments, thresholds), [assessments, thresholds]);

  const handleConditionSwitch = (newCondition: Condition) => {
    setCondition(newCondition);
    setExpandedDomains(new Set());
  };

  const handleDomainWeightChange = (domain: string, newValue: number) => {
    const structure = DOMAIN_STRUCTURES[condition];
    const constraint = structure.constraints[domain];
    const clampedValue = Math.max(constraint.min, Math.min(constraint.max, newValue));

    const oldValue = weights[domain]['_total'];
    const difference = clampedValue - oldValue;

    // Calculate proportional redistribution
    const otherDomains = structure.domains.filter(d => d !== domain);
    const totalOtherWeight = otherDomains.reduce((sum, d) => sum + weights[d]['_total'], 0);

    const newWeights_: Record<string, Record<string, number>> = { ...weights };
    newWeights_[domain]['_total'] = clampedValue;

    if (totalOtherWeight > 0) {
      otherDomains.forEach(d => {
        const proportion = weights[d]['_total'] / totalOtherWeight;
        newWeights_[d]['_total'] = Math.max(
          structure.constraints[d].min,
          Math.min(
            structure.constraints[d].max,
            weights[d]['_total'] - difference * proportion
          )
        );

        // Update sub-questions proportionally
        const questions = structure.questions[d];
        if (questions) {
          const qWeights = questions.map(q => weights[d][q] || 0);
          const totalQWeight = qWeights.reduce((a, b) => a + b, 0);
          questions.forEach(q => {
            const oldQWeight = weights[d][q] || 0;
            const qProportion = totalQWeight > 0 ? oldQWeight / totalQWeight : 1 / questions.length;
            newWeights_[d][q] = (newWeights_[d]['_total'] * qProportion);
          });
        }
      });
    }

    setWeights(newWeights_);
  };

  const handleQuestionWeightChange = (domain: string, question: string, newValue: number) => {
    const structure = DOMAIN_STRUCTURES[condition];
    const constraints = structure.questionConstraints[domain];
    const constraint = constraints?.[question];
    const clampedValue = constraint ? Math.max(constraint.min, Math.min(constraint.max, newValue)) : newValue;

    const oldValue = weights[domain][question] || 0;
    const questions = structure.questions[domain];
    const difference = clampedValue - oldValue;

    const newWeights_: Record<string, Record<string, number>> = { ...weights };
    newWeights_[domain][question] = clampedValue;

    // Redistribute to other questions in this domain
    if (questions && questions.length > 1) {
      const otherQuestions = questions.filter(q => q !== question);
      const totalOtherWeight = otherQuestions.reduce((sum, q) => sum + (weights[domain][q] || 0), 0);

      if (totalOtherWeight > 0) {
        otherQuestions.forEach(q => {
          const proportion = (weights[domain][q] || 0) / totalOtherWeight;
          const newQValue = Math.max(
            constraints?.[q]?.min || 0,
            Math.min(
              constraints?.[q]?.max || 100,
              (weights[domain][q] || 0) - difference * proportion
            )
          );
          newWeights_[domain][q] = newQValue;
        });
      }
    }

    // Ensure domain total is maintained
    const domainTotal = Object.keys(newWeights_[domain])
      .filter(k => k !== '_total')
      .reduce((sum, k) => sum + newWeights_[domain][k], 0);
    newWeights_[domain]['_total'] = domainTotal;

    setWeights(newWeights_);
  };

  const handleSaveScenario = () => {
    const name = prompt('Save configuration as:');
    if (!name) return;

    const scenario: SavedScenario = {
      id: `${Date.now()}`,
      name,
      date: new Date().toISOString().split('T')[0],
      weights,
      constraints: DOMAIN_STRUCTURES[condition].constraints,
      metrics,
      thresholds,
      goal: optimizationGoal,
      assessmentCount: assessments.length
    };

    const newScenarios = [...(scenarios[condition] || []), scenario];
    setScenarios(prev => ({ ...prev, [condition]: newScenarios }));
    localStorage.setItem(`scenarios_${condition}`, JSON.stringify(newScenarios));
  };

  const handleLoadScenario = (scenario: SavedScenario) => {
    setWeights(scenario.weights);
    setThresholds(scenario.thresholds);
  };

  const handleExportCSV = (scenario?: SavedScenario) => {
    const data = scenario || { weights, thresholds, metrics, goal: optimizationGoal };
    const csv = [
      `Rules Engine Export - ${condition.toUpperCase()}`,
      `Date: ${new Date().toLocaleDateString()}`,
      '',
      'THRESHOLDS',
      `Green→Amber (tga): ${data.thresholds.tga}`,
      `Amber→Red (tar): ${data.thresholds.tar}`,
      '',
      'METRICS',
      `Precision: ${data.metrics.precision}%`,
      `Sensitivity: ${data.metrics.sensitivity}%`,
      `Accuracy: ${data.metrics.accuracy}%`,
      `Agreement: ${data.metrics.agreement.correct}/${data.metrics.agreement.total}`,
      '',
      'WEIGHTS',
      ...DOMAIN_STRUCTURES[condition].domains.map(d => `${d}: ${data.weights[d]['_total'].toFixed(1)}%`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rules_engine_${condition}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const structure = DOMAIN_STRUCTURES[condition];

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', backgroundColor: '#FAFBFC', minHeight: '100vh', padding: '24px' }}>
      {/* Condition Tabs */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #D4DEE6' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          {(['back', 'shoulder', 'knee'] as Condition[]).map(cond => (
            <button
              key={cond}
              onClick={() => handleConditionSwitch(cond)}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: condition === cond ? '#0D6A47' : 'transparent',
                color: condition === cond ? 'white' : '#647281',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
            >
              {cond === 'back' ? '🔵 Back Pain' : cond === 'shoulder' ? '🟠 Shoulder' : '🟢 Knee'}
            </button>
          ))}
        </div>
      </div>

      {/* Cohort Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#F0F5FA', padding: '16px', borderRadius: '12px', border: '1px solid #D4DEE6' }}>
          <div style={{ fontSize: '12px', color: '#647281', marginBottom: '8px' }}>Total Patients</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#1A2332' }}>{assessments.length}</div>
        </div>
        <div style={{ backgroundColor: '#F0F5FA', padding: '16px', borderRadius: '12px', border: '1px solid #D4DEE6' }}>
          <div style={{ fontSize: '12px', color: '#647281', marginBottom: '8px' }}>🟢 Green</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0D6A47' }}>
            {assessments.filter(a => a.clinicianTier === 'Green').length}
          </div>
        </div>
        <div style={{ backgroundColor: '#F0F5FA', padding: '16px', borderRadius: '12px', border: '1px solid #D4DEE6' }}>
          <div style={{ fontSize: '12px', color: '#647281', marginBottom: '8px' }}>🟠 Amber</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#E8A23D' }}>
            {assessments.filter(a => a.clinicianTier === 'Amber').length}
          </div>
        </div>
        <div style={{ backgroundColor: '#F0F5FA', padding: '16px', borderRadius: '12px', border: '1px solid #D4DEE6' }}>
          <div style={{ fontSize: '12px', color: '#647281', marginBottom: '8px' }}>🔴 Red</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#E84C3D' }}>
            {assessments.filter(a => a.clinicianTier === 'Red').length}
          </div>
        </div>
        <div style={{ backgroundColor: '#F0F5FA', padding: '16px', borderRadius: '12px', border: '1px solid #D4DEE6' }}>
          <div style={{ fontSize: '12px', color: '#647281', marginBottom: '8px' }}>tga (Green→Amber)</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#1A2332' }}>{thresholds.tga}</div>
        </div>
        <div style={{ backgroundColor: '#F0F5FA', padding: '16px', borderRadius: '12px', border: '1px solid #D4DEE6' }}>
          <div style={{ fontSize: '12px', color: '#647281', marginBottom: '8px' }}>tar (Amber→Red)</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#1A2332' }}>{thresholds.tar}</div>
        </div>
      </div>

      {/* Metrics Display */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#F0F5FA', padding: '16px', borderRadius: '12px', border: '1px solid #D4DEE6' }}>
          <div style={{ fontSize: '12px', color: '#647281', marginBottom: '8px' }}>Precision</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#0D6A47' }}>{metrics.precision}%</div>
        </div>
        <div style={{ backgroundColor: '#F0F5FA', padding: '16px', borderRadius: '12px', border: '1px solid #D4DEE6' }}>
          <div style={{ fontSize: '12px', color: '#647281', marginBottom: '8px' }}>Sensitivity</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#0D6A47' }}>{metrics.sensitivity}%</div>
        </div>
        <div style={{ backgroundColor: '#F0F5FA', padding: '16px', borderRadius: '12px', border: '1px solid #D4DEE6' }}>
          <div style={{ fontSize: '12px', color: '#647281', marginBottom: '8px' }}>Accuracy</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#0D6A47' }}>{metrics.accuracy}%</div>
        </div>
        <div style={{ backgroundColor: '#F0F5FA', padding: '16px', borderRadius: '12px', border: '1px solid #D4DEE6' }}>
          <div style={{ fontSize: '12px', color: '#647281', marginBottom: '8px' }}>Agreement</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#0D6A47' }}>
            {metrics.agreement.correct}/{metrics.agreement.total}
          </div>
          <div style={{ fontSize: '11px', color: '#647281', marginTop: '4px' }}>
            {((metrics.agreement.correct / metrics.agreement.total) * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Tier Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {(['Red', 'Amber', 'Green'] as ClinicianTier[]).map(tier => {
          const breakdown = metrics.tierBreakdown[tier];
          return (
            <div key={tier} style={{ backgroundColor: '#F0F5FA', padding: '16px', borderRadius: '12px', border: '1px solid #D4DEE6' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', marginBottom: '12px' }}>
                {tier === 'Red' ? '🔴' : tier === 'Amber' ? '🟠' : '🟢'} {tier}
              </div>
              <div style={{ fontSize: '12px', color: '#647281', marginBottom: '4px' }}>
                Correct: {breakdown.correct}/{breakdown.clinicianCalls}
              </div>
              <div style={{ fontSize: '12px', color: '#647281' }}>
                Predicted: {breakdown.predicted}
              </div>
            </div>
          );
        })}
      </div>

      {/* Domain Weights Section */}
      <div style={{ backgroundColor: '#F0F5FA', borderRadius: '12px', border: '1px solid #D4DEE6', padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A2332', marginBottom: '20px' }}>Domain Weights</h2>
        {structure.domains.map(domain => {
          const isExpanded = expandedDomains.has(domain);
          const domainWeight = weights[domain]?.['_total'] || 0;
          const questions = structure.questions[domain];

          return (
            <div key={domain} style={{ marginBottom: '16px', backgroundColor: '#FAFBFC', borderRadius: '8px', border: '1px solid #D4DEE6', overflow: 'hidden' }}>
              {/* Domain Header */}
              <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', backgroundColor: '#F0F5FA' }}
                onClick={() => setExpandedDomains(prev => {
                  const next = new Set(prev);
                  if (next.has(domain)) next.delete(domain);
                  else next.add(domain);
                  return next;
                })}>
                <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: '#1A2332' }}>{domain}</span>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#0D6A47' }}>{domainWeight.toFixed(1)}%</span>
                  <span style={{ fontSize: '11px', color: '#647281' }}>
                    [{structure.constraints[domain].min}-{structure.constraints[domain].max}%]
                  </span>
                  <span style={{ fontSize: '16px', color: '#647281', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                </div>
              </div>

              {/* Domain Slider */}
              <div style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="range"
                  min={String(structure.constraints[domain].min)}
                  max={String(structure.constraints[domain].max)}
                  value={String(domainWeight)}
                  onChange={(e) => handleDomainWeightChange(domain, parseFloat(e.target.value))}
                  style={{ flex: 1, cursor: 'pointer' }}
                />
                <input
                  type="number"
                  min={String(structure.constraints[domain].min)}
                  max={String(structure.constraints[domain].max)}
                  value={domainWeight.toFixed(1)}
                  onChange={(e) => handleDomainWeightChange(domain, parseFloat(e.target.value))}
                  style={{ width: '60px', padding: '6px', borderRadius: '4px', border: '1px solid #D4DEE6', fontSize: '12px' }}
                />
                <span style={{ fontSize: '12px', color: '#647281' }}>%</span>
              </div>

              {/* Question Level (Expanded) */}
              {isExpanded && questions && (
                <div style={{ paddingLeft: '32px', paddingRight: '16px', paddingBottom: '16px', backgroundColor: '#FAFBFC' }}>
                  {questions.map(question => {
                    const qWeight = weights[domain]?.[question] || 0;
                    const qConstraint = structure.questionConstraints[domain]?.[question];

                    return (
                      <div key={question} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #D4DEE6' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ flex: 1, fontSize: '13px', color: '#1A2332' }}>{question}</span>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0D6A47' }}>{qWeight.toFixed(1)}%</span>
                          {qConstraint && <span style={{ fontSize: '10px', color: '#647281' }}>[{qConstraint.min}-{qConstraint.max}%]</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <input
                            type="range"
                            min={qConstraint?.min || 0}
                            max={qConstraint?.max || 100}
                            value={qWeight}
                            onChange={(e) => handleQuestionWeightChange(domain, question, parseFloat(e.target.value))}
                            style={{ flex: 1, cursor: 'pointer' }}
                          />
                          <input
                            type="number"
                            min={qConstraint?.min || 0}
                            max={qConstraint?.max || 100}
                            value={qWeight.toFixed(1)}
                            onChange={(e) => handleQuestionWeightChange(domain, question, parseFloat(e.target.value))}
                            style={{ width: '50px', padding: '4px', borderRadius: '4px', border: '1px solid #D4DEE6', fontSize: '11px' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save and Export */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button
          onClick={handleSaveScenario}
          style={{
            padding: '12px 24px',
            backgroundColor: '#0D6A47',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px'
          }}
        >
          💾 Save Configuration
        </button>
        <button
          onClick={() => handleExportCSV()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#F0F5FA',
            color: '#0D6A47',
            border: '1px solid #D4DEE6',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px'
          }}
        >
          📥 Export CSV
        </button>
      </div>

      {/* Saved Configurations */}
      {(scenarios[condition]?.length || 0) > 0 && (
        <div style={{ backgroundColor: '#F0F5FA', borderRadius: '12px', border: '1px solid #D4DEE6', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A2332', marginBottom: '16px' }}>Saved Configurations</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #D4DEE6' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#647281', fontWeight: 600 }}>S.No</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#647281', fontWeight: 600 }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#647281', fontWeight: 600 }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#647281', fontWeight: 600 }}>Precision</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#647281', fontWeight: 600 }}>Sensitivity</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#647281', fontWeight: 600 }}>Accuracy</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#647281', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scenarios[condition]?.map((scenario, idx) => (
                  <tr key={scenario.id} style={{ borderBottom: '1px solid #D4DEE6', backgroundColor: idx % 2 === 0 ? '#FAFBFC' : '#F0F5FA' }}>
                    <td style={{ padding: '12px', color: '#1A2332' }}>{idx + 1}</td>
                    <td style={{ padding: '12px', color: '#1A2332', fontWeight: 600 }}>{scenario.name}</td>
                    <td style={{ padding: '12px', color: '#647281' }}>{scenario.date}</td>
                    <td style={{ padding: '12px', color: '#0D6A47', fontWeight: 600 }}>{scenario.metrics.precision}%</td>
                    <td style={{ padding: '12px', color: '#0D6A47', fontWeight: 600 }}>{scenario.metrics.sensitivity}%</td>
                    <td style={{ padding: '12px', color: '#0D6A47', fontWeight: 600 }}>{scenario.metrics.accuracy}%</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleLoadScenario(scenario)}
                        style={{ marginRight: '8px', padding: '6px 12px', fontSize: '12px', backgroundColor: '#0D6A47', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleExportCSV(scenario)}
                        style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#F0F5FA', color: '#0D6A47', border: '1px solid #D4DEE6', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Export
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
