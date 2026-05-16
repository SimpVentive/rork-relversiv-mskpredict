'use client';

import { useState, useMemo } from 'react';
import { Condition, Cohort, Metrics, CohortData } from '@/types/dashboard';
import { MetricRow } from '@/components/dashboard/MetricRow';
import { CohortSelector } from '@/components/dashboard/CohortSelector';
import { ConditionSelector } from '@/components/dashboard/ConditionSelector';
import { ExportButton } from '@/components/dashboard/ExportButton';
import { DrillDetailSection } from '@/components/dashboard/DrillDetailSection';

// Mock data
const mockMetrics: Metrics = {
  totalPatients: 23,
  avgAge: 47.2,
  genderSplit: { male: 15, female: 8 },
  avgBMI: 25.3,
  avgStartScore: 4.2,
  avgROM: 92.5,
  avgPain: 5.8,
  comorbidities: 67,
  avgPhysioScore: 71,
  posSpecialTests: 58,
  palpationFindings: 71,
  neuroAbnormalities: 34,
  totalPredictions: 43,
  agreement: 83,
  sensitivity: 72,
  precision: 45,
};

const mockCohortData: CohortData = {
  totalPatients: 23,
  breakdown: {
    backOnly: 5,
    shoulderOnly: 2,
    kneeOnly: 3,
    backShoulder: 3,
    backKnee: 2,
    shoulderKnee: 1,
    allThree: 4,
  },
};

