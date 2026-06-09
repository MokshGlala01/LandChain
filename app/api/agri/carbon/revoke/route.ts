import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "AGRI") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { parcelId } = body;

    if (!parcelId) {
      return NextResponse.json({ error: "Missing parcelId" }, { status: 400 });
    }

    const carbonParcel = await prisma.carbonParcel.findUnique({
      where: { parcelId },
    });

    if (!carbonParcel) {
      return NextResponse.json({ error: "Carbon parcel registration not found" }, { status: 404 });
    }

    // Revoke by setting creditsIssued to 0
    const updated = await prisma.carbonParcel.update({
      where: { parcelId },
      data: {
        creditsIssued: 0,
        lastVerified: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CARBON_CREDITS_REVOKED",
        entityId: updated.id,
        entityType: "CarbonParcel",
        actorId: user.id,
        metadata: JSON.stringify({
          parcelId,
          prevCredits: carbonParcel.creditsIssued,
        }),
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
