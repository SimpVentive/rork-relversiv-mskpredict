import { AssessmentCondition } from '@/types/assessment';
import { AnonymizationToggle } from './AnonymizationToggle';

interface TableHeaderProps {
  anonymized: boolean;
  onAnonymizedChange: (value: boolean) => void;
  filterCondition: 'all' | AssessmentCondition;
  onConditionChange: (value: 'all' | AssessmentCondition) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filteredCount: number;
  totalCount: number;
}

export function TableHeader({
  anonymized,
  onAnonymizedChange,
  filterCondition,
  onConditionChange,
  searchTerm,
  onSearchChange,
  filteredCount,
  totalCount
}: TableHeaderProps) {
  return (
    <div className="bg-bgSecondary border-b border-borderLight p-4 space-y-4">
      {/* First row: Anonymization + Condition Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-wrap">
          <AnonymizationToggle
            isAnonymized={anonymized}
            onToggle={onAnonymizedChange}
          />

          <select
            value={filterCondition}
            onChange={(e) => onConditionChange(e.target.value as 'all' | AssessmentCondition)}
            className="px-4 py-2 rounded text-sm font-semibold bg-bgPrimary border border-borderLight text-textPrimary focus:ring-2 focus:ring-infoPrimary outline-none"
          >
            <option value="all">All Conditions</option>
            <option value="back">Back Pain</option>
            <option value="shoulder">Shoulder</option>
            <option value="knee">Knee</option>
          </select>
        </div>
      </div>

      {/* Second row: Search + Count */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <input
          type="text"
          placeholder="Search patient name or ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 px-4 py-2 rounded text-sm bg-bgPrimary border border-borderLight text-textPrimary placeholder-textSecondary focus:ring-2 focus:ring-infoPrimary outline-none"
        />

        <div className="text-sm text-textSecondary whitespace-nowrap">
          Showing <span className="font-semibold text-textPrimary">{filteredCount}</span> of{' '}
          <span className="font-semibold text-textPrimary">{totalCount}</span> assessments
        </div>
      </div>
    </div>
  );
}
