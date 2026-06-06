import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST: initiate transfer (from citizen dashboard)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { propertyId, fromOwnerId, toOwnerAadhaar, stampDuty } = body;

    if (!propertyId || !fromOwnerId || !toOwnerAadhaar || !stampDuty) {
      return NextResponse.json(
        { error: "Missing required fields: propertyId, fromOwnerId, toOwnerAadhaar, stampDuty are required." },
        { status: 400 }
      );
    }

    // Find property and verify caller is current owner in database
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }

    if (property.ownerId !== fromOwnerId) {
      return NextResponse.json(
        { error: "Unauthorized: Caller is not the current owner of this property." },
        { status: 403 }
      );
    }

    // Format target Aadhaar to mock hash
    const formattedAadhaar = toOwnerAadhaar.replace(/\s/g, "");
    const toAadhaarHash = "aadhaar_" + formattedAadhaar;

    // Retrieve or create recipient citizen mock
    let toUser = await prisma.user.findUnique({
      where: { aadhaarHash: toAadhaarHash },
    });

    if (!toUser) {
      // Setup a default buyer record so the process continues
      toUser = await prisma.user.create({
        data: {
          aadhaarHash: toAadhaarHash,
          name: "Buyer (Aadhaar Verified)",
          phone: "+91 98989 " + Math.floor(10000 + Math.random() * 90000),
          role: "CITIZEN",
        },
      });
    }

    // Check if there's already an active transfer request for this property
    const existingActiveTransfer = await prisma.transfer.findFirst({
      where: {
        propertyId,
        status: "PENDING",
      },
    });

    if (existingActiveTransfer) {
      return NextResponse.json(
        { error: "A transfer request for this property is already pending approval." },
        { status: 409 }
      );
    }

    // Create the transfer record
    const transfer = await prisma.transfer.create({
      data: {
        propertyId,
        fromOwnerId,
        toOwnerId: toUser.id,
        stampDuty: parseFloat(stampDuty),
        status: "PENDING",
      },
      include: {
        property: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "TRANSFER_INITIATED",
        entityId: transfer.id,
        entityType: "Transfer",
        actorId: fromOwnerId,
        metadata: {
          propertyId,
          fromOwnerId,
          toOwnerId: toUser.id,
          stampDuty,
        },
      },
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/transfer:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while initiating the transfer." },
      { status: 500 }
    );
  }
}

// PATCH: approve/reject transfer (registrar only)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { transferId, status, txHash, registrarId } = body; // status: APPROVED, REJECTED, COMPLETED

    if (!transferId || !status || !registrarId) {
      return NextResponse.json(
        { error: "Missing required fields: transferId, status, and registrarId are required." },
        { status: 400 }
      );
    }

    // Check registrar authorization
    const registrarUser = await prisma.user.findUnique({
      where: { id: registrarId },
    });

    if (!registrarUser || registrarUser.role !== "REGISTRAR") {
      return NextResponse.json(
        { error: "Unauthorized: Actor must be a Govt Registrar." },
        { status: 403 }
      );
    }

    const transfer = await prisma.transfer.findUnique({
      where: { id: transferId },
      include: {
        property: true,
      },
    });

    if (!transfer) {
      return NextResponse.json({ error: "Transfer request not found." }, { status: 404 });
    }

    if (transfer.status !== "PENDING") {
      return NextResponse.json(
        { error: `Transfer request is already resolved with status ${transfer.status}.` },
        { status: 400 }
      );
    }

    if (status === "APPROVED" || status === "COMPLETED") {
      const finalTxHash = txHash || "0xmock_tx_" + Math.random().toString(16).substring(2, 66);

      // Perform atomic database transaction to complete transfer
      await prisma.$transaction([
        prisma.transfer.update({
          where: { id: transferId },
          data: {
            status: "COMPLETED",
            txHash: finalTxHash,
            completedAt: new Date(),
          },
        }),
        prisma.property.update({
          where: { id: transfer.propertyId },
          data: {
            ownerId: transfer.toOwnerId,
            blockchainTxHash: finalTxHash,
          },
        }),
        prisma.auditLog.create({
          data: {
            action: "TRANSFER_APPROVED",
            entityId: transferId,
            entityType: "Transfer",
            actorId: registrarId,
            metadata: {
              propertyId: transfer.propertyId,
              fromOwnerId: transfer.fromOwnerId,
              toOwnerId: transfer.toOwnerId,
              txHash: finalTxHash,
            },
          },
        }),
      ]);

      // Twilio SMS Simulation
      console.log(
        `[Twilio SMS Simulation] SMS sent to Citizen (Registrar Approved): Transfer completed for property ${transfer.property.parcelId}. Transaction Hash: ${finalTxHash}.`
      );

      return NextResponse.json({
        success: true,
        message: "Property ownership successfully updated on blockchain registry.",
      });
    } else if (status === "REJECTED") {
      await prisma.$transaction([
        prisma.transfer.update({
          where: { id: transferId },
          data: {
            status: "REJECTED",
            completedAt: new Date(),
          },
        }),
        prisma.auditLog.create({
          data: {
            action: "TRANSFER_REJECTED",
            entityId: transferId,
            entityType: "Transfer",
            actorId: registrarId,
            metadata: {
              propertyId: transfer.propertyId,
              fromOwnerId: transfer.fromOwnerId,
              toOwnerId: transfer.toOwnerId,
            },
          },
        }),
      ]);

      // Twilio SMS Simulation
      console.log(
        `[Twilio SMS Simulation] SMS sent: Transfer request for property ${transfer.property.parcelId} has been REJECTED by the registrar.`
      );

      return NextResponse.json({
        success: true,
        message: "Transfer request rejected by registrar.",
      });
    }

    return NextResponse.json({ error: "Invalid status value provided." }, { status: 400 });
  } catch (error: any) {
    console.error("Error in PATCH /api/transfer:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while updating transfer status." },
      { status: 500 }
    );
  }
}
