'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ReferenceLine,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { mockAssessments } from '@/data/mockAssessments';

// ===== TYPES =====

type Tier = 'Red' | 'Amber' | 'Green';

interface AssessmentPoint {
  label: string;
  date: string;
  clinicianTier: Tier;
  modelTier: Tier;
  rpiScore: number;
  startScore: number;
  romFlexion: number;
  physioScore: number;
  painIntensity: number;
  comorbidityCount: number;
  bmi: number;
  clinicianNotes: string;
}

interface PatientHistory {
  patientCode: string;
  age: number;
  gender: 'M' | 'F';
  bmi: number;
  htn: boolean;
  comorbidities: string[];
  condition: 'back' | 'shoulder' | 'knee';
  assessments: AssessmentPoint[];
}

interface WhatIfState {
  startScore: number;
  romFlexion: number;
  physioScore: number;
  painIntensity: number;
  comorbidityCount: number;
}

// ===== CONSTANTS =====

const DOMAIN_WEIGHTS = { start: 42, rom: 25, physio: 15, anthro: 12, comor: 6 };
const TIER_COLORS: Record<Tier, string> = {
  Red: '#A52D28',
  Amber: '#D4A03D',
  Green: '#0D6A47'
};

const MOCK_PATIENT_POOL: PatientHistory[] = [
  {
    patientCode: 'P023',
    age: 47,
    gender: 'M',
    bmi: 27.2,
    htn: true,
    comorbidities: ['Hypertension', 'Type 2 Diabetes'],
    condition: 'back',
    assessments: [
      {
        label: 'T0',
        date: '2025-11-01',
        clinicianTier: 'Red',
        modelTier: 'Red',
        rpiScore: 78,
        startScore: 7,
        romFlexion: 68,
        physioScore: 42,
        painIntensity: 8.2,
        comorbidityCount: 2,
        bmi: 27.2,
        clinicianNotes: 'Patient presenting with severe lumbar pain radiating to L4/L5. STarT Back high risk. Referred for intensive physio programme.'
      },
      {
        label: 'T1',
        date: '2026-02-01',
        clinicianTier: 'Amber',
        modelTier: 'Amber',
        rpiScore: 58,
        startScore: 5,
        romFlexion: 78,
        physioScore: 61,
        painIntensity: 6.1,
        comorbidityCount: 2,
        bmi: 27.1,
        clinicianNotes: 'Good response to physiotherapy. Pain reducing. ROM improving. Continuing programme.'
      },
      {
        label: 'T2',
        date: '2026-05-01',
        clinicianTier: 'Green',
        modelTier: 'Amber',
        rpiScore: 39,
        startScore: 3,
        romFlexion: 91,
        physioScore: 78,
        painIntensity: 3.8,
        comorbidityCount: 2,
        bmi: 27.0,
        clinicianNotes: 'Significant improvement. Functional ROM restored. Patient self-managing. Discharge to GP.'
      }
    ]
  },
  {
    patientCode: 'P024',
    age: 52,
    gender: 'F',
    bmi: 24.8,
    htn: false,
    comorbidities: ['Osteoarthritis'],
    condition: 'back',
    assessments: [
      {
        label: 'T0',
        date: '2025-10-15',
        clinicianTier: 'Amber',
        modelTier: 'Amber',
        rpiScore: 55,
        startScore: 4,
        romFlexion: 82,
        physioScore: 65,
        painIntensity: 6.0,
        comorbidityCount: 1,
        bmi: 24.8,
        clinicianNotes: 'Moderate back pain, long-standing. OA background. Stable on analgesics.'
      },
      {
        label: 'T1',
        date: '2026-01-15',
        clinicianTier: 'Amber',
        modelTier: 'Green',
        rpiScore: 51,
        startScore: 4,
        romFlexion: 85,
        physioScore: 68,
        painIntensity: 5.6,
        comorbidityCount: 1,
        bmi: 24.8,
        clinicianNotes: 'Marginal improvement. Model disagrees — clinician retaining Amber given OA history.'
      },
      {
        label: 'T2',
        date: '2026-04-15',
        clinicianTier: 'Amber',
        modelTier: 'Amber',
        rpiScore: 49,
        startScore: 3,
        romFlexion: 87,
        physioScore: 70,
        painIntensity: 5.2,
        comorbidityCount: 1,
        bmi: 24.8,
        clinicianNotes: 'Stable plateau. Chronic condition. Maintaining with home exercise programme.'
      }
    ]
  },
  {
    patientCode: 'P025',
    age: 39,
    gender: 'M',
    bmi: 26.1,
    htn: false,
    comorbidities: [],
    condition: 'back',
    assessments: [
      {
        label: 'T0',
        date: '2025-12-01',
        clinicianTier: 'Green',
        modelTier: 'Green',
        rpiScore: 32,
        startScore: 2,
        romFlexion: 94,
        physioScore: 82,
        painIntensity: 3.5,
        comorbidityCount: 0,
        bmi: 26.1,
        clinicianNotes: 'Acute onset, minimal symptoms. Work-related strain. Discharged to self-care.'
      },
      {
        label: 'T1',
        date: '2026-03-01',
        clinicianTier: 'Red',
        modelTier: 'Red',
        rpiScore: 74,
        startScore: 6,
        romFlexion: 70,
        physioScore: 48,
        painIntensity: 7.8,
        comorbidityCount: 0,
        bmi: 26.1,
        clinicianNotes: 'Deterioration — unexpected escalation. Re-referred urgently. T0 assessment under-estimated psychological component.'
      },
      {
        label: 'T2',
        date: '2026-05-10',
        clinicianTier: 'Amber',
        modelTier: 'Amber',
        rpiScore: 56,
        startScore: 4,
        romFlexion: 80,
        physioScore: 60,
        painIntensity: 5.9,
        comorbidityCount: 0,
        bmi: 26.1,
        clinicianNotes: 'Responding to intensive intervention. Psychological support added. Trajectory improving.'
      }
    ]
  },
  {
    patientCode: 'P026',
    age: 61,
    gender: 'F',
    bmi: 30.5,
    htn: true,
    comorbidities: ['Hypertension', 'Osteoporosis', 'Thyroid'],
    condition: 'back',
    assessments: [
      {
        label: 'T0',
        date: '2025-09-01',
        clinicianTier: 'Red',
        modelTier: 'Red',
        rpiScore: 84,
        startScore: 8,
        romFlexion: 58,
        physioScore: 35,
        painIntensity: 9.0,
        comorbidityCount: 3,
        bmi: 30.5,
        clinicianNotes: 'Complex presentation. Multiple comorbidities. MRI shows L4/L5 extrusion. Pain management referral.'
      },
      {
        label: 'T1',
        date: '2025-12-01',
        clinicianTier: 'Red',
        modelTier: 'Red',
        rpiScore: 79,
        startScore: 7,
        romFlexion: 62,
        physioScore: 40,
        painIntensity: 8.5,
        comorbidityCount: 3,
        bmi: 30.4,
        clinicianNotes: 'Minimal change. Surgery discussed. Pain management ongoing. Complex social situation.'
      },
      {
        label: 'T2',
        date: '2026-03-01',
        clinicianTier: 'Red',
        modelTier: 'Red',
        rpiScore: 76,
        startScore: 7,
        romFlexion: 66,
        physioScore: 44,
        painIntensity: 8.1,
        comorbidityCount: 3,
        bmi: 30.3,
        clinicianNotes: 'Gradual marginal improvement post-injection. Still high-risk. MDT review planned.'
      }
    ]
  },
  {
    patientCode: 'P027',
    age: 34,
    gender: 'F',
    bmi: 22.3,
    htn: false,
    comorbidities: [],
    condition: 'back',
    assessments: [
      {
        label: 'T0',
        date: '2026-01-10',
        clinicianTier: 'Red',
        modelTier: 'Amber',
        rpiScore: 72,
        startScore: 6,
        romFlexion: 72,
        physioScore: 50,
        painIntensity: 7.5,
        comorbidityCount: 0,
        bmi: 22.3,
        clinicianNotes: 'Post-partum back pain. High STarT score. Model under-triaged. Clinician correct to escalate.'
      },
      {
        label: 'T1',
        date: '2026-03-10',
        clinicianTier: 'Amber',
        modelTier: 'Amber',
        rpiScore: 47,
        startScore: 3,
        romFlexion: 88,
        physioScore: 72,
        painIntensity: 4.8,
        comorbidityCount: 0,
        bmi: 22.2,
        clinicianNotes: 'Excellent response. Physio programme well-tolerated. Progressive loading initiated.'
      },
      {
        label: 'T2',
        date: '2026-05-10',
        clinicianTier: 'Green',
        modelTier: 'Green',
        rpiScore: 24,
        startScore: 1,
        romFlexion: 98,
        physioScore: 90,
        painIntensity: 2.1,
        comorbidityCount: 0,
        bmi: 22.1,
        clinicianNotes: 'Full recovery. Discharged. Return to all activities. No further appointments needed.'
      }
    ]
  }
];

