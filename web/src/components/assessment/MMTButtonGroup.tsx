import { cn } from "@/lib/utils";

interface MMTButtonGroupProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function MMTButtonGroup({ label, value, onChange }: MMTButtonGroupProps) {
  const getButtonColor = (val: number): string => {
    if (val >= 4) return "bg-successLight text-successDark border-successPrimary";
    if (val === 3) return "bg-warningLight text-warningDark border-warningPrimary";
    if (val < 3) return "bg-dangerLight text-dangerDark border-dangerPrimary";
    return "bg-bgSecondary text-textSecondary border-borderLight";
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-textPrimary">{label}</label>
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            className={cn(
              "flex-1 py-2 px-2 rounded border font-semibold transition-all text-sm",
              value === val
                ? getButtonColor(val)
                : "bg-bgPrimary border-borderLight text-textSecondary"
            )}
          >
            {val}
          </button>
        ))}
      </div>
      <p className="text-xs text-textSecondary">
        0-2: Weak (danger) | 3: Fair (warning) | 4-5: Normal (success)
      </p>
    </div>
  );
}
