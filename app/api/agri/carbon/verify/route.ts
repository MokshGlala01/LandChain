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

    // Fetch the property
    const property = await prisma.property.findUnique({
      where: { parcelId },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // NDVI green cover simulation
    const greenCoverHectares = +(property.area / 107639).toFixed(2) || 1.0;
    const carbonSequestrationTons = +(greenCoverHectares * 5.3).toFixed(2);
    const creditsIssued = Math.round(carbonSequestrationTons);

    const carbonParcel = await prisma.carbonParcel.upsert({
      where: { parcelId },
      update: {
        greenCoverHectares,
        carbonSequestrationTons,
        creditsIssued,
        lastVerified: new Date(),
      },
      create: {
        parcelId,
        greenCoverHectares,
        carbonSequestrationTons,
        creditsIssued,
        lastVerified: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CARBON_NDVI_VERIFIED",
        entityId: carbonParcel.id,
        entityType: "CarbonParcel",
        actorId: user.id,
        metadata: JSON.stringify({
          parcelId,
          greenCoverHectares,
          carbonSequestrationTons,
          creditsIssued,
        }),
      },
    });

    return NextResponse.json(carbonParcel);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
