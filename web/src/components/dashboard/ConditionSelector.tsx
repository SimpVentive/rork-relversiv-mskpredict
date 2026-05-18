import { Condition } from '@/types/dashboard';

interface ConditionSelectorProps {
  selected: Condition;
  onChange: (condition: Condition) => void;
}

const conditions = [
  { id: 'back' as Condition, label: '🏃 Back Pain', color: 'backPrimary', lightBg: 'backLight', darkText: 'backDark' },
  { id: 'shoulder' as Condition, label: '💪 Shoulder', color: 'shoulderPrimary', lightBg: 'shoulderLight', darkText: 'shoulderDark' },
  { id: 'knee' as Condition, label: '🦵 Knee', color: 'kneePrimary', lightBg: 'kneeLight', darkText: 'kneeDark' }
];

export function ConditionSelector({ selected, onChange }: ConditionSelectorProps) {
  return (
    <div className="flex gap-3 flex-wrap">
      {conditions.map(condition => (
        <button
          key={condition.id}
          onClick={() => onChange(condition.id)}
          className={`
            px-4 py-2 rounded text-sm font-semibold transition-all
            ${selected === condition.id
              ? `bg-${condition.lightBg} border-2 border-${condition.color} text-${condition.darkText}`
              : 'bg-bgSecondary border border-borderLight text-textSecondary hover:bg-bgTertiary'
            }
          `}
        >
          {condition.label}
        </button>
      ))}
    </div>
  );
}
