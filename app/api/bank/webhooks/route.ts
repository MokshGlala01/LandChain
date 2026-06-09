import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const webhooks = await prisma.bankWebhook.findMany();
    return NextResponse.json(webhooks);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { url, subscribedEvents } = await req.json();
    if (!url || !subscribedEvents) {
      return NextResponse.json({ error: "Missing url or subscribedEvents" }, { status: 400 });
    }

    const webhook = await prisma.bankWebhook.create({
      data: {
        bankId: "bank_sbi",
        url,
        subscribedEvents,
        secret: "whsec_" + Math.random().toString(36).substring(2, 16),
        active: true,
      },
    });

    return NextResponse.json(webhook);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
