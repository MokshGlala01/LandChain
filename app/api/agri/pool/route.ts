import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { agriStore, PoolParcel } from "@/lib/agri_store";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "AGRI") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pools = agriStore.getPools();
    return NextResponse.json(pools);
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
    const { name, purpose, parcelIds } = body;

    if (!name || !purpose || !parcelIds || !Array.isArray(parcelIds) || parcelIds.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch properties and owners
    const properties = await prisma.property.findMany({
      where: { parcelId: { in: parcelIds } },
      include: { owner: true },
    });

    const parcelsData: PoolParcel[] = properties.map((prop) => {
      // compensation rate of ₹2,000,000 per Hectare
      const areaHectares = +(prop.area / 107639).toFixed(2) || 1.0;
      const compensation = Math.ceil(areaHectares * 2000000);
      return {
        parcelId: prop.parcelId,
        area: areaHectares,
        ownerName: prop.owner.name,
        consented: false,
        compensation,
      };
    });

    const newPool = agriStore.addPool(name, purpose, parcelsData);

    await prisma.auditLog.create({
      data: {
        action: "LAND_POOL_CREATED",
        entityId: newPool.id,
        entityType: "LandPoolingProject",
        actorId: user.id,
        metadata: JSON.stringify({ name, parcelsCount: parcelsData.length }),
      },
    });

    return NextResponse.json(newPool, { status: 201 });
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
    const { id, parcelId, status, action } = body; // action: 'toggle_consent' | 'update_status'

    if (!id) {
      return NextResponse.json({ error: "Missing pool ID" }, { status: 400 });
    }

    if (action === "toggle_consent" && parcelId) {
      const updated = agriStore.toggleParcelConsent(id, parcelId);
      return NextResponse.json(updated);
    }

    if (action === "update_status" && status) {
      const updated = agriStore.updatePoolStatus(id, status);
      await prisma.auditLog.create({
        data: {
          action: "LAND_POOL_STATUS_UPDATED",
          entityId: id,
          entityType: "LandPoolingProject",
          actorId: user.id,
          metadata: JSON.stringify({ status }),
        },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action parameters" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
