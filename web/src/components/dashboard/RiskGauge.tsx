import { useEffect, useState } from "react";
import { RiskBand } from "@/lib/rules/types";

const bandColors: Record<RiskBand, { text: string; stroke: string; bg: string; darkText: string }> = {
  Low: { text: "text-successPrimary", stroke: "#2EAE7E", bg: "bg-successLight", darkText: "text-successDark" },
  Moderate: { text: "text-warningPrimary", stroke: "#D4A03D", bg: "bg-warningLight", darkText: "text-warningDark" },
  High: { text: "text-dangerPrimary", stroke: "#C84C3D", bg: "bg-dangerLight", darkText: "text-dangerDark" },
  "Very High": { text: "text-dangerPrimary", stroke: "#A52D28", bg: "bg-dangerLight", darkText: "text-dangerDark" },
};

interface RiskGaugeProps {
  score: number;
  band: RiskBand;
  region: string;
}

export function RiskGauge({ score, band, region }: RiskGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Animate the score from 0 to final value
    const interval = setInterval(() => {
      setDisplayScore((prev) => {
        if (prev >= score) {
          clearInterval(interval);
          return score;
        }
        return prev + Math.ceil(score / 20);
      });
    }, 30);

    return () => clearInterval(interval);
  }, [score]);

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (displayScore / 100) * circumference;
  const color = bandColors[band];

  return (
    <div className="bg-bgSecondary rounded border border-borderLight p-8 flex flex-col items-center shadow-soft">
      <p className="text-sm font-semibold text-infoPrimary uppercase mb-4">
        {region}
      </p>

      {/* SVG Ring gauge */}
      <div className="relative w-40 h-40 mb-8">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#D4DEE6"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color.stroke}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className={`text-4xl font-bold ${color.text}`}>
            {displayScore}
          </p>
          <p className="text-sm text-textSecondary font-medium">RISK SCORE</p>
        </div>
      </div>

      {/* Band label */}
      <div className={`px-4 py-2 rounded-full font-semibold text-sm ${color.bg} ${color.darkText}`}>
        {band === "Low" && "Low risk — routine care"}
        {band === "Moderate" && "Moderate risk — monitor"}
        {band === "High" && "High risk — urgent action"}
        {band === "Very High" && "Very high risk — urgent action"}
      </div>
    </div>
  );
}
