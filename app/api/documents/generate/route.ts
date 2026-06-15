import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  generateSaleDeed,
  generateGiftDeed,
  generatePartitionDeed,
  generateKhataCertificate,
  generatePropertyTaxReceipt,
  generateEncumbranceCertificate
} from "@/lib/documents";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { docType, parcelId } = await req.json();

    if (!docType || !parcelId) {
      return NextResponse.json({ error: "Missing docType or parcelId" }, { status: 400 });
    }

    // Lookup property
    const property = await prisma.property.findUnique({
      where: { parcelId },
      include: { owner: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    let pdfDoc: any;

    if (docType === "saleDeed") {
      pdfDoc = generateSaleDeed(property, property.owner);
    } else if (docType === "giftDeed") {
      pdfDoc = generateGiftDeed(property, property.owner);
    } else if (docType === "partitionDeed") {
      pdfDoc = generatePartitionDeed(property, property.owner);
    } else if (docType === "khata") {
      pdfDoc = generateKhataCertificate(property, property.owner);
    } else if (docType === "taxReceipt") {
      pdfDoc = generatePropertyTaxReceipt(property, property.owner);
    } else if (docType === "encumbrance") {
      // Fetch transfers
      const transfers = await prisma.transfer.findMany({
        where: { propertyId: property.id },
        orderBy: { initiatedAt: "desc" },
      });
      pdfDoc = generateEncumbranceCertificate(property, transfers);
    } else {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }

    // Output PDF as ArrayBuffer and convert to base64 data URI
    const pdfArrayBuffer = pdfDoc.output("arraybuffer");
    const pdfBase64 = Buffer.from(pdfArrayBuffer).toString("base64");
    const pdfDataUri = `data:application/pdf;base64,${pdfBase64}`;

    // Generate simulated/mock IPFS hash and transaction hash
    const ipfsHash = "Qm" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const txHash = "0x" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);

    return NextResponse.json({
      success: true,
      ipfsHash,
      txHash,
      pdfUrl: pdfDataUri
    });
  } catch (error: any) {
    console.error("[Document Generation Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to generate document" }, { status: 500 });
  }
}
