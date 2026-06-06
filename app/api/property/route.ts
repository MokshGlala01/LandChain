import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST: register new property
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      parcelId,
      surveyNumber,
      area,
      location,
      latitude,
      longitude,
      ipfsHash,
      blockchainTxHash,
      ownerId,
    } = body;

    if (!parcelId || !surveyNumber || !area || !location || !ownerId) {
      return NextResponse.json(
        { error: "Missing required fields: parcelId, surveyNumber, area, location, ownerId are required." },
        { status: 400 }
      );
    }

    // Verify owner exists
    const userExists = await prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!userExists) {
      return NextResponse.json(
        { error: `Owner with ID "${ownerId}" does not exist in the database.` },
        { status: 404 }
      );
    }

    // Check if parcelId is already registered
    const existingProperty = await prisma.property.findUnique({
      where: { parcelId },
    });

    if (existingProperty) {
      return NextResponse.json(
        { error: `Parcel ID "${parcelId}" is already registered.` },
        { status: 409 }
      );
    }

    // Create property record
    const property = await prisma.property.create({
      data: {
        parcelId,
        surveyNumber,
        area: parseFloat(area),
        location,
        latitude: parseFloat(latitude || 0),
        longitude: parseFloat(longitude || 0),
        ipfsHash: ipfsHash || "",
        blockchainTxHash: blockchainTxHash || "",
        ownerId,
        status: "ACTIVE",
      },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: "PROPERTY_REGISTERED",
        entityId: property.id,
        entityType: "Property",
        actorId: ownerId,
        metadata: JSON.stringify({
          parcelId,
          surveyNumber,
          blockchainTxHash: blockchainTxHash || "",
        }),
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/property:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while registering the property." },
      { status: 500 }
    );
  }
}

// GET: search properties
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const type = searchParams.get("type") || "parcelId"; // parcelId, surveyNumber, ownerName

    let properties = [];

    if (!query) {
      properties = await prisma.property.findMany({
        include: {
          owner: true,
          transfers: {
            orderBy: { initiatedAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    } else {
      if (type === "surveyNumber") {
        properties = await prisma.property.findMany({
          where: {
            surveyNumber: { contains: query },
          },
          include: {
            owner: true,
            transfers: {
              orderBy: { initiatedAt: "desc" },
            },
          },
        });
      } else if (type === "ownerName") {
        properties = await prisma.property.findMany({
          where: {
            owner: {
              name: { contains: query },
            },
          },
          include: {
            owner: true,
            transfers: {
              orderBy: { initiatedAt: "desc" },
            },
          },
        });
      } else {
        // Default to parcelId
        properties = await prisma.property.findMany({
          where: {
            parcelId: { contains: query },
          },
          include: {
            owner: true,
            transfers: {
              orderBy: { initiatedAt: "desc" },
            },
          },
        });
      }
    }

    return NextResponse.json(properties);
  } catch (error: any) {
    console.error("Error in GET /api/property:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while fetching properties." },
      { status: 500 }
    );
  }
}
