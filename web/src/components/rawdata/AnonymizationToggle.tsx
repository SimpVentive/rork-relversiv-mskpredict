interface AnonymizationToggleProps {
  isAnonymized: boolean;
  onToggle: (anonymized: boolean) => void;
}

export function AnonymizationToggle({ isAnonymized, onToggle }: AnonymizationToggleProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onToggle(true)}
        className={`
          px-4 py-2 rounded text-sm font-semibold transition-all
          ${isAnonymized
            ? 'bg-infoLight border-2 border-infoPrimary text-infoDark'
            : 'bg-bgSecondary border border-borderLight text-textSecondary hover:bg-bgTertiary'
          }
        `}
      >
        🔒 Anonymized
      </button>
      <button
        onClick={() => onToggle(false)}
        className={`
          px-4 py-2 rounded text-sm font-semibold transition-all
          ${!isAnonymized
            ? 'bg-infoLight border-2 border-infoPrimary text-infoDark'
            : 'bg-bgSecondary border border-borderLight text-textSecondary hover:bg-bgTertiary'
          }
        `}
      >
        👤 Non-Anonymized
      </button>
    </div>
  );
}
