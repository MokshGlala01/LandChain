import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/apiKeyAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { parcelId: string } }) {
  const authCheck = await validateApiKey(req);
  if (!authCheck.isValid) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }

  const { parcelId } = params;
  const property = await prisma.property.findUnique({
    where: { parcelId },
    include: { owner: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    institution: authCheck.institutionName,
    property,
  });
}
