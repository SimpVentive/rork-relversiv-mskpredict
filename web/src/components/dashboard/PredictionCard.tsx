import Link from "next/link";
import { RiskBand } from "@/lib/rules/types";

const conditionIcons: Record<string, string> = {
  back: "🏃",
  shoulder: "💪",
  knee: "🦵",
};

const conditionColors: Record<
  string,
  { light: string; primary: string; dark: string }
> = {
  back: {
    light: "bg-backLight",
    primary: "text-backPrimary",
    dark: "text-backDark",
  },
  shoulder: {
    light: "bg-shoulderLight",
    primary: "text-shoulderPrimary",
    dark: "text-shoulderDark",
  },
  knee: {
    light: "bg-kneeLight",
    primary: "text-kneePrimary",
    dark: "text-kneeDark",
  },
};

const bandRiskColors: Record<
  RiskBand,
  { light: string; dark: string }
> = {
  Low: { light: "bg-successLight", dark: "text-successDark" },
  Moderate: { light: "bg-warningLight", dark: "text-warningDark" },
  High: { light: "bg-dangerLight", dark: "text-dangerDark" },
  "Very High": { light: "bg-dangerLight", dark: "text-dangerDark" },
};

const bandLabels: Record<RiskBand, string> = {
  Low: "Low risk",
  Moderate: "Moderate risk",
  High: "High risk",
  "Very High": "Very high risk",
};

interface PredictionCardProps {
  id: string;
  condition: string;
  score: number;
  band: RiskBand;
  chronicityWeeks: number;
  firedRulesCount: number;
  createdAt: Date;
}

export function PredictionCard({
  id,
  condition,
  score,
  band,
  chronicityWeeks,
  firedRulesCount,
  createdAt,
}: PredictionCardProps) {
  const conditionLabel = condition.charAt(0).toUpperCase() + condition.slice(1);
  const conditionColor = conditionColors[condition] || conditionColors.back;
  const bandColor = bandRiskColors[band];

  return (
    <Link href={`/(dashboard)/predictions/${id}`}>
      <div className="bg-bgPrimary rounded border border-borderLight hover:shadow-soft hover:border-infoPrimary transition-all p-4 cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Region icon in condition-specific color */}
          <div className={`text-3xl p-3 rounded ${conditionColor.light}`}>
            {conditionIcons[condition] || "📋"}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className={`font-semibold ${conditionColor.dark}`}>
                {conditionLabel} Assessment
              </h3>
              <span className="text-xs text-textSecondary">
                {chronicityWeeks}w
              </span>
            </div>

            {/* Risk band pill */}
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${bandColor.light} ${bandColor.dark}`}
            >
              {bandLabels[band]}
            </div>

            {/* Rules fired */}
            <p className="text-xs text-textSecondary mb-3">
              {firedRulesCount} rule{firedRulesCount !== 1 ? "s" : ""} fired
            </p>

            {/* Score and date */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-textSecondary">
                {new Date(createdAt).toLocaleDateString()}
              </span>
              <span className={`text-2xl font-bold ${conditionColor.primary}`}>
                {score}
                <span className="text-sm font-normal text-textSecondary">
                  /100
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
