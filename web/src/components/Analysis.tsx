'use client';

import { useState, useRef, useMemo } from 'react';
import {
  ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, ErrorBar
} from 'recharts';
import { exportToXLS, exportChartAsPNG } from '@/lib/exportUtils';

type MetricType = 'continuous' | 'categorical';
type Condition = 'back' | 'shoulder' | 'knee';

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
  kneeSeverity: { key: 'kneeSeverity', type: 'continuous', name: 'Knee Severity', unit: '0-10', condition: 'knee' }
};

// Mock data generation
function generateMockAssessments(conditions: Condition[]): Assessment[] {
  const assessments: Assessment[] = [];
  const conditionSet = new Set(conditions);
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
        comorbidityCount: Math.floor(Math.random() * 4),
        startScore: condition === 'back' ? Math.floor(Math.random() * 10) : undefined,
        romFlexion: condition === 'back' ? Math.floor(Math.random() * 40 + 50) : undefined,
        physioScore: condition === 'back' ? Math.floor(Math.random() * 100) : undefined,
        severity: condition === 'shoulder' ? Math.floor(Math.random() * 11) : undefined,
        rotCuffStrength: condition === 'shoulder' ? Math.floor(Math.random() * 6) : undefined
      });
    }
  });

  return assessments;
}

// Helper functions
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
  })) as Assessment[];
}

// Correlation and statistics
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

