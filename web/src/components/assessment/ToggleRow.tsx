interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  icon?: string;
  description?: string;
}

export function ToggleRow({
  label,
  value,
  onChange,
  description,
}: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded bg-bgSecondary hover:bg-bgTertiary transition-colors border border-borderLight">
      <div className="flex-1">
        <label className="text-sm font-medium text-textPrimary cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-xs text-textSecondary mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? "bg-successPrimary" : "bg-borderLight"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-bgPrimary transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
