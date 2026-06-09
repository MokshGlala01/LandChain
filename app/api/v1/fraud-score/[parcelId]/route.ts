import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/apiKeyAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { parcelId: string } }) {
  const authCheck = await validateApiKey(req);
  if (!authCheck.isValid) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }

  const { parcelId } = params;
  const property = await prisma.property.findUnique({
    where: { parcelId },
  });

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  let score = 12;
  let flags: string[] = [];

  if (property.status === "DISPUTED") {
    score = 85;
    flags.push("Active ownership dispute filed");
  } else if (property.status === "LITIGATED") {
    score = 90;
    flags.push("Court litigation hold active");
  }

  if (property.area > 50000) {
    score += 10;
    flags.push("Large parcel area anomaly");
  }

  return NextResponse.json({
    success: true,
    institution: authCheck.institutionName,
    parcelId,
    fraudScore: score,
    riskLevel: score < 30 ? "low" : score < 75 ? "medium" : "high",
    flags,
  });
}
