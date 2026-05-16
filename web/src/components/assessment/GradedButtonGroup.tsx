import { cn } from "@/lib/utils";

interface GradedButtonGroupProps {
  label: string;
  value: 0 | 1 | 2 | 3 | 4 | 5;
  onChange: (value: 0 | 1 | 2 | 3 | 4 | 5) => void;
  showLocation?: boolean;
  location?: string;
  onLocationChange?: (location: string) => void;
}

export function GradedButtonGroup({
  label,
  value,
  onChange,
  showLocation = false,
  location = "",
  onLocationChange,
}: GradedButtonGroupProps) {
  const getButtonColor = (val: number): string => {
    if (val === 0) return "bg-successLight text-successDark border-successPrimary";
    if (val === 3) return "bg-warningLight text-warningDark border-warningPrimary";
    if (val === 5) return "bg-dangerLight text-dangerDark border-dangerPrimary";
    return "bg-bgSecondary text-textSecondary border-borderLight";
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-textPrimary">{label}</label>
      <div className="flex gap-2">
        {[0, 3, 5].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val as 0 | 3 | 5)}
            className={cn(
              "flex-1 py-2 px-3 rounded border transition-all font-semibold",
              value === val
                ? getButtonColor(val)
                : "bg-bgPrimary border-borderLight text-textSecondary"
            )}
          >
            {val === 0 && "Normal"}
            {val === 3 && "Mild"}
            {val === 5 && "Marked"}
          </button>
        ))}
      </div>

      {showLocation && (
        <input
          type="text"
          value={location}
          onChange={(e) => onLocationChange?.(e.target.value)}
          placeholder="Location (e.g., L5, Bilateral)"
          className="w-full px-3 py-2 border border-borderLight rounded text-sm focus:ring-2 focus:ring-infoPrimary focus:ring-offset-1 outline-none"
        />
      )}
    </div>
  );
}
