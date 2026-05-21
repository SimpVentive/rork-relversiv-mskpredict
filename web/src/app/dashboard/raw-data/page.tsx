'use client';

import { useAssessmentData } from '@/hooks/useAssessmentData';
import { TableHeader } from '@/components/rawdata/TableHeader';
import { AssessmentTable } from '@/components/rawdata/AssessmentTable';
import { RowDetailModal } from '@/components/rawdata/RowDetailModal';

export default function RawDataPage() {
  const {
    data,
    totalCount,
    filteredCount,
    filterCondition,
    setFilterCondition,
    searchTerm,
    setSearchTerm,
    anonymized,
    setAnonymized,
    sortBy,
    sortOrder,
    handleSort,
    selectedRow,
    setSelectedRow
  } = useAssessmentData();

  const handleExport = () => {
    console.log('Export table clicked');
    // TODO: Implement CSV export for entire table
  };

  return (
    <div className="min-h-screen bg-bgPrimary">
      {/* Header */}
      <header className="bg-bgSecondary border-b border-borderLight shadow-soft sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-textPrimary">
                Raw Assessment Data
              </h1>
              <p className="text-sm text-textSecondary mt-1">
                Hospital ground truth — all assessments with sorting, filtering, and drill-down details
              </p>
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded bg-infoPrimary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              📥 Export Table
            </button>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <TableHeader
        anonymized={anonymized}
        onAnonymizedChange={setAnonymized}
        filterCondition={filterCondition}
        onConditionChange={setFilterCondition}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filteredCount={filteredCount}
        totalCount={totalCount}
      />

      {/* Table */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-bgPrimary rounded border border-borderLight overflow-hidden">
          <AssessmentTable
            data={data}
            anonymized={anonymized}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={setSelectedRow}
          />
        </div>
      </main>

      {/* Row Detail Modal */}
      <RowDetailModal
        assessment={selectedRow}
        isOpen={selectedRow !== null}
        onClose={() => setSelectedRow(null)}
      />
    </div>
  );
}
