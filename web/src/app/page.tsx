"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { PredictionCard } from "@/components/dashboard/PredictionCard";
import { RiskBand } from "@/lib/rules/types";

interface Prediction {
  id: string;
  condition: string;
  score: number;
  band: RiskBand;
  chronicityWeeks: number;
  firedRulesCount: number;
  createdAt: Date;
}

export default function Home() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Clinician");

  useEffect(() => {
    fetchPredictions();
    const userEmail = localStorage.getItem("userEmail") || "Clinician";
    setUserName(userEmail.split("@")[0]);
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await fetch("/api/predictions");
      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions);
      }
    } catch (error) {
      console.error("Failed to fetch predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  const highRiskCount = predictions.filter(
    (p) => p.band === "High" || p.band === "Very High"
  ).length;

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-textPrimary">
            {getTimeOfDayGreeting()}, {userName}
          </h1>
          <p className="text-textSecondary">Welcome to MSKPredict clinical decision support</p>
        </div>

        {/* Assessment Cards - All 3 Conditions Equally Prominent */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AssessmentCard
            href="/back-assessment"
            icon="🏃"
            title="Back Assessment"
            description="Lower back pain prognostication"
            color="back"
          />
          <AssessmentCard
            href="/shoulder-assessment"
            icon="💪"
            title="Shoulder Assessment"
            description="Shoulder pain prognostication"
            color="shoulder"
          />
          <AssessmentCard
            href="/knee-assessment"
            icon="🦵"
            title="Knee Assessment"
            description="Knee pain prognostication"
            color="knee"
          />
        </div>

        {/* Stats Row */}
        <StatsRow
          totalPredictions={predictions.length}
          activeRulesCount={62}
          highRiskCount={highRiskCount}
        />

        {/* Recent Predictions */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-textPrimary">Recent Predictions</h2>
            {predictions.length > 0 && (
              <span className="text-sm text-textSecondary">{predictions.length} total</span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-textSecondary">Loading predictions...</p>
            </div>
          ) : predictions.length === 0 ? (
            <div className="bg-bgSecondary rounded-xl p-12 text-center shadow-soft">
              <p className="text-textSecondary">No predictions yet. Start by running an assessment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {predictions.map((prediction) => (
                <PredictionCard
                  key={prediction.id}
                  {...prediction}
                  createdAt={new Date(prediction.createdAt)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

interface AssessmentCardProps {
  href: string;
  icon: string;
  title: string;
  description: string;
  color: "back" | "shoulder" | "knee";
}

function AssessmentCard({
  href,
  icon,
  title,
  description,
  color,
}: AssessmentCardProps) {
  const colorMap = {
    back: {
      bg: "bg-backLight",
      hover: "hover:bg-backHover",
      text: "text-backDark",
      accent: "border-l-4 border-backPrimary",
    },
    shoulder: {
      bg: "bg-shoulderLight",
      hover: "hover:bg-shoulderHover",
      text: "text-shoulderDark",
      accent: "border-l-4 border-shoulderPrimary",
    },
    knee: {
      bg: "bg-kneeLight",
      hover: "hover:bg-kneeHover",
      text: "text-kneeDark",
      accent: "border-l-4 border-kneePrimary",
    },
  };

  const colors = colorMap[color];

  return (
    <Link
      href={href}
      className={`group ${colors.bg} ${colors.accent} rounded-xl p-6 transition-all duration-200 ${colors.hover} shadow-soft hover:shadow-md cursor-pointer`}
    >
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className={`font-bold text-lg ${colors.text} mb-2`}>{title}</h3>
      <p className="text-sm text-textSecondary">{description}</p>
    </Link>
  );
}
