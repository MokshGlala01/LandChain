import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { triggerBankWebhooks } from "@/lib/webhook";

export const dynamic = "force-dynamic";

// Simple in-memory mock dispute storage to complement DB updates since SQLite schema does not have a separate Dispute table
// We will also update the Property status directly in SQLite
let mockDisputes: any[] = [
  { id: "dsp_1", parcelId: "PARCEL-4902-881", reason: "boundary", description: "Boundary overlap claim from neighboring plot.", status: "Filed", date: new Date().toLocaleDateString() },
];

export async function GET() {
  return NextResponse.json(mockDisputes);
}

export async function POST(req: Request) {
  try {
    const { parcelId, reason, description } = await req.json();

    if (!parcelId || !reason || !description) {
      return NextResponse.json({ error: "Missing parcelId, reason, or description" }, { status: 400 });
    }

    // 1. Update Property status in database to DISPUTED
    const prop = await prisma.property.update({
      where: { parcelId },
      data: { status: "DISPUTED" },
      include: { owner: true },
    });

    // 2. Trigger Bank webhook alerts
    await triggerBankWebhooks("dispute.filed", {
      parcelId,
      status: "DISPUTED",
      reason,
      description,
    });

    const newDispute = {
      id: "dsp_" + Math.floor(1000 + Math.random() * 9000),
      parcelId,
      reason,
      description,
      status: "Filed",
      date: new Date().toLocaleDateString(),
    };

    mockDisputes.push(newDispute);

    return NextResponse.json({
      success: true,
      dispute: newDispute,
    });
  } catch (error: any) {
    console.error("[Dispute Post Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to file dispute" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { disputeId, nextStatus, verdictHash, parcelId } = await req.json();

    const dspIndex = mockDisputes.findIndex((d) => d.id === disputeId);
    if (dspIndex === -1) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    mockDisputes[dspIndex].status = nextStatus;
    
    // Update property status
    let dbStatus = "ACTIVE";
    if (nextStatus === "Arbitration" || nextStatus === "Filed") {
      dbStatus = "DISPUTED";
    } else if (nextStatus === "Frozen") {
      dbStatus = "FROZEN";
    } else if (nextStatus === "Resolved") {
      dbStatus = "ACTIVE";
    }

    await prisma.property.update({
      where: { parcelId },
      data: { status: dbStatus },
    });

    if (verdictHash) {
      mockDisputes[dspIndex].verdictIpfsHash = verdictHash;
    }

    // Fire webhook
    await triggerBankWebhooks("encumbrance.added", {
      parcelId,
      status: dbStatus,
      disputeId,
      nextStatus,
    });

    return NextResponse.json({ success: true, dispute: mockDisputes[dspIndex] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
