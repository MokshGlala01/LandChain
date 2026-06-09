import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { agriStore } from "@/lib/agri_store";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "AGRI") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversions = agriStore.getConversions();
    return NextResponse.json(conversions);
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
    const { parcelId, proposedType } = body;

    if (!parcelId || !proposedType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { parcelId },
      include: { owner: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property parcel not found" }, { status: 404 });
    }

    // Fee logic: ₹10,000 per Hectare (let's say 1 Hectare is approx 10,000 sq ft or direct area if area is in ha/sqft)
    // In our DB seed, area is in sqft (e.g. 2400 sq ft). Let's convert area to Hectares (1 Hectare = 107,639 sq ft)
    // or just assume a base fee: area * ₹10 per unit area
    const calculatedFee = Math.ceil(property.area * 10);

    const newConv = agriStore.addConversion({
      parcelId,
      surveyNumber: property.surveyNumber,
      ownerName: property.owner.name,
      area: +(property.area / 107639).toFixed(2) || 1.0, // convert area to Hectares for agricultural context
      currentType: "Agricultural",
      proposedType,
      fee: calculatedFee,
    });

    await prisma.auditLog.create({
      data: {
        action: "LAND_CONVERSION_FILED",
        entityId: newConv.id,
        entityType: "LandConversion",
        actorId: user.id,
        metadata: JSON.stringify({ parcelId, proposedType, fee: calculatedFee }),
      },
    });

    return NextResponse.json(newConv, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "AGRI") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, action } = body; // action: 'approve' | 'reject' | 'pay'

    if (!id || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const conv = agriStore.getConversion(id);
    if (!conv) {
      return NextResponse.json({ error: "Conversion request not found" }, { status: 404 });
    }

    if (action === "pay") {
      const updated = agriStore.updateConversionPayment(id, "PAID");
      return NextResponse.json(updated);
    }

    if (action === "reject") {
      const updated = agriStore.updateConversionStatus(id, "REJECTED");
      await prisma.auditLog.create({
        data: {
          action: "LAND_CONVERSION_REJECTED",
          entityId: id,
          entityType: "LandConversion",
          actorId: user.id,
          metadata: JSON.stringify({ parcelId: conv.parcelId, stage: conv.status }),
        },
      });
      return NextResponse.json(updated);
    }

    if (action === "approve") {
      let nextStatus: typeof conv.status = conv.status;
      if (conv.status === "PENDING_TEHSILDAR") {
        nextStatus = "PENDING_COLLECTOR";
      } else if (conv.status === "PENDING_COLLECTOR") {
        nextStatus = "PENDING_REVENUE";
      } else if (conv.status === "PENDING_REVENUE") {
        nextStatus = "APPROVED";
        // Also modify the property type in the database if it is fully approved?
        // Wait, property table does not have a "type" or "propertyType" column! The circle rate has a propertyType.
        // If we want to change property status or something, we can. Let's update its status or keep it active.
        // We can audit-log it.
        await prisma.auditLog.create({
          data: {
            action: "PROPERTY_CONVERTED",
            entityId: conv.parcelId,
            entityType: "Property",
            actorId: user.id,
            metadata: JSON.stringify({ parcelId: conv.parcelId, oldType: "Agricultural", newType: conv.proposedType }),
          },
        });
      }

      const updated = agriStore.updateConversionStatus(id, nextStatus);
      await prisma.auditLog.create({
        data: {
          action: "LAND_CONVERSION_PROGRESS",
          entityId: id,
          entityType: "LandConversion",
          actorId: user.id,
          metadata: JSON.stringify({ parcelId: conv.parcelId, from: conv.status, to: nextStatus }),
        },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
