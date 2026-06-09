import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "LandChain Public API Gateway",
      version: "1.0.0",
      description: "Secure, institutional API access to verified land mutation ledgers, encumbrances, and ownership proofs.",
    },
    paths: {
      "/api/v1/property/{parcelId}": {
        get: {
          summary: "Retrieve Property details by Parcel ID",
          parameters: [
            { name: "parcelId", in: "path", required: true, schema: { type: "string" } },
            { name: "x-api-key", in: "header", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Property details retrieved successfully" },
            401: { description: "Invalid API Key" },
          },
        },
      },
      "/api/v1/owner/{aadhaarHash}/properties": {
        get: {
          summary: "Retrieve properties owned by an Aadhaar profile hash",
          parameters: [
            { name: "aadhaarHash", in: "path", required: true, schema: { type: "string" } },
            { name: "x-api-key", in: "header", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Owner properties retrieved successfully" },
            401: { description: "Invalid API Key" },
          },
        },
      },
      "/api/v1/verify/document": {
        post: {
          summary: "Verify physical deed hash matches registered IPFS CID",
          parameters: [
            { name: "x-api-key", in: "header", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    parcelId: { type: "string" },
                    documentHash: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Verification check computed successfully" },
          },
        },
      },
      "/api/v1/encumbrance/{parcelId}": {
        get: {
          summary: "Verify active liens/encumbrances on property",
          parameters: [
            { name: "parcelId", in: "path", required: true, schema: { type: "string" } },
            { name: "x-api-key", in: "header", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Encumbrance status retrieved successfully" },
          },
        },
      },
      "/api/v1/fraud-score/{parcelId}": {
        get: {
          summary: "Retrieve estimated fraud risk rating",
          parameters: [
            { name: "parcelId", in: "path", required: true, schema: { type: "string" } },
            { name: "x-api-key", in: "header", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Fraud score retrieved successfully" },
          },
        },
      },
    },
  };

  return NextResponse.json(spec);
}
