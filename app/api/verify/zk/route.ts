import { NextResponse } from "next/server";
import { verifyProof } from "@/lib/zkproof";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { proof, publicSignals } = await req.json();

    if (!proof || !publicSignals) {
      return NextResponse.json({ error: "Missing proof or publicSignals" }, { status: 400 });
    }

    const verified = await verifyProof(proof, publicSignals);

    return NextResponse.json({
      success: true,
      verified,
    });
  } catch (error: any) {
    console.error("[ZK Verify Exception]:", error);
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 });
  }
}
