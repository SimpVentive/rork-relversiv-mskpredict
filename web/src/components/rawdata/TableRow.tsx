import { Assessment } from '@/types/assessment';

interface TableRowProps {
  assessment: Assessment;
  anonymized: boolean;
  onRowClick: (assessment: Assessment) => void;
}

const tierColors: Record<string, { bg: string; text: string }> = {
  Red: { bg: 'bg-dangerLight', text: 'text-dangerDark' },
  Amber: { bg: 'bg-warningLight', text: 'text-warningDark' },
  Green: { bg: 'bg-successLight', text: 'text-successDark' }
};

const conditionLabels: Record<string, string> = {
  back: 'Back',
  shoulder: 'Shoulder',
  knee: 'Knee'
};

export function TableRow({ assessment, anonymized, onRowClick }: TableRowProps) {
  const clinicianColors = tierColors[assessment.clinicianTier];
  const modelColors = tierColors[assessment.modelTier];
  const patientDisplay = anonymized ? assessment.patientId : assessment.patientName;

  return (
    <tr
      onClick={() => onRowClick(assessment)}
      className="hover:bg-bgTertiary cursor-pointer transition-colors border-b border-bgTertiary text-sm"
    >
      {/* Patient Name / ID */}
      <td className="px-4 py-3 font-medium text-textPrimary">
        {patientDisplay}
      </td>

      {/* Condition */}
      <td className="px-4 py-3 text-textSecondary">
        {conditionLabels[assessment.condition]}
      </td>

      {/* STarT / Severity */}
      <td className="px-4 py-3 text-center text-textPrimary font-semibold">
        {assessment.startScore ? `${assessment.startScore}/9` : 'N/A'}
      </td>

      {/* ROM */}
      <td className="px-4 py-3 text-center text-textPrimary font-semibold">
        {assessment.romFlexion ? `${assessment.romFlexion}°` : 'N/A'}
      </td>

      {/* Physio Score */}
      <td className="px-4 py-3 text-center text-textPrimary font-semibold">
        {assessment.physioScore}
      </td>

      {/* Clinician Tier */}
      <td className="px-4 py-3 text-center">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${clinicianColors.bg} ${clinicianColors.text}`}
        >
          {assessment.clinicianTier}
        </span>
      </td>

      {/* Model Tier */}
      <td className="px-4 py-3 text-center">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${modelColors.bg} ${modelColors.text}`}
        >
          {assessment.modelTier}
        </span>
      </td>

      {/* Agreement */}
      <td className="px-4 py-3 text-center">
        <span className={assessment.agreement ? 'text-successPrimary text-lg' : 'text-dangerPrimary text-lg'}>
          {assessment.agreement ? '✓' : '✗'}
        </span>
      </td>

      {/* RPI Score */}
      <td className="px-4 py-3 text-center text-textPrimary font-semibold">
        {assessment.rpiScore}
      </td>
    </tr>
  );
}
