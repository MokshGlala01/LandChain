import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";

// Explicitly register the autoTable plugin with jsPDF for server-side environments
applyPlugin(jsPDF);

function addDecorations(doc: jsPDF, parcelId: string, title: string) {
  // Brand Header
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 110, 86); // brand DEFAULT color: #0F6E56
  doc.text("LandChain Platform", 20, 20);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("GOVERNMENT OF INDIA DECENTRALIZED REVENUE DEPT", 20, 25);
  doc.text("BLOCKCHAIN-VERIFIED RECORD", 20, 29);
  
  // Thin line
  doc.setDrawColor(15, 110, 86);
  doc.setLineWidth(0.5);
  doc.line(20, 32, 190, 32);

  // Watermark (gray diagonal text)
  doc.saveGraphicsState();
  doc.setFontSize(32);
  doc.setTextColor(230, 230, 230);
  // Rotate watermark
  doc.text("BLOCKCHAIN VERIFIED", 35, 180, { angle: 45 });
  doc.restoreGraphicsState();

  // QR Code placeholder / link in bottom-right
  const qrX = 160;
  const qrY = 250;
  doc.setDrawColor(15, 110, 86);
  doc.rect(qrX, qrY, 30, 30);
  doc.setFontSize(6);
  doc.setTextColor(15, 110, 86);
  doc.text("VERIFY REGISTER", qrX + 2, qrY + 12);
  doc.text(parcelId, qrX + 2, qrY + 18);
  doc.text("Scan or Visit /verify", qrX + 2, qrY + 24);
}

export function generateSaleDeed(property: any, owner: any): jsPDF {
  const doc = new jsPDF();
  addDecorations(doc, property.parcelId, "SALE DEED CERTIFICATE");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text("OFFICIAL DEED OF SALE", 20, 45);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // slate-600

  const bodyText = `This document certifies the absolute sale, conveyance, and transfer of ownership of the property registered under Parcel ID ${property.parcelId} and Survey Number ${property.surveyNumber}. The transfer has been completed in accordance with the Transfer of Property Act 1882.

Seller/Current Owner: ${owner.name}
Aadhaar Hash: ${owner.aadhaarHash}
Wallet Address: ${owner.walletAddress || "N/A"}

Property Specifications:
- Area: ${property.area} Sq Ft
- Physical Location: ${property.location}
- Coordinates: Latitude ${property.latitude}, Longitude ${property.longitude}

On-Chain Transaction Reference: ${property.blockchainTxHash || "N/A"}
IPFS Title Deed Reference: ${property.ipfsHash || "N/A"}`;

  const splitText = doc.splitTextToSize(bodyText, 170);
  doc.text(splitText, 20, 55);

  return doc;
}

export function generateGiftDeed(property: any, owner: any): jsPDF {
  const doc = new jsPDF();
  addDecorations(doc, property.parcelId, "GIFT DEED");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text("OFFICIAL GIFT DEED OF TRANSFER", 20, 45);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);

  const bodyText = `This document certifies the transfer of the property registered under Parcel ID ${property.parcelId} as a voluntary gift without consideration, in accordance with Section 122 of the Transfer of Property Act 1882.

Donor (Owner): ${owner.name}
Aadhaar Hash: ${owner.aadhaarHash}
Location details: ${property.location}
Area size: ${property.area} Sq Ft

Verified Transaction Signature Hash: ${property.blockchainTxHash || "N/A"}`;

  const splitText = doc.splitTextToSize(bodyText, 170);
  doc.text(splitText, 20, 55);

  return doc;
}

export function generatePartitionDeed(property: any, owner: any): jsPDF {
  const doc = new jsPDF();
  addDecorations(doc, property.parcelId, "PARTITION DEED");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("OFFICIAL PARTITION DEED", 20, 45);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  const bodyText = `This partition deed records the division of property shares for Parcel ID ${property.parcelId} among designated inheritance nominees, resolving all estate splits.

Initial Owner: ${owner.name}
Aadhaar Reference: ${owner.aadhaarHash}
Survey Reference: ${property.surveyNumber}`;

  const splitText = doc.splitTextToSize(bodyText, 170);
  doc.text(splitText, 20, 55);

  return doc;
}

export function generateKhataCertificate(property: any, owner: any): jsPDF {
  const doc = new jsPDF();
  addDecorations(doc, property.parcelId, "KHATA CERTIFICATE");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("OFFICIAL KHATA CERTIFICATE", 20, 45);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  const bodyText = `This certificate lists the property details in the assessment register of the Revenue Department.

Registered Khata Holder: ${owner.name}
Aadhaar Hash: ${owner.aadhaarHash}
Parcel Number: ${property.parcelId}
Survey ID: ${property.surveyNumber}
Assessment Year: 2026`;

  const splitText = doc.splitTextToSize(bodyText, 170);
  doc.text(splitText, 20, 55);

  return doc;
}

export function generatePropertyTaxReceipt(property: any, owner: any): jsPDF {
  const doc = new jsPDF();
  addDecorations(doc, property.parcelId, "TAX RECEIPT");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PROPERTY TAX PAYMENT RECEIPT", 20, 45);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  const bodyText = `Payment Receipt for Property Tax assessment year 2025-2026.

Payer: ${owner.name}
Aadhaar Hash: ${owner.aadhaarHash}
Property Parcel: ${property.parcelId}
Amount Paid: INR 4,800.00
Status: SUCCESS`;

  const splitText = doc.splitTextToSize(bodyText, 170);
  doc.text(splitText, 20, 55);

  return doc;
}

export function generateEncumbranceCertificate(property: any, transfers: any[]): jsPDF {
  const doc = new jsPDF();
  addDecorations(doc, property.parcelId, "ENCUMBRANCE CERTIFICATE");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("ENCUMBRANCE CERTIFICATE (SEARCH RECORD)", 20, 45);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Search results for property transactions associated with Parcel ID ${property.parcelId} for the past 30 years.`, 20, 53);

  const tableRows = transfers.map((t, index) => [
    index + 1,
    t.id || "N/A",
    t.fromOwnerId || "N/A",
    t.toOwnerId || "N/A",
    `INR ${t.stampDuty.toLocaleString()}`,
    t.status || "COMPLETED",
    t.initiatedAt ? new Date(t.initiatedAt).toLocaleDateString() : "N/A",
  ]);

  (doc as any).autoTable({
    startY: 62,
    head: [["S.No", "Transfer ID", "Seller CUID", "Buyer CUID", "Stamp Duty", "Status", "Date"]],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: [15, 110, 86] },
    styles: { fontSize: 8 },
  });

  return doc;
}
