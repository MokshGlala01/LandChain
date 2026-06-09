import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "BUILDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, name, targetDate, paymentPercent } = await req.json();

    if (!projectId || !name || !targetDate || !paymentPercent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Mock milestone creation log
    console.log(`[Milestones API] Registering milestone ${name} for project ${projectId}`);

    return NextResponse.json({
      success: true,
      milestone: {
        id: "ms-" + Math.random().toString(36).substring(2, 9),
        projectId,
        name,
        targetDate,
        paymentPercent: parseFloat(paymentPercent),
        status: "PENDING",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
