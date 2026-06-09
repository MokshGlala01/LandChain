import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { docType, parcelId } = await req.json();

    if (!docType || !parcelId) {
      return NextResponse.json({ error: "Missing docType or parcelId" }, { status: 400 });
    }

    const prop = await prisma.property.findUnique({
      where: { parcelId },
      include: { owner: true },
    });

    if (!prop) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Simulate DigiLocker API push call
    console.log(`[DigiLocker API] Pushing ${docType} for parcel ${parcelId} to Aadhaar: ${prop.owner.aadhaarHash}`);
    
    // In a live environment:
    // await fetch("https://api.digitallocker.gov.in/public/oauth2/1/file/issue", { method: "POST", headers: { Authorization: "Bearer ..." }, body: ... })

    return NextResponse.json({
      success: true,
      message: `Successfully pushed ${docType} certificate for Parcel ID ${parcelId} to owner's DigiLocker account.`,
      digiLockerRefId: "DL-" + Math.floor(100000 + Math.random() * 900000),
    });
  } catch (error: any) {
    console.error("[DigiLocker Push Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to push to DigiLocker" }, { status: 500 });
  }
}
