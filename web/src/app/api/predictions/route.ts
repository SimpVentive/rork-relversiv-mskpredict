import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { predictions } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all predictions for this user, sorted by newest first
    const userPredictions = await db
      .select()
      .from(predictions)
      .where(eq(predictions.userId, userId))
      .orderBy(desc(predictions.createdAt));

    const formatted = userPredictions.map((p) => ({
      id: p.id,
      condition: p.condition,
      score: parseInt(p.score),
      band: p.band,
      predictedCall: p.predictedCall,
      clinicianCall: p.clinicianCall,
      chronicityWeeks: parseInt(p.chronicityWeeks),
      firedRulesCount: Array.isArray(p.firedRules)
        ? p.firedRules.length
        : 0,
      createdAt: p.createdAt,
    }));

    return NextResponse.json(
      { success: true, predictions: formatted },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get predictions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
