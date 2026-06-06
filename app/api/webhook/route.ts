import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST: listen to on-chain events and sync database
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, args } = body;

    if (!eventName || !args) {
      return NextResponse.json(
        { error: "Missing required fields: eventName and args must be provided." },
        { status: 400 }
      );
    }

    console.log(`[On-chain Event Webhook] Processing event: ${eventName}`, args);

    if (eventName === "PropertyRegistered") {
      const { parcelId, owner, ipfsHash, txHash } = args;

      // Locate or create user associated with this wallet address
      let user = await prisma.user.findFirst({
        where: { walletAddress: owner },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            aadhaarHash: "webhook_" + Math.random().toString(36).substring(2, 12),
            name: "Owner (" + owner.substring(0, 6) + "..." + owner.substring(owner.length - 4) + ")",
            phone: "+91 90000 00000",
            role: "CITIZEN",
            walletAddress: owner,
          },
        });
      }

      // Upsert property record to align with smart contract state
      const property = await prisma.property.upsert({
        where: { parcelId },
        update: {
          ownerId: user.id,
          ipfsHash,
          blockchainTxHash: txHash || "",
        },
        create: {
          parcelId,
          surveyNumber: "SURVEY-WEB-" + Math.floor(100 + Math.random() * 900),
          area: 1200.0, // default area placeholder
          location: "On-chain Registered Location",
          latitude: 28.6139,
          longitude: 77.2090,
          ipfsHash,
          blockchainTxHash: txHash || "",
          ownerId: user.id,
          status: "ACTIVE",
        },
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          action: "WEBHOOK_PROPERTY_REGISTERED",
          entityId: property.id,
          entityType: "Property",
          actorId: user.id,
          metadata: JSON.stringify({ parcelId, ownerAddress: owner, txHash }),
        },
      });

      return NextResponse.json({ success: true, property });
    } else if (eventName === "OwnershipTransferred") {
      const { parcelId, from, to, txHash } = args;

      // Locate recipient user
      let toUser = await prisma.user.findFirst({
        where: { walletAddress: to },
      });

      if (!toUser) {
        toUser = await prisma.user.create({
          data: {
            aadhaarHash: "webhook_" + Math.random().toString(36).substring(2, 12),
            name: "Owner (" + to.substring(0, 6) + "..." + to.substring(to.length - 4) + ")",
            phone: "+91 90000 00000",
            role: "CITIZEN",
            walletAddress: to,
          },
        });
      }

      // Update property owner details in database
      const property = await prisma.property.update({
        where: { parcelId },
        data: {
          ownerId: toUser.id,
          blockchainTxHash: txHash || "",
        },
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          action: "WEBHOOK_OWNERSHIP_TRANSFERRED",
          entityId: property.id,
          entityType: "Property",
          actorId: toUser.id,
          metadata: JSON.stringify({ parcelId, fromAddress: from, toAddress: to, txHash }),
        },
      });

      return NextResponse.json({ success: true, property });
    }

    return NextResponse.json({ error: `Unhandled event: ${eventName}` }, { status: 400 });
  } catch (error: any) {
    console.error("Error in POST /api/webhook:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while processing webhook." },
      { status: 500 }
    );
  }
}
