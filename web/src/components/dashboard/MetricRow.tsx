import { MetricCard } from './MetricCard';
import { MetricCardProps } from '@/types/dashboard';

interface MetricRowProps {
  cards: MetricCardProps[];
  sectionLabel?: string;
  sectionColor?: string;
}

const conditionColors: Record<string, { light: string; primary: string; dark: string }> = {
  back: {
    light: 'bg-backLight',
    primary: 'border-l-backPrimary',
    dark: 'text-backDark'
  },
  shoulder: {
    light: 'bg-shoulderLight',
    primary: 'border-l-shoulderPrimary',
    dark: 'text-shoulderDark'
  },
  knee: {
    light: 'bg-kneeLight',
    primary: 'border-l-kneePrimary',
    dark: 'text-kneeDark'
  }
};

export function MetricRow({
  cards,
  sectionLabel,
  sectionColor = 'back'
}: MetricRowProps) {
  const colors = conditionColors[sectionColor];

  return (
    <div className="space-y-4">
      {sectionLabel && (
        <div className={`${colors.light} border-l-[3px] ${colors.primary} px-4 py-3 rounded-r`}>
          <h3 className={`text-sm font-semibold uppercase ${colors.dark}`}>
            {sectionLabel}
          </h3>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card, idx) => (
          <MetricCard key={idx} {...card} />
        ))}
      </div>
    </div>
  );
}
