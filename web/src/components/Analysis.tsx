'use client';

import { useState, useRef, useMemo } from 'react';
import {
  ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { exportToXLS, exportChartAsPNG } from '@/lib/exportUtils';

type MetricType = 'continuous' | 'categorical';
type Condition = 'back' | 'shoulder' | 'knee';
type AnalysisTab = 'correlation' | 'longitudinal';
type ClassificationType = 'TRUE_POSITIVE' | 'TRUE_POSITIVE_CONFIRMED' | 'FALSE_POSITIVE' | 'FALSE_NEGATIVE' | 'TRUE_NEGATIVE_IMPROVED' | 'TRUE_NEGATIVE_STABLE' | 'UNCLEAR';

interface Metric {
  key: string;
  type: MetricType;
  name: string;
  unit: string;
  categories?: string[];
  condition?: Condition;
}

interface Assessment {
  id: string;
  patientId: string;
  condition: Condition;
  age: number;
  gender: 'M' | 'F';
  bmi: number;
  htn: boolean;
  rpiScore: number;
  tier: 'Red' | 'Amber' | 'Green';
  agreement: boolean;
  comorbidityCount: number;
  startScore?: number;
  romFlexion?: number;
  physioScore?: number;
  severity?: number;
  rotCuffStrength?: number;
  ageBand?: string;
  bmiBand?: string;
}

interface PatientClassification {
  patientId: string;
  t0Date: string;
  t0Tier: 'Red' | 'Amber' | 'Green';
  t0RPI: number;
  t1Date: string;
  t1Tier: 'Red' | 'Amber' | 'Green';
  t1RPI: number;
  classification: ClassificationType;
  changeRPI: number;
}

interface ConfusionMetrics {
  tp: number;
  tn: number;
  fp: number;
  fn: number;
  sensitivity: number;
  specificity: number;
  ppv: number;
  npv: number;
  accuracy: number;
  falseNegativeRate: number;
}

const METRICS_LIBRARY: Record<string, Metric> = {
  age: { key: 'age', type: 'continuous', name: 'Age', unit: 'years' },
  ageBand: { key: 'ageBand', type: 'categorical', name: 'Age Band', unit: '', categories: ['20-30', '30-40', '40-50', '50-60', '60+'] },
  gender: { key: 'gender', type: 'categorical', name: 'Gender', unit: '', categories: ['M', 'F'] },
  bmi: { key: 'bmi', type: 'continuous', name: 'BMI', unit: 'kg/m²' },
  bmiBand: { key: 'bmiBand', type: 'categorical', name: 'BMI Band', unit: '', categories: ['Underweight', 'Normal', 'Overweight', 'Obese'] },
  htn: { key: 'htn', type: 'categorical', name: 'Hypertension', unit: '', categories: ['Yes', 'No'] },
  rpiScore: { key: 'rpiScore', type: 'continuous', name: 'RPI Score', unit: '0-100' },
  tier: { key: 'tier', type: 'categorical', name: 'Risk Tier', unit: '', categories: ['Red', 'Amber', 'Green'] },
  agreement: { key: 'agreement', type: 'categorical', name: 'Clinician Agreement', unit: '', categories: ['Match', 'Mismatch'] },
  comorbidityCount: { key: 'comorbidityCount', type: 'continuous', name: 'Comorbidity Count', unit: 'count' },
  startScore: { key: 'startScore', type: 'continuous', name: 'STarT Back', unit: '0-9', condition: 'back' },
  romFlexion: { key: 'romFlexion', type: 'continuous', name: 'ROM Flexion', unit: 'degrees', condition: 'back' },
  physioScore: { key: 'physioScore', type: 'continuous', name: 'Physio Score', unit: '0-100', condition: 'back' },
  severity: { key: 'severity', type: 'continuous', name: 'Severity', unit: '0-10', condition: 'shoulder' },
  rotCuffStrength: { key: 'rotCuffStrength', type: 'continuous', name: 'Rotator Cuff Strength', unit: '0-5', condition: 'shoulder' },
};

// ===== HELPER FUNCTIONS =====

function generateMockAssessments(conditions: Condition[]): Assessment[] {
  const assessments: Assessment[] = [];
  let id = 1;

  conditions.forEach(condition => {
    const count = condition === 'back' ? 43 : 38;
    for (let i = 0; i < count; i++) {
      const age = Math.floor(Math.random() * 40) + 25;
      assessments.push({
        id: `${condition}-${id++}`,
        patientId: `P${String(id).padStart(4, '0')}`,
        condition,
        age,
        gender: Math.random() > 0.5 ? 'M' : 'F',
        bmi: Math.round((Math.random() * 15 + 18) * 10) / 10,
        htn: Math.random() > 0.7,
        rpiScore: Math.floor(Math.random() * 100),
        tier: Math.random() > 0.5 ? (Math.random() > 0.5 ? 'Red' : 'Amber') : 'Green',
        agreement: Math.random() > 0.3,
        comorbidityCount: Math.floor(Math.random() * 4)
      });
    }
  });

  return assessments;
}

function getAgeBand(age: number): string {
  if (age < 30) return '20-30';
  if (age < 40) return '30-40';
  if (age < 50) return '40-50';
  if (age < 60) return '50-60';
  return '60+';
}

function getBmiBand(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function enrichAssessments(assessments: Assessment[]): Assessment[] {
  return assessments.map(a => ({
    ...a,
    ageBand: getAgeBand(a.age),
    bmiBand: getBmiBand(a.bmi)
  }));
}

function classifyOutcome(t0Tier: string, t1Tier: string, t0RPI: number, t1RPI: number): ClassificationType {
  if (t0Tier === 'Red') {
    if (t1Tier === 'Amber' || t1Tier === 'Green') return 'TRUE_POSITIVE';
    if (t1Tier === 'Red') return 'TRUE_POSITIVE_CONFIRMED';
    if (t1RPI > t0RPI + 10) return 'FALSE_POSITIVE';
    if (t1RPI < t0RPI && t1Tier === 'Red') return 'FALSE_POSITIVE';
  }

  if ((t0Tier === 'Amber' || t0Tier === 'Green') && (t1Tier === 'Red' || t1RPI > t0RPI + 15)) {
    return 'FALSE_NEGATIVE';
  }

  if ((t0Tier === 'Amber' || t0Tier === 'Green') && (t1Tier === 'Amber' || t1Tier === 'Green') && t1RPI < t0RPI) {
    return 'TRUE_NEGATIVE_IMPROVED';
  }

  if ((t0Tier === 'Amber' || t0Tier === 'Green') && t1Tier === t0Tier && Math.abs(t1RPI - t0RPI) < 5) {
    return 'TRUE_NEGATIVE_STABLE';
  }

  return 'UNCLEAR';
}

function calculateConfusionMetrics(classifications: PatientClassification[]): ConfusionMetrics {
  const tp = classifications.filter(c => c.classification === 'TRUE_POSITIVE' || c.classification === 'TRUE_POSITIVE_CONFIRMED').length;
  const tn = classifications.filter(c => c.classification === 'TRUE_NEGATIVE_IMPROVED' || c.classification === 'TRUE_NEGATIVE_STABLE').length;
  const fp = classifications.filter(c => c.classification === 'FALSE_POSITIVE').length;
  const fn = classifications.filter(c => c.classification === 'FALSE_NEGATIVE').length;
  const total = tp + tn + fp + fn;

  const sensitivity = total > 0 && (tp + fn) > 0 ? (tp / (tp + fn)) * 100 : 0;
  const specificity = total > 0 && (tn + fp) > 0 ? (tn / (tn + fp)) * 100 : 0;
  const ppv = (tp + fp) > 0 ? (tp / (tp + fp)) * 100 : 0;
  const npv = (tn + fn) > 0 ? (tn / (tn + fn)) * 100 : 0;
  const accuracy = total > 0 ? (tp + tn) / total * 100 : 0;
  const falseNegativeRate = (tp + fn) > 0 ? (fn / (fn + tp)) * 100 : 0;

  return { tp, tn, fp, fn, sensitivity, specificity, ppv, npv, accuracy, falseNegativeRate };
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b) / n;
  const meanY = y.reduce((a, b) => a + b) / n;
  const num = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
  const denX = Math.sqrt(x.reduce((sum, xi) => sum + (xi - meanX) ** 2, 0));
  const denY = Math.sqrt(y.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0));
  return denX === 0 || denY === 0 ? 0 : num / (denX * denY);
}

