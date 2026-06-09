import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keys = await prisma.apiKey.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(keys);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { institutionName, role, dailyLimit } = await req.json();

    if (!institutionName || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate random API key
    const rawKey = "pk_" + crypto.randomBytes(24).toString("hex");
    // Hash key for secure db storage
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const apiKey = await prisma.apiKey.create({
      data: {
        keyHash,
        institutionName,
        role,
        dailyLimit: parseInt(dailyLimit || "1000"),
        usageCount: 0,
        active: true,
      },
    });

    return NextResponse.json({
      ...apiKey,
      rawKey, // returned once to the caller
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, active } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing key id" }, { status: 400 });
    }

    const updated = await prisma.apiKey.update({
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
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing key id" }, { status: 400 });
    }

    await prisma.apiKey.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
