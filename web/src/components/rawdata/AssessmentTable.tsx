import { Assessment } from '@/types/assessment';
import { TableRow } from './TableRow';

interface AssessmentTableProps {
  data: Assessment[];
  anonymized: boolean;
  sortBy: keyof Assessment;
  sortOrder: 'asc' | 'desc';
  onSort: (column: keyof Assessment) => void;
  onRowClick: (assessment: Assessment) => void;
}

const columnHeaders: Record<string, { label: string; key: keyof Assessment; sortable: boolean }> = {
  patient: { label: 'Patient', key: 'patientName', sortable: true },
  condition: { label: 'Condition', key: 'condition', sortable: true },
  start: { label: 'STarT / Severity', key: 'startScore', sortable: true },
  rom: { label: 'ROM', key: 'romFlexion', sortable: true },
  physio: { label: 'Physio Score', key: 'physioScore', sortable: true },
  clinician: { label: 'Clinician Tier', key: 'clinicianTier', sortable: true },
  model: { label: 'Model Tier', key: 'modelTier', sortable: true },
  agreement: { label: 'Agreement', key: 'agreement', sortable: true },
  rpi: { label: 'RPI Score', key: 'rpiScore', sortable: true }
};

export function AssessmentTable({
  data,
  anonymized,
  sortBy,
  sortOrder,
  onSort,
  onRowClick
}: AssessmentTableProps) {
  const getSortIcon = (columnKey: keyof Assessment) => {
    if (sortBy !== columnKey) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getHeaderClass = (columnKey: keyof Assessment) => {
    const isActive = sortBy === columnKey;
    return `
      px-4 py-3 text-left text-xs uppercase font-semibold cursor-pointer
      ${isActive ? 'text-textPrimary' : 'text-textSecondary'}
      hover:text-textPrimary transition-colors
    `;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-bgPrimary border border-borderLight rounded">
        <thead className="bg-bgSecondary border-b border-borderLight">
          <tr>
            {Object.entries(columnHeaders).map(([key, header]) => (
              <th
                key={key}
                onClick={() => header.sortable && onSort(header.key)}
                className={getHeaderClass(header.key)}
              >
                <div className="flex items-center gap-1">
                  {header.label}
                  {header.sortable && <span className="text-xs">{getSortIcon(header.key)}</span>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-textSecondary">
                No assessments found
              </td>
            </tr>
          ) : (
            data.map((assessment, idx) => (
              <TableRow
                key={assessment.id}
                assessment={assessment}
                anonymized={anonymized}
                onRowClick={onRowClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
