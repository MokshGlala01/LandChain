import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "AGRI") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    const agriDetailsList = await prisma.agriculturalDetails.findMany();
    const parcelIds = agriDetailsList.map((d) => d.parcelId);

    const properties = await prisma.property.findMany({
      where: {
        parcelId: { in: parcelIds },
        OR: [
          { parcelId: { contains: query } },
          { location: { contains: query } },
        ],
      },
      include: {
        owner: true,
      },
    });

    const result = agriDetailsList
      .map((ad) => {
        const prop = properties.find((p) => p.parcelId === ad.parcelId);
        if (!prop && query) return null; // filter out if doesn't match query
        return {
          ...ad,
          cropHistory: JSON.parse(ad.cropHistory || "[]"),
          property: prop || null,
        };
      })
      .filter(Boolean);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "AGRI") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      parcelId,
      soilType,
      irrigationSource,
      productivityScore,
      currentCrop,
      pmKisanBeneficiary,
      cropHistory,
    } = body;

    if (!parcelId || !soilType || !irrigationSource) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { parcelId },
    });

    if (!property) {
      return NextResponse.json({ error: "Property parcel not found in database" }, { status: 404 });
    }

    const agriDetails = await prisma.agriculturalDetails.upsert({
      where: { parcelId },
      update: {
        soilType,
        irrigationSource,
        productivityScore: parseFloat(productivityScore || 5),
        currentCrop,
        pmKisanBeneficiary: !!pmKisanBeneficiary,
        cropHistory: typeof cropHistory === "string" ? cropHistory : JSON.stringify(cropHistory || []),
      },
      create: {
        parcelId,
        soilType,
        irrigationSource,
        productivityScore: parseFloat(productivityScore || 5),
        currentCrop,
        pmKisanBeneficiary: !!pmKisanBeneficiary,
        cropHistory: typeof cropHistory === "string" ? cropHistory : JSON.stringify(cropHistory || []),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "AGRI_DETAILS_UPDATED",
        entityId: agriDetails.id,
        entityType: "AgriculturalDetails",
        actorId: user.id,
        metadata: JSON.stringify({ parcelId, currentCrop }),
      },
    });

    return NextResponse.json({
      ...agriDetails,
      cropHistory: JSON.parse(agriDetails.cropHistory || "[]"),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
