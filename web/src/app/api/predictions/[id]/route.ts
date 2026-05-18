import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { predictions, backAssessments, shoulderAssessments } from "@/lib/db/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const prediction = await db
      .select()
      .from(predictions)
      .where(eq(predictions.id, params.id))
      .limit(1);

    if (!prediction.length) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      );
    }

    const pred = prediction[0];

    // Verify user owns this prediction
    if (pred.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Fetch the associated assessment
    let assessment = null;
    if (pred.assessmentId) {
      if (pred.condition === "back") {
        const result = await db
          .select()
          .from(backAssessments)
          .where(eq(backAssessments.id, pred.assessmentId))
          .limit(1);
        assessment = result.length > 0 ? result[0].data : null;
      } else if (pred.condition === "shoulder") {
        const result = await db
          .select()
          .from(shoulderAssessments)
          .where(eq(shoulderAssessments.id, pred.assessmentId))
          .limit(1);
        assessment = result.length > 0 ? result[0].data : null;
      }
    }

    const formatted = {
      id: pred.id,
      condition: pred.condition,
      score: parseInt(pred.score),
      band: pred.band,
      predictedCall: pred.predictedCall,
      clinicianCall: pred.clinicianCall,
      chronicityWeeks: parseInt(pred.chronicityWeeks),
      firedRules: Array.isArray(pred.firedRules) ? pred.firedRules : [],
      assessment,
      createdAt: pred.createdAt,
    };

    return NextResponse.json(
      { success: true, prediction: formatted },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get prediction detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only clinicians can set clinician call
    if (userRole !== "clinician" && userRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { clinicianCall } = await request.json();

    if (!["green", "amber", "red"].includes(clinicianCall)) {
      return NextResponse.json(
        { error: "Invalid clinician call value" },
        { status: 400 }
      );
    }

    // Verify user owns this prediction
    const pred = await db
      .select()
      .from(predictions)
      .where(eq(predictions.id, params.id))
      .limit(1);

    if (!pred.length || pred[0].userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update clinician call
    const updated = await db
      .update(predictions)
      .set({ clinicianCall: clinicianCall as any })
      .where(eq(predictions.id, params.id))
      .returning();

    return NextResponse.json(
      { success: true, prediction: updated[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update prediction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
