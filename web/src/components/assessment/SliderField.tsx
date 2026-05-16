interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
}: SliderFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-textPrimary">{label}</label>
        <span className="text-lg font-semibold text-infoPrimary">
          {value}
          {unit && ` ${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-borderLight rounded-lg appearance-none cursor-pointer accent-infoPrimary"
      />
      <div className="flex justify-between text-xs text-textSecondary">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