export default function HospitalDashboard() {
  const [selectedCohort, setSelectedCohort] = useState<Cohort>('all');
  const [selectedCondition, setSelectedCondition] = useState<Condition>('back');
  const [expandedDrill, setExpandedDrill] = useState<string | null>(null);

  // Color mapping based on selected condition
  const conditionColorMap: Record<Condition, string> = {
    back: 'back',
    shoulder: 'shoulder',
    knee: 'knee'
  };

  const currentColor = conditionColorMap[selectedCondition];

  // Build metric cards
  const demographicsCards = useMemo(() => [
    {
      label: 'Total Patients',
      value: mockMetrics.totalPatients,
      subtext: `In ${selectedCohort} cohort`,
      onClick: () => setExpandedDrill('total-patients'),
      isClickable: true
    },
    {
      label: 'Avg Age',
      value: `${mockMetrics.avgAge} yrs`,
      subtext: 'Range: 25-72',
      onClick: () => setExpandedDrill('age'),
      isClickable: true
    },
    {
      label: 'Gender Split',
      value: `${mockMetrics.genderSplit.male}M / ${mockMetrics.genderSplit.female}F`,
      subtext: `${((mockMetrics.genderSplit.male / mockMetrics.totalPatients) * 100).toFixed(0)}% Male`,
      onClick: () => setExpandedDrill('gender'),
      isClickable: true
    },
    {
      label: 'Avg BMI',
      value: mockMetrics.avgBMI.toFixed(1),
      subtext: 'kg/m²',
      onClick: () => setExpandedDrill('bmi'),
      isClickable: true
    }
  ], [selectedCohort]);

  const psychosocialCards = useMemo(() => [
    {
      label: selectedCondition === 'back' ? 'Avg STarT Score' : 'Avg Severity',
      value: selectedCondition === 'back' ? `${mockMetrics.avgStartScore}/9` : '4.2/10',
      subtext: selectedCondition === 'back' ? 'STarT Back Tool' : 'Patient reported',
      onClick: () => setExpandedDrill('severity'),
      isClickable: true
    },
    {
      label: 'Avg ROM',
      value: `${mockMetrics.avgROM}°`,
      subtext: 'Range of motion',
      onClick: () => setExpandedDrill('rom'),
      isClickable: true
    },
    {
      label: 'Avg Pain',
      value: `${mockMetrics.avgPain}/10`,
      subtext: 'VAS scale',
      onClick: () => setExpandedDrill('pain'),
      isClickable: true
    },
    {
      label: 'Comorbidities',
      value: `${mockMetrics.comorbidities}%`,
      subtext: 'With ≥1 condition',
      onClick: () => setExpandedDrill('comorbidities'),
      isClickable: true
    }
  ], [selectedCondition]);

  const physioExamCards = useMemo(() => [
    {
      label: 'Avg Physio Score',
      value: `${mockMetrics.avgPhysioScore}%`,
      subtext: 'Examination findings',
      onClick: () => setExpandedDrill('physio-score'),
      isClickable: true
    },
    {
      label: '+ Special Tests',
      value: `${mockMetrics.posSpecialTests}%`,
      subtext: 'Positive findings',
      onClick: () => setExpandedDrill('special-tests'),
      isClickable: true
    },
    {
      label: 'Palpation Findings',
      value: `${mockMetrics.palpationFindings}%`,
      subtext: 'Tenderness/Spasm',
      onClick: () => setExpandedDrill('palpation'),
      isClickable: true
    },
    {
      label: 'Neuro Abnormalities',
      value: `${mockMetrics.neuroAbnormalities}%`,
      subtext: 'Sensation/Strength/Reflex',
      onClick: () => setExpandedDrill('neuro'),
      isClickable: true
    }
  ], []);

  const performanceCards = useMemo(() => [
    {
      label: 'Total Predictions',
      value: mockMetrics.totalPredictions,
      subtext: 'Model evaluations',
      onClick: () => setExpandedDrill('predictions'),
      isClickable: true
    },
    {
      label: 'Agreement %',
      value: `${mockMetrics.agreement}%`,
      subtext: 'vs Clinician Call',
      onClick: () => setExpandedDrill('agreement'),
      isClickable: true
    },
    {
      label: 'Sensitivity',
      value: `${mockMetrics.sensitivity}%`,
      subtext: 'True Positive Rate',
      onClick: () => setExpandedDrill('sensitivity'),
      isClickable: true
    },
    {
      label: 'Precision',
      value: `${mockMetrics.precision}%`,
      subtext: 'Positive Pred Value',
      onClick: () => setExpandedDrill('precision'),
      isClickable: true
    }
  ], []);

  return (
    <div className="min-h-screen bg-bgPrimary">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bgSecondary border-b border-borderLight shadow-soft">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* Title Section */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-textPrimary">
                Hospital Dashboard — AIG Hyderabad
              </h1>
              <p className="text-sm text-textSecondary mt-1">
                Select patient cohort, then choose a condition to view detailed metrics
              </p>
            </div>
            <ExportButton />
          </div>

          {/* Cohort & Condition Selectors */}
          <div className="space-y-6">
            {/* Cohort Section */}
            <div>
              <h2 className="text-sm font-semibold text-textPrimary mb-3 uppercase">
                Patient Cohort
              </h2>
              <CohortSelector
                selected={selectedCohort}
                cohortData={mockCohortData}
                onChange={setSelectedCohort}
              />
            </div>

            {/* Condition Section */}
            <div>
              <h2 className="text-sm font-semibold text-textPrimary mb-3 uppercase">
                Select Condition
              </h2>
              <ConditionSelector
                selected={selectedCondition}
                onChange={setSelectedCondition}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Demographics Section */}
        <MetricRow
          cards={demographicsCards}
          sectionLabel="Demographics"
          sectionColor={currentColor}
        />

        {/* Psychosocial & Movement Section */}
        <MetricRow
          cards={psychosocialCards}
          sectionLabel="Psychosocial & Movement"
          sectionColor={currentColor}
        />

        {/* Physio Exam Section */}
        <MetricRow
          cards={physioExamCards}
          sectionLabel="Physiotherapy Examination Findings"
          sectionColor={currentColor}
        />

        {/* Model Performance Section */}
        <MetricRow
          cards={performanceCards}
          sectionLabel="Model Performance"
          sectionColor={currentColor}
        />

        {/* Drill-Down Details Section */}
        <div className="space-y-4 pt-4 border-t border-borderLight">
          <h2 className="text-lg font-bold text-textPrimary">Detailed Analysis</h2>
          <p className="text-sm text-textSecondary">
            Click any metric card above to view detailed charts and breakdowns
          </p>

          {expandedDrill && (
            <div className="space-y-4">
              <DrillDetailSection
                metric={expandedDrill}
                title={`${expandedDrill.replace(/-/g, ' ')} Analysis`}
                color={currentColor as 'back' | 'shoulder' | 'knee'}
                onClose={() => setExpandedDrill(null)}
              />
            </div>
          )}

          {!expandedDrill && (
            <div className="bg-bgSecondary border border-borderLight rounded p-8 text-center">
              <p className="text-textSecondary">
                Select a metric to see detailed analysis charts
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
