import { MetricCardProps } from '@/types/dashboard';

export function MetricCard({
  label,
  value,
  subtext,
  onClick,
  isClickable = false
}: MetricCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-bgSecondary border border-borderLight rounded-[12px] p-[14px]
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:bg-bgTertiary hover:border-borderDarker' : ''}
      `}
    >
      <p className="text-[12px] uppercase font-semibold text-textSecondary mb-2">
        {label}
      </p>
      <p className="text-[22px] font-bold text-textPrimary mb-1">
        {value}
      </p>
      {subtext && (
        <p className="text-[11px] text-textSecondary">
          {subtext}
        </p>
      )}
    </div>
  );
}
