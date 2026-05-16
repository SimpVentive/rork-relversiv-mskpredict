import { NextRequest, NextResponse } from "next/server";
import { ShoulderAssessment } from "@/types/shoulderAssessment";
import { evaluateShoulder } from "@/lib/rules/shoulderEngine";
import { db } from "@/lib/db/client";
import {
  shoulderAssessments,
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

    const assessment: ShoulderAssessment = await request.json();

    // Validate assessment has required fields
    if (!assessment.demographics || !assessment.shoulderPain) {
      return NextResponse.json(
        { error: "Invalid assessment data" },
        { status: 400 }
      );
    }

    // Save assessment to database
    const savedAssessment = await db
      .insert(shoulderAssessments)
      .values({
        userId,
        data: assessment,
      })
      .returning();

    const assessmentId = savedAssessment[0].id;

    // Run rules engine
    const predictionResult = evaluateShoulder(assessment);

    // Save prediction
    const newPrediction: NewPrediction = {
      userId,
      condition: "shoulder",
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

    const savedPrediction = await db
      .insert(predictions)
      .values(newPrediction)
      .returning();

    return NextResponse.json(
      {
        success: true,
        prediction: {
          ...predictionResult,
          id: savedPrediction[0].id,
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
