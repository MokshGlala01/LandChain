import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { parcelId } = await req.json();

    if (!parcelId) {
      return NextResponse.json({ error: "Missing parcelId" }, { status: 400 });
    }

    // Fetch property history
    const property = await prisma.property.findUnique({
      where: { parcelId },
      include: { transfers: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const transfersCount = property.transfers.length;

    // Call FastAPI service
    let fraudDetails = null;
    try {
      const response = await fetch("http://127.0.0.1:8000/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcelId,
          transferHistory: property.transfers,
          valuationHistory: [],
          ownerHistory: [property.ownerId],
        }),
      });

      if (response.ok) {
        fraudDetails = await response.json();
      }
    } catch (err) {
      console.warn("[FastAPI Fraud Service Offline] Falling back to local JS calculation.");
    }

    // Local JS fallback scoring algorithm
    if (!fraudDetails) {
      let score = 15;
      const flags = [];

      if (transfersCount > 3) {
        score += 35;
        flags.push("High transfer frequency (>3 cycles in 2 years)");
      }

      if (property.status === "DISPUTED") {
        score = 85;
        flags.push("Active ownership dispute filed");
      } else if (property.status === "LITIGATED") {
        score = 90;
        flags.push("Court litigation hold active");
      }

      fraudDetails = {
        parcelId,
        score: Math.min(score, 100),
        flags,
        riskLevel: score < 30 ? "low" : score < 75 ? "medium" : "high",
      };
    }

    return NextResponse.json(fraudDetails);
  } catch (error: any) {
    console.error("[Fraud Score API Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to calculate fraud score" }, { status: 500 });
  }
}
