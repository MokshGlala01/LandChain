import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const alerts = await prisma.watchlistAlert.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json(alerts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { parcelId, alertTypes } = await req.json();

    if (!parcelId || !alertTypes) {
      return NextResponse.json({ error: "Missing parcelId or alertTypes" }, { status: 400 });
    }

    const alertItem = await prisma.watchlistAlert.create({
      data: {
        userId: user.id,
        parcelId,
        alertTypes,
        active: true,
      },
    });

    return NextResponse.json(alertItem);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, active } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const updated = await prisma.watchlistAlert.update({
      where: { id },
      data: { active },
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.watchlistAlert.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