function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = p * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function boxPlotStats(values: number[]) {
  return {
    min: Math.min(...values),
    q1: percentile(values, 0.25),
    median: percentile(values, 0.5),
    q3: percentile(values, 0.75),
    max: Math.max(...values),
    mean: values.reduce((a, b) => a + b) / values.length
  };
}

// ===== MAIN COMPONENT =====

export function Analysis() {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('correlation');
  const [selectedConditions, setSelectedConditions] = useState<Condition[]>(['back']);
  const [showMultiModal, setShowMultiModal] = useState(false);
  const [tempConditions, setTempConditions] = useState<Set<Condition>>(new Set(['back']));
  const [xMetric, setXMetric] = useState<Metric | null>(null);
  const [yMetric, setYMetric] = useState<Metric | null>(null);
  const [colorMetric, setColorMetric] = useState<Metric | null>(null);
  const [chartType, setChartType] = useState<string>('');
  const [insights, setInsights] = useState<string[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState<'x' | 'y' | 'color' | null>(null);

  // Longitudinal state
  const [t0Date, setT0Date] = useState<string>('2026-05-15');
  const [t1Date, setT1Date] = useState<string>('2026-11-15');
  const [patientClassifications, setPatientClassifications] = useState<PatientClassification[]>([]);
  const [confusionMetrics, setConfusionMetrics] = useState<ConfusionMetrics | null>(null);
  const [longVisType, setLongVisType] = useState<'scatter' | 'bar'>('scatter');
  const [filterClassification, setFilterClassification] = useState<ClassificationType | 'All'>('All');

  // Generate assessments
  const assessments = useMemo(() => {
    const raw = generateMockAssessments(selectedConditions);
    return enrichAssessments(raw);
  }, [selectedConditions]);

  // Get available metrics
  const availableMetrics = useMemo(() => {
    return Object.values(METRICS_LIBRARY).filter(m => !m.condition || selectedConditions.includes(m.condition));
  }, [selectedConditions]);

  // Detect chart type
  const detectedChartType = useMemo(() => {
    if (!xMetric || !yMetric) return '';
    const xType = xMetric.type;
    const yType = yMetric.type;
    const hasColor = !!colorMetric;

    if (xType === 'categorical' && yType === 'continuous') return 'Box Plot';
    if (xType === 'continuous' && yType === 'categorical') return 'Horizontal Box Plot';
    if (xType === 'continuous' && yType === 'continuous') return 'Scatter Plot';
    if (xType === 'categorical' && yType === 'categorical') return hasColor ? 'Heatmap' : 'Stacked Bar Chart';
    return 'Unknown';
  }, [xMetric, yMetric, colorMetric]);

  // Analyze longitudinal data
  const handleAnalyzeLongitudinal = () => {
    if (t0Date === t1Date) {
      alert('Select different dates for T0 and T1');
      return;
    }

    const classifications: PatientClassification[] = [];

    for (let i = 1; i <= 43; i++) {
      const patientId = `P${String(i).padStart(4, '0')}`;
      const t0Tier = Math.random() > 0.88 ? 'Red' : Math.random() > 0.6 ? 'Amber' : 'Green';
      const t0RPI = Math.random() * 100;

      let t1Tier: 'Red' | 'Amber' | 'Green' = t0Tier;
      let t1RPI = t0RPI;

      if (t0Tier === 'Red') {
        if (Math.random() > 0.2) {
          t1RPI = t0RPI * 0.6;
          t1Tier = Math.random() > 0.5 ? 'Amber' : 'Green';
        }
      } else if (Math.random() < 0.05) {
        t1RPI = t0RPI + 30;
        t1Tier = 'Red';
      }

      const classification = classifyOutcome(t0Tier, t1Tier, t0RPI, t1RPI);
      classifications.push({
        patientId,
        t0Date,
        t0Tier,
        t0RPI: Math.round(t0RPI),
        t1Date,
        t1Tier,
        t1RPI: Math.round(t1RPI),
        classification,
        changeRPI: Math.round(t1RPI - t0RPI)
      });
    }

    setPatientClassifications(classifications);
    setConfusionMetrics(calculateConfusionMetrics(classifications));
  };

  const filteredClassifications = useMemo(() => {
    if (filterClassification === 'All') return patientClassifications;
    return patientClassifications.filter(c => c.classification === filterClassification);
  }, [patientClassifications, filterClassification]);

  // ===== RENDER =====

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', backgroundColor: '#FAFBFC', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1A2332', margin: '0 0 8px 0' }}>Analysis & Insights</h1>
        <p style={{ fontSize: '14px', color: '#647281', margin: 0 }}>Explore correlations and validate model performance</p>
      </div>

      {/* Tab Selection */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #D4DEE6', paddingBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('correlation')}
          style={{
            padding: '10px 16px',
            border: 'none',
            backgroundColor: activeTab === 'correlation' ? '#0D6A47' : 'transparent',
            color: activeTab === 'correlation' ? 'white' : '#647281',
            cursor: 'pointer',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          📊 Correlation Analysis
        </button>
        <button
          onClick={() => setActiveTab('longitudinal')}
          style={{
            padding: '10px 16px',
            border: 'none',
            backgroundColor: activeTab === 'longitudinal' ? '#0D6A47' : 'transparent',
            color: activeTab === 'longitudinal' ? 'white' : '#647281',
            cursor: 'pointer',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          📈 Longitudinal Validation
        </button>
      </div>

      {/* CORRELATION ANALYSIS TAB */}
      {activeTab === 'correlation' && (
        <>
          {/* Condition Tabs */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #D4DEE6', paddingBottom: '16px' }}>
            {(['back', 'shoulder', 'knee'] as Condition[]).map(cond => (
              <button
                key={cond}
                onClick={() => {
                  setSelectedConditions([cond]);
                  setXMetric(null);
                  setYMetric(null);
                  setColorMetric(null);
                  setChartType('');
                  setInsights([]);
                }}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: selectedConditions.includes(cond) && selectedConditions.length === 1 ? '#0D6A47' : 'transparent',
                  color: selectedConditions.includes(cond) && selectedConditions.length === 1 ? 'white' : '#647281',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                {cond === 'back' ? '🔵 Back Pain' : cond === 'shoulder' ? '🟠 Shoulder' : '🟢 Knee'}
              </button>
            ))}
            <button
              onClick={() => setShowMultiModal(true)}
              style={{
                padding: '10px 16px',
                border: selectedConditions.length > 1 ? '2px solid #0D6A47' : '1px solid #D4DEE6',
                backgroundColor: 'white',
                color: selectedConditions.length > 1 ? '#0D6A47' : '#647281',
                cursor: 'pointer',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              ➕ Multi-Condition
            </button>
          </div>

          {/* Cohort Summary */}
          <div style={{ backgroundColor: '#F0F5FA', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#647281' }}>
              <strong>Cohort:</strong> N={assessments.length} ({selectedConditions.length === 1 ? `${selectedConditions[0]} pain assessments` : `patients with ${selectedConditions.join(' AND ')}`})
            </p>
          </div>

          {/* Metric Cards */}
          <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>Available Metrics (Drag to drop zones)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {availableMetrics.map(metric => (
                <div
                  key={metric.key}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'copy';
                    e.dataTransfer.setData('metric', JSON.stringify(metric));
                  }}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#F0F5FA',
                    border: '1px solid #D4DEE6',
                    borderRadius: '8px',
                    cursor: 'move',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1A2332',
                    userSelect: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {metric.name} <span style={{ fontSize: '11px', color: '#647281' }}>({metric.type})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Drop Zones */}
          <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>Configure Analysis</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              {/* X-Axis */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#647281', display: 'block', marginBottom: '8px' }}>X-Axis</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const metric = JSON.parse(e.dataTransfer.getData('metric')) as Metric;
                    if (metric.key === yMetric?.key) {
                      alert('Cannot use same metric for X and Y axes');
                      return;
                    }
                    setXMetric(metric);
                  }}
                  onDragEnter={() => setDragOver('x')}
                  onDragLeave={() => setDragOver(null)}
                  style={{
                    minHeight: '120px',
                    border: dragOver === 'x' ? '2px dashed #0D6A47' : '1px solid #D4DEE6',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: dragOver === 'x' ? '#F0F5FA' : 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  {xMetric ? (
                    <>
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>{xMetric.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#647281' }}>({xMetric.type})</p>
                      <button onClick={() => setXMetric(null)} style={{ marginTop: '8px', padding: '4px 8px', fontSize: '11px', backgroundColor: '#F0F5FA', border: '1px solid #D4DEE6', borderRadius: '4px', cursor: 'pointer' }}>
                        Clear
                      </button>
                    </>
                  ) : (
                    <p style={{ margin: 0, fontSize: '12px', color: '#647281', textAlign: 'center' }}>Drop metric here</p>
                  )}
                </div>
              </div>

              {/* Y-Axis */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#647281', display: 'block', marginBottom: '8px' }}>Y-Axis</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const metric = JSON.parse(e.dataTransfer.getData('metric')) as Metric;
                    if (metric.key === xMetric?.key) {
                      alert('Cannot use same metric for X and Y axes');
                      return;
                    }
                    setYMetric(metric);
                  }}
                  onDragEnter={() => setDragOver('y')}
                  onDragLeave={() => setDragOver(null)}
                  style={{
                    minHeight: '120px',
                    border: dragOver === 'y' ? '2px dashed #0D6A47' : '1px solid #D4DEE6',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: dragOver === 'y' ? '#F0F5FA' : 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  {yMetric ? (
                    <>
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>{yMetric.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#647281' }}>({yMetric.type})</p>
                      <button onClick={() => setYMetric(null)} style={{ marginTop: '8px', padding: '4px 8px', fontSize: '11px', backgroundColor: '#F0F5FA', border: '1px solid #D4DEE6', borderRadius: '4px', cursor: 'pointer' }}>
                        Clear
                      </button>
                    </>
                  ) : (
                    <p style={{ margin: 0, fontSize: '12px', color: '#647281', textAlign: 'center' }}>Drop metric here</p>
                  )}
                </div>
              </div>
            </div>

            {/* Color-by */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#647281', display: 'block', marginBottom: '8px' }}>Color-by (Optional)</label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const metric = JSON.parse(e.dataTransfer.getData('metric')) as Metric;
                  setColorMetric(metric);
                }}
                onDragEnter={() => setDragOver('color')}
                onDragLeave={() => setDragOver(null)}
                style={{
                  minHeight: '100px',
                  border: dragOver === 'color' ? '2px dashed #0D6A47' : '1px solid #D4DEE6',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: dragOver === 'color' ? '#F0F5FA' : 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                {colorMetric ? (
                  <>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>{colorMetric.name}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#647281' }}>({colorMetric.type})</p>
                    <button onClick={() => setColorMetric(null)} style={{ marginTop: '8px', padding: '4px 8px', fontSize: '11px', backgroundColor: '#F0F5FA', border: '1px solid #D4DEE6', borderRadius: '4px', cursor: 'pointer' }}>
                      Clear
                    </button>
                  </>
                ) : (
                  <p style={{ margin: 0, fontSize: '12px', color: '#647281', textAlign: 'center' }}>Drop metric here</p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  if (!xMetric || !yMetric) {
                    alert('Please select both X and Y metrics');
                    return;
                  }
                  setChartType(detectedChartType);
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
                🔄 Generate Chart
              </button>
              <button
                onClick={() => {
                  setXMetric(null);
                  setYMetric(null);
                  setColorMetric(null);
                  setChartType('');
                  setInsights([]);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#F0F5FA',
                  color: '#1A2332',
                  border: '1px solid #D4DEE6',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Chart Output */}
          {chartType && (
            <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#647281' }}>
                <strong>Chart type:</strong> {detectedChartType}
              </p>

              <div ref={chartRef} style={{ height: '400px', marginBottom: '20px' }}>
                {xMetric?.type === 'categorical' && yMetric?.type === 'continuous' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF4" />
                      <XAxis type="category" tick={{ fontSize: 12, fill: '#647281' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#647281' }} />
                      <Tooltip />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {xMetric?.type === 'continuous' && yMetric?.type === 'continuous' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF4" />
                      <XAxis type="number" dataKey="x" name={xMetric.name} tick={{ fontSize: 12, fill: '#647281' }} />
                      <YAxis type="number" dataKey="y" name={yMetric.name} tick={{ fontSize: 12, fill: '#647281' }} />
                      <Tooltip />
                      <Scatter name="Data" data={[]} fill="#0D6A47" />
                    </ScatterChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ padding: '10px 16px', backgroundColor: '#0D6A47', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  📥 Download XLS
                </button>
                <button style={{ padding: '10px 16px', backgroundColor: '#0D6A47', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  📸 Download PNG
                </button>
              </div>
            </div>
          )}

          {/* Multi-Condition Modal */}
          {showMultiModal && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '400px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A2332', margin: '0 0 20px 0' }}>Select Conditions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {(['back', 'shoulder', 'knee'] as Condition[]).map(cond => (
                    <label key={cond} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#1A2332' }}>
                      <input type="checkbox" defaultChecked={tempConditions.has(cond)} onChange={(e) => {
                        const newSet = new Set(tempConditions);
                        if (e.target.checked) newSet.add(cond);
                        else newSet.delete(cond);
                        setTempConditions(newSet);
                      }} />
                      {cond === 'back' ? '🔵 Back Pain' : cond === 'shoulder' ? '🟠 Shoulder' : '🟢 Knee'}
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => { if (tempConditions.size < 2) { alert('Select at least 2 conditions'); return; } setSelectedConditions(Array.from(tempConditions)); setShowMultiModal(false); }} style={{ flex: 1, padding: '10px', backgroundColor: '#0D6A47', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    Apply
                  </button>
                  <button onClick={() => setShowMultiModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#F0F5FA', color: '#1A2332', border: '1px solid #D4DEE6', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* LONGITUDINAL VALIDATION TAB */}
      {activeTab === 'longitudinal' && (
        <>
          {/* Condition Tabs */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #D4DEE6', paddingBottom: '16px' }}>
            {(['back', 'shoulder', 'knee'] as Condition[]).map(cond => (
              <button
                key={cond}
                onClick={() => {
                  setSelectedConditions([cond]);
                  setPatientClassifications([]);
                  setConfusionMetrics(null);
                }}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: selectedConditions.includes(cond) && selectedConditions.length === 1 ? '#0D6A47' : 'transparent',
                  color: selectedConditions.includes(cond) && selectedConditions.length === 1 ? 'white' : '#647281',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                {cond === 'back' ? '🔵 Back Pain' : cond === 'shoulder' ? '🟠 Shoulder' : '🟢 Knee'}
              </button>
            ))}
          </div>

          {/* Timepoint Selection */}
          <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>Select Timepoints</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#647281', display: 'block', marginBottom: '8px' }}>Baseline (T0)</label>
                <input
                  type="date"
                  value={t0Date}
                  onChange={(e) => setT0Date(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4DEE6', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#647281', display: 'block', marginBottom: '8px' }}>Follow-up (T1)</label>
                <input
                  type="date"
                  value={t1Date}
                  onChange={(e) => setT1Date(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4DEE6', fontSize: '13px' }}
                />
              </div>
            </div>
            <button
              onClick={handleAnalyzeLongitudinal}
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
              🔄 Analyze
            </button>
          </div>

          {confusionMetrics && (
            <>
              {/* Cohort & Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#F0F5FA', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#647281', margin: '0 0 8px 0' }}>Cohort Size</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#1A2332', margin: 0 }}>N={patientClassifications.length}</p>
                </div>
                <div style={{ backgroundColor: '#F0F5FA', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#647281', margin: '0 0 8px 0' }}>Sensitivity (Recall)</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#0D6A47', margin: 0 }}>{confusionMetrics.sensitivity.toFixed(0)}%</p>
                </div>
                <div style={{ backgroundColor: '#F0F5FA', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#647281', margin: '0 0 8px 0' }}>Specificity</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#0D6A47', margin: 0 }}>{confusionMetrics.specificity.toFixed(0)}%</p>
                </div>
                <div style={{ backgroundColor: '#F0F5FA', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#647281', margin: '0 0 8px 0' }}>Accuracy</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#0D6A47', margin: 0 }}>{confusionMetrics.accuracy.toFixed(0)}%</p>
                </div>
              </div>

              {/* Confusion Matrix */}
              <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>Confusion Matrix</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A2332', padding: '8px' }}>—</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A2332', padding: '8px', textAlign: 'center', backgroundColor: '#F0F5FA', borderRadius: '4px' }}>High Risk (T1)</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A2332', padding: '8px', textAlign: 'center', backgroundColor: '#F0F5FA', borderRadius: '4px' }}>Low Risk (T1)</div>

                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A2332', padding: '8px' }}>T0 Red</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0D6A47', padding: '8px', textAlign: 'center', backgroundColor: '#C8E6D7', borderRadius: '4px' }}>{confusionMetrics.tp}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0D6A47', padding: '8px', textAlign: 'center', backgroundColor: '#F0F5FA', borderRadius: '4px' }}>{confusionMetrics.fp}</div>

                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A2332', padding: '8px' }}>T0 Green</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#C84C3D', padding: '8px', textAlign: 'center', backgroundColor: '#F5CCC7', borderRadius: '4px' }}>{confusionMetrics.fn}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0D6A47', padding: '8px', textAlign: 'center', backgroundColor: '#D4E6F1', borderRadius: '4px' }}>{confusionMetrics.tn}</div>
                </div>

                <div style={{ backgroundColor: '#F0F5FA', borderRadius: '8px', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#647281', margin: '0 0 4px 0' }}>Sensitivity (TP Rate)</p>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#0D6A47', margin: 0 }}>{confusionMetrics.sensitivity.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#647281', margin: '0 0 4px 0' }}>Specificity (TN Rate)</p>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#0D6A47', margin: 0 }}>{confusionMetrics.specificity.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#647281', margin: '0 0 4px 0' }}>PPV</p>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#0D6A47', margin: 0 }}>{confusionMetrics.ppv.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#647281', margin: '0 0 4px 0' }}>NPV</p>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#0D6A47', margin: 0 }}>{confusionMetrics.npv.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#647281', margin: '0 0 4px 0' }}>False Negative Rate</p>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: confusionMetrics.falseNegativeRate > 5 ? '#C84C3D' : '#0D6A47', margin: 0 }}>{confusionMetrics.falseNegativeRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Scatter Plot */}
              <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px', marginBottom: '24px' }} data-longitudinal-chart>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>T0 RPI vs T1 RPI</h3>
                <div style={{ height: '400px', marginBottom: '16px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF4" />
                      <XAxis type="number" dataKey="t0RPI" name="T0 RPI" label={{ value: 'T0 RPI', position: 'bottom' }} tick={{ fontSize: 12, fill: '#647281' }} />
                      <YAxis type="number" dataKey="t1RPI" name="T1 RPI" label={{ value: 'T1 RPI', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12, fill: '#647281' }} />
                      <Tooltip />
                      <Scatter
                        name="Outcomes"
                        data={patientClassifications.map(c => ({
                          ...c,
                          fill: c.classification.includes('TRUE_POSITIVE') ? '#C8E6D7' : c.classification.includes('FALSE_NEGATIVE') ? '#A52D28' : '#D4E6F1'
                        }))}
                        fill="#0D6A47"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Export Buttons */}
              <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    const data = [{
                      'Analysis': 'Longitudinal Validation',
                      'Condition': selectedConditions[0],
                      'Cohort Size': patientClassifications.length,
                      'Baseline Date': t0Date,
                      'Follow-up Date': t1Date,
                      'Sensitivity': confusionMetrics.sensitivity.toFixed(1),
                      'Specificity': confusionMetrics.specificity.toFixed(1),
                      'Accuracy': confusionMetrics.accuracy.toFixed(1),
                      'PPV': confusionMetrics.ppv.toFixed(1),
                      'NPV': confusionMetrics.npv.toFixed(1),
                      'Generated': new Date().toISOString()
                    }];
                    const patientData = patientClassifications.map(c => ({
                      'Patient': c.patientId,
                      'T0 Tier': c.t0Tier,
                      'T0 RPI': c.t0RPI,
                      'T1 Tier': c.t1Tier,
                      'T1 RPI': c.t1RPI,
                      'Change RPI': c.changeRPI,
                      'Classification': c.classification
                    }));
                    exportToXLS(
                      patientData,
                      'T0 RPI',
                      'T1 RPI',
                      'Classification',
                      selectedConditions[0],
                      'Longitudinal'
                    );
                  }}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#0D6A47',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  📥 Export XLS
                </button>
                <button
                  onClick={async () => {
                    const scatterElement = document.querySelector('[data-longitudinal-chart]') as HTMLDivElement;
                    if (scatterElement) {
                      await exportChartAsPNG(
                        scatterElement,
                        'T0 RPI',
                        'T1 RPI',
                        'Outcome',
                        selectedConditions[0],
                        patientClassifications.length
                      );
                    }
                  }}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#0D6A47',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  📸 Export PNG
                </button>
              </div>

              {/* Patient Table */}
              <div style={{ backgroundColor: 'white', border: '1px solid #D4DEE6', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', margin: '0 0 16px 0' }}>Patient Outcomes</h3>
                <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['All', 'TRUE_POSITIVE', 'TRUE_NEGATIVE_IMPROVED', 'TRUE_NEGATIVE_STABLE', 'FALSE_NEGATIVE', 'FALSE_POSITIVE'].map((filt: any) => (
                    <button
                      key={filt}
                      onClick={() => setFilterClassification(filt as any)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: filterClassification === filt ? '#0D6A47' : '#F0F5FA',
                        color: filterClassification === filt ? 'white' : '#1A2332',
                        border: filterClassification === filt ? 'none' : '1px solid #D4DEE6',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                    >
                      {filt === 'All' ? 'All' : filt === 'TRUE_POSITIVE' ? 'TP' : filt === 'FALSE_NEGATIVE' ? 'FN' : filt === 'FALSE_POSITIVE' ? 'FP' : 'TN'}
                    </button>
                  ))}
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #D4DEE6', backgroundColor: '#F0F5FA' }}>
                        <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, color: '#1A2332' }}>Patient</th>
                        <th style={{ textAlign: 'center', padding: '12px', fontWeight: 600, color: '#1A2332' }}>T0 Tier</th>
                        <th style={{ textAlign: 'center', padding: '12px', fontWeight: 600, color: '#1A2332' }}>T0 RPI</th>
                        <th style={{ textAlign: 'center', padding: '12px', fontWeight: 600, color: '#1A2332' }}>T1 Tier</th>
                        <th style={{ textAlign: 'center', padding: '12px', fontWeight: 600, color: '#1A2332' }}>T1 RPI</th>
                        <th style={{ textAlign: 'center', padding: '12px', fontWeight: 600, color: '#1A2332' }}>Change</th>
                        <th style={{ textAlign: 'center', padding: '12px', fontWeight: 600, color: '#1A2332' }}>Class</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClassifications.slice(0, 15).map((c, idx) => (
                        <tr key={idx} style={{
                          borderBottom: '1px solid #D4DEE6',
                          backgroundColor: c.classification.includes('FALSE_NEGATIVE') ? '#F5CCC7' : idx % 2 === 0 ? 'white' : '#F9FAFB'
                        }}>
                          <td style={{ padding: '10px 12px', color: '#1A2332', fontWeight: 600 }}>{c.patientId}</td>
                          <td style={{ textAlign: 'center', padding: '10px 12px', color: '#1A2332' }}>{c.t0Tier}</td>
                          <td style={{ textAlign: 'center', padding: '10px 12px', color: '#1A2332' }}>{c.t0RPI}</td>
                          <td style={{ textAlign: 'center', padding: '10px 12px', color: '#1A2332' }}>{c.t1Tier}</td>
                          <td style={{ textAlign: 'center', padding: '10px 12px', color: '#1A2332' }}>{c.t1RPI}</td>
                          <td style={{ textAlign: 'center', padding: '10px 12px', color: '#1A2332' }}>{c.changeRPI > 0 ? '↑' : c.changeRPI < 0 ? '↓' : '—'} {Math.abs(c.changeRPI)}</td>
                          <td style={{ textAlign: 'center', padding: '10px 12px', color: '#1A2332', fontWeight: 600 }}>{c.classification.includes('TRUE_POSITIVE') ? 'TP' : c.classification.includes('FALSE_NEGATIVE') ? 'FN' : c.classification.includes('FALSE_POSITIVE') ? 'FP' : 'TN'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p style={{ fontSize: '11px', color: '#647281', marginTop: '12px' }}>Showing {Math.min(15, filteredClassifications.length)} of {filteredClassifications.length} patients</p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
