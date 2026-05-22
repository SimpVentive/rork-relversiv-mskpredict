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

export default function DashboardPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Clinician");

  useEffect(() => {
    fetchPredictions();
    // Get user info from localStorage or from a dedicated endpoint
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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Hero section */}
      <div className="relative bg-infoPrimary rounded border border-borderLight text-white p-12 overflow-hidden shadow-soft">
        <div className="absolute inset-0 opacity-5">
          <div className="text-9xl absolute -top-20 -right-20">📋</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">
            {getTimeOfDayGreeting()}, {userName}!
          </h1>
          <p className="text-lg opacity-90">
            Welcome to MSKPredict — Clinical decision support for musculoskeletal pain assessment.
          </p>
        </div>
      </div>

      {/* Quick action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/assessments/back"
          className="bg-backLight rounded border-l-4 border-b border-r border-t border-backPrimary p-6 hover:shadow-soft hover:bg-backHover transition-all cursor-pointer"
        >
          <div className="text-4xl mb-4">🏃</div>
          <h3 className="font-bold text-lg text-backDark mb-2">
            Back Assessment
          </h3>
          <p className="text-sm text-textSecondary">
            Run a lower back pain prognostication
          </p>
        </Link>

        <Link
          href="/dashboard/assessments/shoulder"
          className="bg-shoulderLight rounded border-l-4 border-b border-r border-t border-shoulderPrimary p-6 hover:shadow-soft hover:bg-shoulderHover transition-all cursor-pointer"
        >
          <div className="text-4xl mb-4">💪</div>
          <h3 className="font-bold text-lg text-shoulderDark mb-2">
            Shoulder Assessment
          </h3>
          <p className="text-sm text-textSecondary">
            Run a shoulder pain prognostication
          </p>
        </Link>
      </div>

      {/* Stats */}
      <StatsRow
        totalPredictions={predictions.length}
        activeRulesCount={62} // 32 back + 30 shoulder
        highRiskCount={highRiskCount}
      />

      {/* Recent predictions */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-navyDeep">
            Recent Predictions
          </h2>
          {predictions.length > 0 && (
            <span className="text-sm text-textSecondary">
              {predictions.length} total
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-textSecondary">Loading predictions...</p>
          </div>
        ) : predictions.length === 0 ? (
          <div className="bg-bgSecondary rounded border border-borderLight p-12 text-center shadow-soft">
            <p className="text-textSecondary mb-4">
              No predictions yet. Start by running an assessment.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard/assessments/back"
                className="px-4 py-2 bg-backPrimary text-white rounded hover:shadow-soft transition-shadow"
              >
                Back Assessment
              </Link>
              <Link
                href="/dashboard/assessments/shoulder"
                className="px-4 py-2 bg-shoulderPrimary text-white rounded hover:shadow-soft transition-shadow"
              >
                Shoulder Assessment
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
  );
}
