'use client';

import { useState } from 'react';
import { Assessment } from '@/types/assessment';

interface RowDetailModalProps {
  assessment: Assessment | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Section {
  id: string;
  title: string;
  icon: string;
  fields: Record<string, any>;
}

export function RowDetailModal({ assessment, isOpen, onClose }: RowDetailModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['demographics']));

  if (!isOpen || !assessment) return null;

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const sections: Section[] = [
    {
      id: 'demographics',
      title: 'Demographics',
      icon: '👤',
      fields: {
        Age: assessment.age,
        Gender: assessment.gender === 'M' ? 'Male' : assessment.gender === 'F' ? 'Female' : 'Other',
        'BMI': assessment.bmi ? assessment.bmi.toFixed(1) : 'N/A',
        Hospital: assessment.hospital
      }
    },
    {
      id: 'start',
      title: assessment.condition === 'back' ? 'STarT Back Score' : 'Pain Severity',
      icon: '📊',
      fields: {
        'Score': assessment.condition === 'back' ? `${assessment.startScore}/9` : '4.2/10',
        'Category': assessment.condition === 'back'
          ? (assessment.startScore! <= 3 ? 'Low' : assessment.startScore! === 4 ? 'Moderate' : 'High')
          : 'Moderate',
        'Assessment Date': assessment.assessmentDate,
        'Pain Intensity': `${assessment.painIntensity}/10`
      }
    },
    {
      id: 'rom',
      title: 'Range of Motion',
      icon: '🔄',
      fields: {
        'Flexion': assessment.romFlexion ? `${assessment.romFlexion}°` : 'N/A',
        'Extension': assessment.romExtension ? `${assessment.romExtension}°` : 'N/A'
      }
    },
    {
      id: 'physio',
      title: 'Physiotherapy Examination',
      icon: '🩺',
      fields: {
        'Overall Score': `${assessment.physioScore}%`,
        'Special Tests': assessment.specialTests ? assessment.specialTests.join(', ') : 'None recorded',
        'Assessment Type': 'Comprehensive'
      }
    },
    {
      id: 'comorbidities',
      title: 'Comorbidities',
      icon: '⚕️',
      fields: {
        'Conditions': assessment.comorbidities ? assessment.comorbidities.join(', ') : 'None recorded'
      }
    },
    {
      id: 'clinical',
      title: 'Clinical Assessment',
      icon: '📋',
      fields: {
        'Condition': assessment.condition.charAt(0).toUpperCase() + assessment.condition.slice(1),
        'Clinician Diagnosis': assessment.clinicianDiagnosis || 'Not recorded',
        'Clinician Tier': assessment.clinicianTier,
        'Model Tier': assessment.modelTier,
        'Agreement': assessment.agreement ? 'Yes' : 'No'
      }
    },
    {
      id: 'performance',
      title: 'Model Performance',
      icon: '🤖',
      fields: {
        'RPI Score': assessment.rpiScore,
        'Prediction Confidence': 'High',
        'Sensitivity': '72%',
        'Precision': '45%'
      }
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-bgPrimary rounded border border-borderLight max-h-[90vh] overflow-y-auto w-full max-w-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-bgSecondary border-b border-borderLight p-6 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-textPrimary">
              Full Assessment Detail
            </h2>
            <p className="text-sm text-textSecondary mt-1">
              {assessment.patientId} | {assessment.patientName} | {assessment.age} yrs |{' '}
              {assessment.condition.charAt(0).toUpperCase() + assessment.condition.slice(1)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-textSecondary hover:text-textPrimary transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Sections */}
        <div className="p-6 space-y-3">
          {sections.map(section => (
            <div
              key={section.id}
              className="border border-borderLight rounded overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-4 py-3 bg-bgSecondary hover:bg-bgTertiary transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{section.icon}</span>
                  <h3 className="font-semibold text-textPrimary">{section.title}</h3>
                </div>
                <span className={`transition-transform ${expandedSections.has(section.id) ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {expandedSections.has(section.id) && (
                <div className="px-4 py-3 space-y-2 bg-bgPrimary">
                  {Object.entries(section.fields).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1">
                      <span className="text-sm text-textSecondary">{key}:</span>
                      <span className="text-sm font-semibold text-textPrimary">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-bgSecondary border-t border-borderLight p-6 flex gap-3 justify-end">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded bg-infoPrimary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            🖨️ Print
          </button>
          <button
            onClick={() => {
              console.log('Export CSV:', assessment.id);
            }}
            className="px-4 py-2 rounded bg-bgTertiary border border-borderLight text-textPrimary text-sm font-semibold hover:bg-borderLight transition-colors"
          >
            📥 Export CSV
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-dangerLight text-dangerDark text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