// ===== HELPER FUNCTIONS =====

function recalcRPI(s: WhatIfState): number {
  const startNorm = (s.startScore / 9) * 100;
  const romNorm = 100 - Math.min(100, (s.romFlexion / 90) * 100);
  const physioNorm = 100 - s.physioScore;
  const painNorm = (s.painIntensity / 10) * 100;
  const comorNorm = Math.min(100, (s.comorbidityCount / 7) * 100);

  const weighted =
    (startNorm * DOMAIN_WEIGHTS.start +
      romNorm * DOMAIN_WEIGHTS.rom +
      physioNorm * DOMAIN_WEIGHTS.physio +
      painNorm * DOMAIN_WEIGHTS.anthro +
      comorNorm * DOMAIN_WEIGHTS.comor) /
    100;

  return Math.round(Math.min(100, Math.max(0, weighted)));
}

function classifyTier(rpi: number): Tier {
  return rpi >= 70 ? 'Red' : rpi >= 40 ? 'Amber' : 'Green';
}

function calculatePercentile(patientValue: number, field: string): number {
  const cohortValues = mockAssessments
    .map(a => (a as any)[field] as number | undefined)
    .filter((v): v is number => v !== undefined && !isNaN(v));

  if (cohortValues.length === 0) return 50;

  const sortedAsc = [...cohortValues].sort((a, b) => a - b);
  const rank = sortedAsc.filter(v => v < patientValue).length;

  return Math.round((rank / sortedAsc.length) * 100);
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function generateInsight(original: AssessmentPoint, whatIf: WhatIfState, newRPI: number): string {
  const delta = newRPI - original.rpiScore;
  const newTier = classifyTier(newRPI);
  const tierChanged = newTier !== original.clinicianTier;

  const domainChanges: string[] = [];
  if (whatIf.startScore !== original.startScore)
    domainChanges.push(`STarT ${whatIf.startScore > original.startScore ? '+' : ''}${whatIf.startScore - original.startScore}`);
  if (whatIf.romFlexion !== original.romFlexion)
    domainChanges.push(`ROM ${whatIf.romFlexion > original.romFlexion ? '+' : ''}${whatIf.romFlexion - original.romFlexion}°`);
  if (whatIf.physioScore !== original.physioScore)
    domainChanges.push(`Physio ${whatIf.physioScore > original.physioScore ? '+' : ''}${whatIf.physioScore - original.physioScore}`);

  const changeDesc = delta > 0 ? `increased by ${delta}` : `decreased by ${Math.abs(delta)}`;
  let text = `Estimated RPI ${changeDesc} to ${newRPI}.`;

  if (domainChanges.length > 0) text += ` Changes: ${domainChanges.join(', ')}.`;
  if (tierChanged) text += ` Risk tier would shift from ${original.clinicianTier} to ${newTier}.`;
  else text += ` Risk tier remains ${newTier}.`;
  if (newRPI < original.rpiScore) text += ' Improving these domains may accelerate recovery.';
  if (newRPI > original.rpiScore) text += ' Worsening these factors increases chronicity risk.';

  return text;
}

// ===== MAIN COMPONENT =====

export function PatientDetail() {
  const [searchId, setSearchId] = useState('P023');
  const [patientHistory, setPatientHistory] = useState<PatientHistory | null>(null);
  const [selectedAssessIdx, setSelectedAssessIdx] = useState(2);
  const [whatIfScores, setWhatIfScores] = useState<WhatIfState | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = (id: string) => {
    const trimmed = id.toUpperCase().trim();
    const patient = MOCK_PATIENT_POOL.find(p => p.patientCode === trimmed);
    if (patient) {
      setPatientHistory(patient);
      setSearchId(trimmed);
      setSelectedAssessIdx(patient.assessments.length - 1);
      setNotFound(false);
    } else {
      setNotFound(true);
      setPatientHistory(null);
    }
  };

  // Auto-load P023 on mount
  useEffect(() => {
    handleSearch('P023');
  }, []);

  // Reset what-if when assessment selection changes
  useEffect(() => {
    if (patientHistory) {
      const assessment = patientHistory.assessments[selectedAssessIdx];
      if (assessment) {
        setWhatIfScores({
          startScore: assessment.startScore,
          romFlexion: assessment.romFlexion,
          physioScore: assessment.physioScore,
          painIntensity: assessment.painIntensity,
          comorbidityCount: assessment.comorbidityCount
        });
      }
    }
  }, [selectedAssessIdx, patientHistory]);

  const selectedAssessment = patientHistory?.assessments[selectedAssessIdx] || null;
  const cohortAvg = useMemo(() => {
    const rpiScores = mockAssessments.map(a => a.rpiScore).filter(v => !isNaN(v));
    const startScores = mockAssessments.map(a => a.startScore || 0).filter(v => !isNaN(v));
    const romFlexions = mockAssessments.map(a => a.romFlexion || 0).filter(v => !isNaN(v));
    const physioScores = mockAssessments.map(a => a.physioScore).filter(v => !isNaN(v));
    const painIntensities = mockAssessments.map(a => a.painIntensity).filter(v => !isNaN(v));

    return {
      rpi: Math.round(rpiScores.reduce((a, b) => a + b, 0) / rpiScores.length),
      start: (startScores.reduce((a, b) => a + b, 0) / startScores.length).toFixed(1),
      rom: Math.round(romFlexions.reduce((a, b) => a + b, 0) / romFlexions.length),
      physio: Math.round(physioScores.reduce((a, b) => a + b, 0) / physioScores.length),
      pain: (painIntensities.reduce((a, b) => a + b, 0) / painIntensities.length).toFixed(1)
    };
  }, []);

  if (!patientHistory) {
    return (
      <div style={{ fontFamily: '"DM Sans", sans-serif', backgroundColor: '#FAFBFC', minHeight: '100vh', padding: '24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1A2332', margin: '0 0 8px 0' }}>Patient Detail</h1>
          <p style={{ fontSize: '14px', color: '#647281', margin: 0 }}>View comprehensive patient assessment history and longitudinal progression</p>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Enter patient code (e.g., P023)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchId)}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #D4DEE6',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: '"DM Sans", sans-serif'
              }}
            />
            <button
              onClick={() => handleSearch(searchId)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0D6A47',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              Search
            </button>
          </div>

          {notFound ? (
            <div style={{ backgroundColor: '#FFF7EB', border: '1px solid #FFB74D', borderRadius: '8px', padding: '16px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#8B4513', fontWeight: 600 }}>Patient not found</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#8B4513' }}>Available patients: P023, P024, P025, P026, P027</p>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '12px', color: '#647281' }}>Available patients: P023, P024, P025 (false negative case), P026, P027</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="patient-print-preview" style={{ fontFamily: '"DM Sans", sans-serif', backgroundColor: '#FAFBFC', minHeight: '100vh', padding: '24px' }}>
      <style>{`
        @media print {
          body * { display: none !important; }
          #patient-print-preview {
            display: block !important;
            background: white;
            color: #1A2332;
            font-family: 'DM Sans', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
          }
          #patient-print-preview h1,
          #patient-print-preview h2,
          #patient-print-preview h3 { page-break-after: avoid; }
          #patient-print-preview table { page-break-inside: avoid; }
          #patient-print-preview .print-hidden { display: none !important; }
        }
      `}</style>

      {/* Header with search and controls */}
      <div className="print-hidden" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1A2332', margin: '0 0 8px 0' }}>Patient Detail</h1>
          <p style={{ fontSize: '14px', color: '#647281', margin: 0 }}>Longitudinal assessment history and analysis</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleSearch('P023')}
            style={{
              padding: '8px 12px',
              backgroundColor: '#F0F5FA',
              color: '#1A2332',
              border: '1px solid #D4DEE6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            ← Back
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 12px',
              backgroundColor: '#F0F5FA',
              color: '#1A2332',
              border: '1px solid #D4DEE6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => window.print()}
            style={{
              padding: '8px 12px',
              backgroundColor: '#0D6A47',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            📥 PDF
          </button>
        </div>
      </div>

      {/* Demographics */}
      <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>Demographics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#647281', fontWeight: 600 }}>Patient Code</p>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>{patientHistory.patientCode}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#647281', fontWeight: 600 }}>Age / Gender</p>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>{patientHistory.age} years, {patientHistory.gender}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#647281', fontWeight: 600 }}>BMI</p>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>{patientHistory.bmi.toFixed(1)} {patientHistory.bmi >= 30 ? '(Obese)' : patientHistory.bmi >= 25 ? '(Overweight)' : '(Normal)'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#647281', fontWeight: 600 }}>Hypertension</p>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>{patientHistory.htn ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#647281', fontWeight: 600 }}>Condition</p>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>
              {patientHistory.condition === 'back' ? 'Back Pain' : patientHistory.condition === 'shoulder' ? 'Shoulder' : 'Knee'}
            </p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#647281', fontWeight: 600 }}>Comorbidities</p>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>
              {patientHistory.comorbidities.length > 0 ? patientHistory.comorbidities.slice(0, 2).join(', ') : 'None'}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>Assessment Timeline</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #D4DEE6', backgroundColor: '#F0F5FA' }}>
              <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Timepoint</th>
              <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>Date</th>
              <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>RPI</th>
              <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>Clinician</th>
              <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>Model</th>
              <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>Match</th>
            </tr>
          </thead>
          <tbody>
            {patientHistory.assessments.map((assessment, idx) => (
              <tr
                key={idx}
                onClick={() => setSelectedAssessIdx(idx)}
                style={{
                  borderBottom: '1px solid #F0F5FA',
                  backgroundColor: selectedAssessIdx === idx ? '#F0F5FA' : idx % 2 === 0 ? 'white' : '#F9FAFB',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <td style={{ padding: '8px', fontWeight: 600, color: '#1A2332' }}>{assessment.label}</td>
                <td style={{ textAlign: 'center', padding: '8px', color: '#1A2332' }}>{assessment.date}</td>
                <td style={{ textAlign: 'center', padding: '8px', fontWeight: 600, color: TIER_COLORS[classifyTier(assessment.rpiScore)] }}>
                  {assessment.rpiScore}
                </td>
                <td style={{ textAlign: 'center', padding: '8px', fontWeight: 600, color: TIER_COLORS[assessment.clinicianTier] }}>
                  {assessment.clinicianTier}
                </td>
                <td style={{ textAlign: 'center', padding: '8px', fontWeight: 600, color: TIER_COLORS[assessment.modelTier] }}>
                  {assessment.modelTier}
                </td>
                <td style={{ textAlign: 'center', padding: '8px', color: assessment.clinicianTier === assessment.modelTier ? '#0D6A47' : '#C84C3D', fontWeight: 600 }}>
                  {assessment.clinicianTier === assessment.modelTier ? '✓' : '✗'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ margin: '12px 0 0 0', fontSize: '11px', color: '#647281' }}>Click a timepoint to view details</p>
      </div>

      {/* RPI Progression Chart */}
      <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px', marginBottom: '24px', pageBreakInside: 'avoid' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>RPI Score Progression</h3>
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={patientHistory.assessments.map(a => ({
                timepoint: a.label,
                rpi: a.rpiScore,
                tier: a.clinicianTier
              }))}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF4" />
              <XAxis dataKey="timepoint" tick={{ fontSize: 12, fill: '#647281' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#647281' }} />
              <Tooltip contentStyle={{ backgroundColor: '#FAFBFC', border: '1px solid #D4DEE6', borderRadius: '6px' }} />
              <ReferenceLine y={70} stroke={TIER_COLORS.Red} strokeDasharray="4 2" label={{ value: 'Red (≥70)', position: 'right', fontSize: 10 }} />
              <ReferenceLine y={40} stroke={TIER_COLORS.Amber} strokeDasharray="4 2" label={{ value: 'Amber (≥40)', position: 'right', fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="rpi"
                stroke="#647281"
                strokeWidth={2}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill={TIER_COLORS[payload.tier as Tier]}
                      stroke="white"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Domain Trends Grid */}
      <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>Domain Score Trends</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          {[
            { key: 'startScore', label: 'STarT Back', max: 9 },
            { key: 'romFlexion', label: 'ROM Flexion (°)', max: 120 },
            { key: 'physioScore', label: 'Physio Score', max: 100 },
            { key: 'painIntensity', label: 'Pain Intensity', max: 10 },
            { key: 'comorbidityCount', label: 'Comorbidities', max: 7 },
            { key: 'bmi', label: 'BMI', max: 35 }
          ].map((domain, idx) => (
            <div key={idx} style={{ backgroundColor: '#F9FAFB', border: '1px solid #D4DEE6', borderRadius: '8px', padding: '12px' }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 600, color: '#1A2332' }}>{domain.label}</p>
              <div style={{ height: '140px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={patientHistory.assessments.map(a => ({
                      t: a.label,
                      v: (a as any)[domain.key]
                    }))}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="2 2" stroke="#E8EDF4" />
                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#647281' }} />
                    <YAxis domain={[0, domain.max]} tick={{ fontSize: 9, fill: '#647281' }} />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="v" stroke="#0D6A47" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '10px', color: '#647281', textAlign: 'center' }}>
                {patientHistory.assessments[selectedAssessIdx][domain.key as keyof AssessmentPoint]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RPI Calculation Breakdown */}
      {selectedAssessment && (
        <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>RPI Calculation ({selectedAssessment.label})</h3>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #D4DEE6', backgroundColor: '#F0F5FA' }}>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Domain</th>
                <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>Raw</th>
                <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>Normalized</th>
                <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>Weight</th>
                <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>Contribution</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: 'STarT Back',
                  raw: `${selectedAssessment.startScore}/9`,
                  norm: ((selectedAssessment.startScore / 9) * 100).toFixed(1),
                  weight: DOMAIN_WEIGHTS.start,
                  key: 'start'
                },
                {
                  label: 'ROM Flexion',
                  raw: `${selectedAssessment.romFlexion}°`,
                  norm: (100 - Math.min(100, (selectedAssessment.romFlexion / 90) * 100)).toFixed(1),
                  weight: DOMAIN_WEIGHTS.rom,
                  key: 'rom'
                },
                {
                  label: 'Physio Score',
                  raw: `${selectedAssessment.physioScore}/100`,
                  norm: (100 - selectedAssessment.physioScore).toFixed(1),
                  weight: DOMAIN_WEIGHTS.physio,
                  key: 'physio'
                },
                {
                  label: 'Pain (Anthropometric)',
                  raw: `${selectedAssessment.painIntensity.toFixed(1)}/10`,
                  norm: ((selectedAssessment.painIntensity / 10) * 100).toFixed(1),
                  weight: DOMAIN_WEIGHTS.anthro,
                  key: 'anthro'
                },
                {
                  label: 'Comorbidities',
                  raw: `${selectedAssessment.comorbidityCount}/7`,
                  norm: Math.min(100, (selectedAssessment.comorbidityCount / 7) * 100).toFixed(1),
                  weight: DOMAIN_WEIGHTS.comor,
                  key: 'comor'
                }
              ].map((row, idx) => {
                const contribution = (parseFloat(row.norm) * row.weight) / 100;
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #F0F5FA' }}>
                    <td style={{ padding: '8px', color: '#1A2332', fontWeight: 600 }}>{row.label}</td>
                    <td style={{ textAlign: 'center', padding: '8px', color: '#1A2332' }}>{row.raw}</td>
                    <td style={{ textAlign: 'center', padding: '8px', color: '#1A2332' }}>{row.norm}%</td>
                    <td style={{ textAlign: 'center', padding: '8px', color: '#1A2332', fontWeight: 600 }}>{row.weight}%</td>
                    <td style={{ textAlign: 'center', padding: '8px', color: '#1A2332', fontWeight: 600 }}>{contribution.toFixed(1)}</td>
                  </tr>
                );
              })}
              <tr style={{ borderTop: '2px solid #D4DEE6', backgroundColor: '#F0F5FA' }}>
                <td colSpan={4} style={{ padding: '8px', color: '#1A2332', fontWeight: 600, textAlign: 'right' }}>Estimated RPI:</td>
                <td style={{ textAlign: 'center', padding: '8px', color: '#0D6A47', fontWeight: 700 }}>
                  {selectedAssessment.rpiScore}
                </td>
              </tr>
            </tbody>
          </table>
          <p style={{ margin: '12px 0 0 0', fontSize: '10px', color: '#647281' }}>
            Formula is a simplified linear approximation for scenario exploration. Actual RPI from clinical assessment.
          </p>
        </div>
      )}

      {/* Clinician vs Model Accuracy */}
      <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>Prediction Accuracy</h3>
        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #D4DEE6', backgroundColor: '#F0F5FA' }}>
              <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Assessment</th>
              <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>Clinician</th>
              <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>Model</th>
              <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>Match</th>
            </tr>
          </thead>
          <tbody>
            {patientHistory.assessments.map((assessment, idx) => {
              const match = assessment.clinicianTier === assessment.modelTier;
              return (
                <tr key={idx} style={{ borderBottom: '1px solid #F0F5FA' }}>
                  <td style={{ padding: '8px', color: '#1A2332', fontWeight: 600 }}>{assessment.label} ({assessment.date})</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    <span style={{ fontWeight: 600, color: TIER_COLORS[assessment.clinicianTier] }}>{assessment.clinicianTier}</span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    <span style={{ fontWeight: 600, color: TIER_COLORS[assessment.modelTier] }}>{assessment.modelTier}</span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px', fontWeight: 600, color: match ? '#0D6A47' : '#C84C3D' }}>
                    {match ? '✓ Yes' : '✗ No'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ marginTop: '16px', backgroundColor: '#F0F5FA', border: '1px solid #D4DEE6', borderRadius: '8px', padding: '12px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#1A2332', fontWeight: 600 }}>
            Accuracy: {patientHistory.assessments.filter(a => a.clinicianTier === a.modelTier).length}/{patientHistory.assessments.length}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#647281' }}>
            {patientHistory.assessments.every(a => a.clinicianTier === a.modelTier)
              ? 'Perfect alignment between clinician and model predictions'
              : 'Some disagreement between clinician and model'}
          </p>
        </div>
      </div>

      {/* Cohort Percentile Comparison */}
      <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>Cohort Comparison (vs 43 patients)</h3>
        {selectedAssessment && (
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #D4DEE6', backgroundColor: '#F0F5FA' }}>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Domain</th>
                <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>Patient Value</th>
                <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>Cohort Average</th>
                <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>Percentile</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'rpiScore', label: 'RPI Score', value: selectedAssessment.rpiScore, avg: cohortAvg.rpi },
                { key: 'startScore', label: 'STarT Back', value: selectedAssessment.startScore, avg: parseFloat(cohortAvg.start) },
                { key: 'romFlexion', label: 'ROM Flexion', value: selectedAssessment.romFlexion, avg: cohortAvg.rom },
                { key: 'physioScore', label: 'Physio Score', value: selectedAssessment.physioScore, avg: cohortAvg.physio },
                { key: 'painIntensity', label: 'Pain Intensity', value: selectedAssessment.painIntensity, avg: parseFloat(cohortAvg.pain) }
              ].map((domain, idx) => {
                const percentile = calculatePercentile(domain.value, domain.key);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #F0F5FA' }}>
                    <td style={{ padding: '8px', color: '#1A2332', fontWeight: 600 }}>{domain.label}</td>
                    <td style={{ textAlign: 'center', padding: '8px', color: '#1A2332' }}>
                      {typeof domain.value === 'number' && domain.value % 1 !== 0 ? domain.value.toFixed(1) : domain.value}
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px', color: '#1A2332' }}>
                      {typeof domain.avg === 'number' && domain.avg % 1 !== 0 ? domain.avg.toFixed(1) : domain.avg}
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px', color: '#0D6A47', fontWeight: 600 }}>{percentile}th</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* What-If Analysis */}
      <div className="print-hidden" style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>What-If Scenario Analysis</h3>
        {whatIfScores && selectedAssessment && (
          <>
            <div style={{ marginBottom: '20px' }}>
              {[
                { label: 'STarT Back', key: 'startScore', min: 0, max: 9, step: 1 },
                { label: 'ROM Flexion (°)', key: 'romFlexion', min: 0, max: 120, step: 1 },
                { label: 'Physio Score', key: 'physioScore', min: 0, max: 100, step: 5 },
                { label: 'Pain Intensity', key: 'painIntensity', min: 0, max: 10, step: 0.5 },
                { label: 'Comorbidities', key: 'comorbidityCount', min: 0, max: 7, step: 1 }
              ].map((field, idx) => (
                <div key={idx} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#1A2332' }}>{field.label}</label>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#0D6A47' }}>
                      {(whatIfScores as any)[field.key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={(whatIfScores as any)[field.key]}
                    onChange={(e) =>
                      setWhatIfScores({
                        ...whatIfScores,
                        [field.key]: parseFloat(e.target.value)
                      })
                    }
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#F0F5FA', border: '1px solid #D4DEE6', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>
                Estimated RPI: {recalcRPI(whatIfScores)}
              </p>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#647281' }}>
                {generateInsight(selectedAssessment, whatIfScores, recalcRPI(whatIfScores))}
              </p>
            </div>

            <button
              onClick={() => {
                setWhatIfScores({
                  startScore: selectedAssessment.startScore,
                  romFlexion: selectedAssessment.romFlexion,
                  physioScore: selectedAssessment.physioScore,
                  painIntensity: selectedAssessment.painIntensity,
                  comorbidityCount: selectedAssessment.comorbidityCount
                });
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#F0F5FA',
                color: '#1A2332',
                border: '1px solid #D4DEE6',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              Reset
            </button>
          </>
        )}
      </div>

      {/* Clinical Notes */}
      <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>Clinical Notes</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          {patientHistory.assessments.map((assessment, idx) => (
            <div key={idx} style={{ backgroundColor: '#F9FAFB', border: '1px solid #D4DEE6', borderRadius: '8px', padding: '12px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: TIER_COLORS[assessment.clinicianTier] }}>
                {assessment.label} ({assessment.date})
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: '#1A2332', lineHeight: '1.5' }}>{assessment.clinicianNotes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="print-hidden" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start' }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0D6A47',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          📥 Download PDF
        </button>
        <button
          onClick={() => {
            const html = `
              <html><head><meta charset="utf-8"><title>${patientHistory.patientCode} Report</title></head>
              <body style="font-family: Arial, sans-serif; margin: 20px;">
                <h1>${patientHistory.patientCode} - Patient Detail Report</h1>
                <p>Age: ${patientHistory.age} | Gender: ${patientHistory.gender} | BMI: ${patientHistory.bmi} | HTN: ${patientHistory.htn ? 'Yes' : 'No'}</p>
                <h2>Assessment Timeline</h2>
                <table border="1" cellpadding="8" style="width: 100%;">
                  <tr><th>Timepoint</th><th>Date</th><th>RPI</th><th>Clinician</th><th>Model</th></tr>
                  ${patientHistory.assessments.map(a => `<tr><td>${a.label}</td><td>${a.date}</td><td>${a.rpiScore}</td><td>${a.clinicianTier}</td><td>${a.modelTier}</td></tr>`).join('')}
                </table>
                <h2>Clinical Notes</h2>
                ${patientHistory.assessments.map(a => `<h3>${a.label}</h3><p>${a.clinicianNotes}</p>`).join('')}
              </body></html>`;
            const blob = new Blob([html], { type: 'application/vnd.ms-word' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `PatientDetail_${patientHistory.patientCode}_${new Date().toISOString().split('T')[0]}.doc`;
            link.click();
            URL.revokeObjectURL(url);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0D6A47',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          📄 Download DOCX
        </button>
      </div>
    </div>
  );
}
