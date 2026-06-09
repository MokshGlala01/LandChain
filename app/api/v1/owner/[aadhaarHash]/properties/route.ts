import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/apiKeyAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { aadhaarHash: string } }) {
  const authCheck = await validateApiKey(req);
  if (!authCheck.isValid) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }

  const { aadhaarHash } = params;
  const user = await prisma.user.findFirst({
    where: { aadhaarHash },
    include: { properties: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Owner profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    institution: authCheck.institutionName,
    owner: {
      name: user.name,
      aadhaarHash: user.aadhaarHash,
      properties: user.properties,
    },
  });
}
