import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "BANK") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { parcelIds } = await req.json();
    if (!Array.isArray(parcelIds) || parcelIds.length === 0) {
      return NextResponse.json({ error: "Missing parcelIds array" }, { status: 400 });
    }

    // Set up Server-Sent Events response stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let count = 0;
        for (const parcelId of parcelIds) {
          count++;
          // Simulate ledger latency
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Mock checking database property record
          const prop = await prisma.property.findUnique({
            where: { parcelId },
            include: { owner: true },
          });

          const verified = !!prop;
          const encumbered = prop ? prop.status !== "ACTIVE" : Math.random() > 0.8;
          const fraudScore = prop ? Math.floor(Math.random() * 30) : Math.floor(40 + Math.random() * 55);
          const valuation = prop ? prop.area * 3000 : 2500000;
          const ownerName = prop ? prop.owner.name : "Unknown Claimant";

          const data = {
            index: count,
            parcelId,
            ownerName,
            verified,
            encumbered,
            fraudScore,
            valuation,
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
