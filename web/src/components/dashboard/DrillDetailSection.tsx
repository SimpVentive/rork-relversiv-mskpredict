'use client';

import { useState } from 'react';

interface DrillDetailSectionProps {
  metric: string;
  title: string;
  icon?: string;
  color?: 'back' | 'shoulder' | 'knee';
  onClose?: () => void;
}

const colorMap: Record<string, { light: string; primary: string; dark: string }> = {
  back: { light: 'bg-backLight', primary: 'text-backPrimary', dark: 'text-backDark' },
  shoulder: { light: 'bg-shoulderLight', primary: 'text-shoulderPrimary', dark: 'text-shoulderDark' },
  knee: { light: 'bg-kneeLight', primary: 'text-kneePrimary', dark: 'text-kneeDark' }
};

export function DrillDetailSection({
  metric,
  title,
  icon = '📊',
  color = 'back',
  onClose
}: DrillDetailSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = colorMap[color];

  return (
    <div className="bg-bgSecondary border border-borderLight rounded">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 cursor-pointer hover:bg-bgTertiary transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-textPrimary">{title}</p>
            <p className="text-xs text-textSecondary">Metric: {metric}</p>
          </div>
        </div>
        <span className={`text-xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>

      {isOpen && (
        <div className="border-t border-borderLight p-4 bg-bgPrimary">
          <div className="h-[300px] flex items-center justify-center border border-dashed border-borderLight rounded bg-white">
            <p className="text-textSecondary text-sm">
              📈 Chart placeholder for {title}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-bgSecondary border border-borderLight rounded text-sm text-textPrimary hover:bg-bgTertiary transition-colors"
            >
              Close
            </button>
          )}
        </div>
      )}
    </div>
  );
}
