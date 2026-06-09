import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "AGRI") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const carbonParcels = await prisma.carbonParcel.findMany();
    
    // Join with property owner details
    const parcelIds = carbonParcels.map((p) => p.parcelId);
    const properties = await prisma.property.findMany({
      where: { parcelId: { in: parcelIds } },
      include: { owner: true },
    });

    const result = carbonParcels.map((cp) => {
      const prop = properties.find((p) => p.parcelId === cp.parcelId);
      return {
        ...cp,
        property: prop || null,
      };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
