import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/apiKeyAuth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const authCheck = await validateApiKey(req);
  if (!authCheck.isValid) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }

  try {
    const { parcelId, documentHash } = await req.json();

    if (!parcelId || !documentHash) {
      return NextResponse.json({ error: "Missing parcelId or documentHash" }, { status: 400 });
    }

    const property = await prisma.property.findUnique({
      where: { parcelId },
    });

    if (!property) {
      return NextResponse.json({ verified: false, reason: "Property not found" }, { status: 404 });
    }

    const matches = property.ipfsHash === documentHash;

    return NextResponse.json({
      success: true,
      institution: authCheck.institutionName,
      verified: matches,
      reason: matches ? "Document hash matches on-chain IPFS reference" : "Document hash mismatch",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
