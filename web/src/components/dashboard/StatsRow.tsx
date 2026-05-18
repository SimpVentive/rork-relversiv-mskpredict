interface StatTileProps {
  label: string;
  value: number | string;
  icon: string;
}

function StatTile({ label, value, icon }: StatTileProps) {
  return (
    <div className="bg-bgSecondary rounded border border-borderLight p-6 shadow-soft hover:shadow-lg hover:border-borderDarker transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-textSecondary font-medium">{label}</p>
          <p className="text-3xl font-bold text-textPrimary mt-2">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}

interface StatsRowProps {
  totalPredictions: number;
  activeRulesCount: number;
  highRiskCount: number;
}

export function StatsRow({
  totalPredictions,
  activeRulesCount,
  highRiskCount,
}: StatsRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatTile
        label="Total Predictions"
        value={totalPredictions}
        icon="📊"
      />
      <StatTile
        label="Active Rules"
        value={activeRulesCount}
        icon="⚙️"
      />
      <StatTile
        label="High Risk Cases"
        value={highRiskCount}
        icon="⚠️"
      />
    </div>
  );
}
