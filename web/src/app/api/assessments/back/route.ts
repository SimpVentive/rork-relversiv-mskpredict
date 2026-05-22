import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { BackAssessment } from "@/types/backAssessment";
import { evaluateBack } from "@/lib/rules/backEngine";
import { db } from "@/lib/db/client";
import {
  backAssessments,
  predictions,
  NewPrediction,
} from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const assessment: BackAssessment = await request.json();

    // Validate assessment has required fields
    if (!assessment.demographics || !assessment.clinical) {
      return NextResponse.json(
        { error: "Invalid assessment data" },
        { status: 400 }
      );
    }

    // Save assessment to database
    const assessmentId = randomUUID();

    await db.insert(backAssessments).values({
      id: assessmentId,
      userId,
      data: assessment,
    });

    // Run rules engine
    const predictionResult = evaluateBack(assessment);

    // Save prediction
    const newPrediction: Omit<NewPrediction, "id"> = {
      userId,
      condition: "back",
      assessmentId,
      score: predictionResult.score.toString(),
      band: predictionResult.band,
      predictedCall: predictionResult.predictedCall,
      clinicianCall: undefined,
      firedRules: predictionResult.firedRules.map((fr) => ({
        ruleId: fr.rule.id,
        ruleName: fr.rule.name,
        evidence: fr.evidence,
      })),
      chronicityWeeks: predictionResult.chronicityWeeks.toString(),
    };

    const predictionId = randomUUID();

    await db.insert(predictions).values({
      id: predictionId,
      ...newPrediction,
    });

    return NextResponse.json(
      {
        success: true,
        prediction: {
          ...predictionResult,
          id: predictionId,
          assessmentId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Assessment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
