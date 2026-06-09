import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "BUILDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.society.findMany({
      where: { builderId: user.id },
      include: { flats: true },
    });

    return NextResponse.json(projects);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "BUILDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, reraNumber, address, totalUnits } = await req.json();

    if (!name || !reraNumber || !address || !totalUnits) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Register new housing society
    const society = await prisma.society.create({
      data: {
        name,
        reraNumber,
        builderId: user.id,
        address,
        totalUnits: parseInt(totalUnits),
      },
    });

    // Bulk generate flats
    const flatsData = [];
    for (let i = 1; i <= parseInt(totalUnits); i++) {
      flatsData.push({
        societyId: society.id,
        flatNumber: `Flat-${100 + i}`,
        floor: Math.ceil(i / 4),
        areaSqft: 1200 + (i % 3) * 200,
        status: "AVAILABLE",
      });
    }

    await prisma.flat.createMany({
      data: flatsData,
    });

    return NextResponse.json(society, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
