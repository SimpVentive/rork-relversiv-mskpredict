'use client';

import { useState } from 'react';

export function ExportButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: 'csv' | 'pdf') => {
    console.log(`Export clicked: ${format}`);
    // TODO: Implement actual export logic
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          px-4 py-2 rounded bg-infoPrimary text-white text-sm font-semibold
          hover:opacity-90 transition-opacity flex items-center gap-2
        "
      >
        📥 Export Metrics
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-bgPrimary border border-borderLight rounded shadow-soft z-10 min-w-[150px]">
          <button
            onClick={() => handleExport('csv')}
            className="w-full px-4 py-2 text-left text-sm text-textPrimary hover:bg-bgSecondary transition-colors"
          >
            📄 Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="w-full px-4 py-2 text-left text-sm text-textPrimary hover:bg-bgSecondary transition-colors border-t border-borderLight"
          >
            📋 Export PDF
          </button>
        </div>
      )}
    </div>
  );
}
