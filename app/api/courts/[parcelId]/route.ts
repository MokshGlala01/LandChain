import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { parcelId: string } }) {
  try {
    const parcelId = params.parcelId.toUpperCase();

    // Simulated eCourts lookup
    const cases = [
      {
        caseNumber: `OS-${Math.floor(100 + Math.random() * 900)}/2025`,
        courtName: "District Civil Court, Gautam Buddha Nagar",
        filingDate: "2025-11-15",
        nextHearing: "2026-07-20",
        petitioner: "Revenue Department, UP",
        respondent: "Anil Sharma & Others",
        status: "PENDING",
      },
    ];

    return NextResponse.json({
      parcelId,
      hasPendingCases: true,
      cases,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
