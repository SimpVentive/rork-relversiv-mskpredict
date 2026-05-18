import { Cohort, CohortData } from '@/types/dashboard';

interface CohortSelectorProps {
  selected: Cohort;
  cohortData: CohortData;
  onChange: (cohort: Cohort) => void;
}

const cohorts: { id: Cohort; label: string }[] = [
  { id: 'all', label: 'All Patients' },
  { id: 'back-only', label: 'Back Only' },
  { id: 'shoulder-only', label: 'Shoulder Only' },
  { id: 'knee-only', label: 'Knee Only' },
  { id: 'back-shoulder', label: 'Back + Shoulder' },
  { id: 'back-knee', label: 'Back + Knee' },
  { id: 'shoulder-knee', label: 'Shoulder + Knee' },
  { id: 'all-three', label: 'All Three Conditions' }
];

export function CohortSelector({
  selected,
  cohortData,
  onChange
}: CohortSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Venn Diagram SVG */}
      <div className="hidden md:flex justify-center py-6">
        <svg width="300" height="250" viewBox="0 0 300 250" className="max-w-full">
          {/* Back circle */}
          <circle cx="90" cy="110" r="70" fill="var(--back-light)" stroke="var(--back-primary)" strokeWidth="2" opacity="0.6" />

          {/* Shoulder circle */}
          <circle cx="210" cy="110" r="70" fill="var(--shoulder-light)" stroke="var(--shoulder-primary)" strokeWidth="2" opacity="0.6" />

          {/* Knee circle */}
          <circle cx="150" cy="170" r="70" fill="var(--knee-light)" stroke="var(--knee-primary)" strokeWidth="2" opacity="0.6" />

          {/* Labels */}
          <text x="50" y="80" fontSize="14" fontWeight="bold" fill="var(--back-dark)">Back</text>
          <text x="220" y="80" fontSize="14" fontWeight="bold" fill="var(--shoulder-dark)">Shoulder</text>
          <text x="140" y="230" fontSize="14" fontWeight="bold" fill="var(--knee-dark)">Knee</text>

          {/* Counts in overlap zones */}
          <text x="70" y="115" fontSize="12" fontWeight="bold" textAnchor="middle" fill="var(--back-dark)">5</text>
          <text x="230" y="115" fontSize="12" fontWeight="bold" textAnchor="middle" fill="var(--shoulder-dark)">2</text>
          <text x="150" y="190" fontSize="12" fontWeight="bold" textAnchor="middle" fill="var(--knee-dark)">3</text>
          <text x="130" y="130" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#666">3</text>
          <text x="170" y="140" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#666">1</text>
          <text x="150" y="155" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#666">2</text>
          <text x="150" y="115" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#333">4</text>
        </svg>
      </div>

      {/* Cohort Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {cohorts.map(cohort => (
          <button
            key={cohort.id}
            onClick={() => onChange(cohort.id)}
            className={`
              px-3 py-2 rounded text-sm font-semibold transition-all text-center
              ${selected === cohort.id
                ? 'bg-infoPrimary text-white border border-infoPrimary'
                : 'bg-bgSecondary border border-borderLight text-textSecondary hover:bg-bgTertiary'
              }
            `}
          >
            {cohort.label}
          </button>
        ))}
      </div>

      {/* Breakdown Table */}
      <div className="bg-bgSecondary border border-borderLight rounded p-4">
        <h4 className="text-sm font-semibold text-textPrimary mb-3">Patient Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-backPrimary">{cohortData.breakdown.backOnly}</p>
            <p className="text-xs text-textSecondary">Back Only</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-shoulderPrimary">{cohortData.breakdown.shoulderOnly}</p>
            <p className="text-xs text-textSecondary">Shoulder Only</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-kneePrimary">{cohortData.breakdown.kneeOnly}</p>
            <p className="text-xs text-textSecondary">Knee Only</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-infoPrimary">{cohortData.breakdown.allThree}</p>
            <p className="text-xs text-textSecondary">All Three</p>
          </div>
        </div>
      </div>
    </div>
  );
}
