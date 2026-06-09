import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "BANK") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const webhooks = await prisma.bankWebhook.findMany({
      where: { bankId: user.id },
    });

    return NextResponse.json(webhooks);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "BANK") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, subscribedEvents } = await req.json();

    if (!url || !subscribedEvents) {
      return NextResponse.json({ error: "Missing url or subscribedEvents" }, { status: 400 });
    }

    const secret = "whsec_" + Math.random().toString(36).substring(2, 16);

    const webhook = await prisma.bankWebhook.create({
      data: {
        bankId: user.id,
        url,
        subscribedEvents,
        active: true,
        secret,
      },
    });

    return NextResponse.json(webhook);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "BANK") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, active } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing webhook id" }, { status: 400 });
    }

    const updated = await prisma.bankWebhook.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "BANK") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing webhook id" }, { status: 400 });
    }

    await prisma.bankWebhook.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
