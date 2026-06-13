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

    const { unitId, buyerAadhaar } = await req.json();

    if (!unitId || !buyerAadhaar) {
      return NextResponse.json({ error: "Missing unitId or buyerAadhaar" }, { status: 400 });
    }

    // Locate flat unit
    const flat = await prisma.flat.findUnique({
      where: { id: unitId },
    });

    if (!flat) {
      return NextResponse.json({ error: "Flat unit not found" }, { status: 404 });
    }

    // Resolve or mock buyer
    const cleanAadhaar = buyerAadhaar.replace(/\s/g, "");
    let buyer = await prisma.user.findUnique({
      where: { aadhaarHash: "aadhaar_" + cleanAadhaar },
    });

    if (!buyer) {
      buyer = await prisma.user.create({
        data: {
          aadhaarHash: "aadhaar_" + cleanAadhaar,
          name: "Rohan Sharma",
          phone: "+91 98765 43210",
          role: "CITIZEN",
          dob: new Date("1990-01-01"),
          gender: "Male",
          kycVerifiedAt: new Date(),
        },
      });
    }

    // Update flat status
    const nftTokenId = "NFT-" + Math.floor(100000 + Math.random() * 900000);
    const updatedFlat = await prisma.flat.update({
      where: { id: unitId },
      data: {
        ownerId: buyer.id,
        status: "SOLD",
        nftTokenId,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        action: "BUILDER_UNIT_TRANSFERRED",
        entityId: flat.id,
        entityType: "Flat",
        actorId: user.id,
        metadata: JSON.stringify({ flatNumber: flat.flatNumber, buyerId: buyer.id, nftTokenId }),
      },
    });

    return NextResponse.json({
      success: true,
      flat: updatedFlat,
      buyerName: buyer.name,
      nftTokenId,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "BUILDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids, status } = await req.json();

    if (!Array.isArray(ids) || !status) {
      return NextResponse.json({ error: "Missing ids or status" }, { status: 400 });
    }

    await prisma.flat.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