export function Analysis() {
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

  // Generate assessments based on conditions
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

  // Generate chart data
  const chartData = useMemo(() => {
    if (!xMetric || !yMetric) return [];

    if (xMetric.type === 'categorical' && yMetric.type === 'continuous') {
      // Box plot data
      const grouped: Record<string, number[]> = {};
      assessments.forEach(a => {
        const key = String(a[xMetric.key as keyof Assessment]);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(a[yMetric.key as keyof Assessment] as number);
      });

      return Object.entries(grouped).map(([category, values]) => {
        const stats = boxPlotStats(values);
        return {
          category,
          ...stats,
          count: values.length,
          color: colorMetric ? (assessments.find(a => String(a[xMetric.key as keyof Assessment]) === category)?.[colorMetric.key as keyof Assessment]) : undefined
        };
      });
    }

    if (xMetric.type === 'continuous' && yMetric.type === 'continuous') {
      // Scatter plot data
      return assessments.map(a => ({
        x: a[xMetric.key as keyof Assessment],
        y: a[yMetric.key as keyof Assessment],
        color: colorMetric ? a[colorMetric.key as keyof Assessment] : undefined
      }));
    }

    if (xMetric.type === 'categorical' && yMetric.type === 'categorical') {
      // Cross-tabulation
      const matrix: Record<string, Record<string, number>> = {};
      xMetric.categories?.forEach(x => {
        matrix[x] = {};
        yMetric.categories?.forEach(y => {
          matrix[x][y] = 0;
        });
      });

      assessments.forEach(a => {
        const xVal = String(a[xMetric.key as keyof Assessment]);
        const yVal = String(a[yMetric.key as keyof Assessment]);
        if (matrix[xVal]) matrix[xVal][yVal] = (matrix[xVal][yVal] || 0) + 1;
      });

      return Object.entries(matrix).map(([x, yVals]) => ({
        name: x,
        ...yVals
      }));
    }

    return [];
  }, [xMetric, yMetric, colorMetric, assessments]);

  // Generate insights
  const generatedInsights = useMemo(() => {
    const newInsights: string[] = [];

    if (xMetric?.type === 'categorical' && yMetric?.type === 'continuous' && chartData.length > 0) {
      const maxCat = (chartData as any[]).reduce((a, b) => (a.mean > b.mean ? a : b));
      const minCat = (chartData as any[]).reduce((a, b) => (a.mean < b.mean ? a : b));
      newInsights.push(`${maxCat.category} has highest mean ${yMetric.name} (${maxCat.mean.toFixed(2)})`);
      newInsights.push(`${minCat.category} has lowest mean ${yMetric.name} (${minCat.mean.toFixed(2)})`);
    }

    if (xMetric?.type === 'continuous' && yMetric?.type === 'continuous') {
      const xVals = assessments.map(a => a[xMetric.key as keyof Assessment] as number);
      const yVals = assessments.map(a => a[yMetric.key as keyof Assessment] as number);
      const r = pearsonCorrelation(xVals, yVals);
      if (Math.abs(r) > 0.7) newInsights.push(`Strong correlation (r=${r.toFixed(2)})`);
      else if (Math.abs(r) > 0.4) newInsights.push(`Moderate correlation (r=${r.toFixed(2)})`);
      else newInsights.push(`Weak correlation (r=${r.toFixed(2)})`);
    }

    return newInsights;
  }, [xMetric, yMetric, chartData, assessments]);

  const handleDragStart = (e: React.DragEvent, metric: Metric) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('metric', JSON.stringify(metric));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDropX = (e: React.DragEvent) => {
    e.preventDefault();
    const metric = JSON.parse(e.dataTransfer.getData('metric')) as Metric;
    if (metric.key === yMetric?.key) {
      alert('Cannot use same metric for X and Y axes');
      return;
    }
    setXMetric(metric);
  };

  const handleDropY = (e: React.DragEvent) => {
    e.preventDefault();
    const metric = JSON.parse(e.dataTransfer.getData('metric')) as Metric;
    if (metric.key === xMetric?.key) {
      alert('Cannot use same metric for X and Y axes');
      return;
    }
    setYMetric(metric);
  };

  const handleDropColor = (e: React.DragEvent) => {
    e.preventDefault();
    const metric = JSON.parse(e.dataTransfer.getData('metric')) as Metric;
    setColorMetric(metric);
  };

  const handleGenerateChart = () => {
    if (!xMetric || !yMetric) {
      alert('Please select both X and Y metrics');
      return;
    }
    setChartType(detectedChartType);
    setInsights(generatedInsights);
  };

  const handleClearAll = () => {
    setXMetric(null);
    setYMetric(null);
    setColorMetric(null);
    setChartType('');
    setInsights([]);
  };

  const cohortSize = assessments.length;
  const cohortDesc = selectedConditions.length === 1
    ? `${cohortSize} (${selectedConditions[0]} pain assessments)`
    : `${cohortSize} (patients with ${selectedConditions.join(' AND ')})`;

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', backgroundColor: '#FAFBFC', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1A2332', margin: '0 0 8px 0' }}>Analysis & Insights</h1>
        <p style={{ fontSize: '14px', color: '#647281', margin: 0 }}>Drag & drop metrics to explore correlations and patterns</p>
      </div>

      {/* Condition Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #D4DEE6', paddingBottom: '16px' }}>
        {(['back', 'shoulder', 'knee'] as Condition[]).map(cond => (
          <button
            key={cond}
            onClick={() => {
              setSelectedConditions([cond]);
              handleClearAll();
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
          <strong>Cohort:</strong> N={cohortSize} ({cohortDesc})
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
              onDragStart={(e) => handleDragStart(e, metric)}
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
                transition: 'all 0.2s',
                hover: { backgroundColor: '#E8EDF4' }
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
              onDragOver={handleDragOver}
              onDrop={handleDropX}
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
              onDragOver={handleDragOver}
              onDrop={handleDropY}
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
            onDragOver={handleDragOver}
            onDrop={handleDropColor}
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
            onClick={handleGenerateChart}
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
            onClick={handleClearAll}
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
            <strong>Chart type:</strong> {detectedChartType} (inferred from {xMetric?.name} [{xMetric?.type}] vs {yMetric?.name} [{yMetric?.type}])
          </p>

          {/* Chart Container */}
          <div ref={chartRef} style={{ height: '400px', marginBottom: '20px' }}>
            {xMetric?.type === 'categorical' && yMetric?.type === 'continuous' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData as any[]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF4" />
                  <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#647281' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#647281' }} />
                  <Tooltip />
                  <Bar dataKey="median" fill="#D4E6F1" />
                  <Bar dataKey="mean" fill="#0D6A47" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {xMetric?.type === 'continuous' && yMetric?.type === 'continuous' && (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF4" />
                  <XAxis type="number" dataKey="x" name={xMetric.name} tick={{ fontSize: 12, fill: '#647281' }} />
                  <YAxis type="number" dataKey="y" name={yMetric.name} tick={{ fontSize: 12, fill: '#647281' }} />
                  <Tooltip />
                  <Scatter name="Data" data={chartData as any[]} fill="#0D6A47" />
                </ScatterChart>
              </ResponsiveContainer>
            )}

            {xMetric?.type === 'categorical' && yMetric?.type === 'categorical' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData as any[]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF4" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#647281' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#647281' }} />
                  <Tooltip />
                  <Legend />
                  {yMetric.categories?.map((cat, idx) => (
                    <Bar key={cat} dataKey={cat} stackId="a" fill={['#F5CCC7', '#F5E6CC', '#C8E6D7'][idx % 3]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div style={{ backgroundColor: '#F0F5FA', border: '1px solid #D4DEE6', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#1A2332' }}>Insights:</p>
              {insights.map((insight, idx) => (
                <p key={idx} style={{ margin: '4px 0', fontSize: '13px', color: '#647281' }}>• {insight}</p>
              ))}
            </div>
          )}

          {/* Export Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                if (xMetric && yMetric) {
                  exportToXLS(
                    assessments,
                    xMetric.name,
                    yMetric.name,
                    colorMetric?.name || null,
                    selectedConditions.join(' & '),
                    detectedChartType
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
                fontWeight: 600
              }}
            >
              📥 Download XLS
            </button>
            <button
              onClick={() => {
                if (chartRef.current && xMetric && yMetric) {
                  exportChartAsPNG(
                    chartRef.current,
                    xMetric.name,
                    yMetric.name,
                    colorMetric?.name || null,
                    selectedConditions.join(' & '),
                    assessments.length
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
                fontWeight: 600
              }}
            >
              📸 Download PNG
            </button>
          </div>
        </div>
      )}

      {/* Multi-Condition Modal */}
      {showMultiModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A2332', margin: '0 0 20px 0' }}>Select Conditions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {(['back', 'shoulder', 'knee'] as Condition[]).map(cond => (
                <label key={cond} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#1A2332' }}>
                  <input
                    type="checkbox"
                    checked={tempConditions.has(cond)}
                    onChange={(e) => {
                      const newSet = new Set(tempConditions);
                      if (e.target.checked) newSet.add(cond);
                      else newSet.delete(cond);
                      setTempConditions(newSet);
                    }}
                  />
                  {cond === 'back' ? '🔵 Back Pain' : cond === 'shoulder' ? '🟠 Shoulder' : '🟢 Knee'}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  if (tempConditions.size < 2) {
                    alert('Select at least 2 conditions');
                    return;
                  }
                  setSelectedConditions(Array.from(tempConditions));
                  setShowMultiModal(false);
                  handleClearAll();
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#0D6A47',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Apply
              </button>
              <button
                onClick={() => setShowMultiModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#F0F5FA',
                  color: '#1A2332',
                  border: '1px solid #D4DEE6',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
