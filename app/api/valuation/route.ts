import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { parcelId, state, district, propertyType, area } = body;

    let targetState = state || "Uttar Pradesh";
    let targetDistrict = district || "Gautam Buddha Nagar (Noida)";
    let targetType = propertyType || "Residential";
    let targetArea = parseFloat(area) || 1000;

    // If parcelId is provided, lookup details to override inputs
    if (parcelId) {
      const prop = await prisma.property.findUnique({
        where: { parcelId },
      });
      if (prop) {
        targetArea = prop.area;
        targetType = prop.status === "AGRICULTURAL" ? "Agricultural" : "Residential";
        // Parse state/district from location text fallback
        if (prop.location.includes("Noida") || prop.location.includes("Uttar Pradesh")) {
          targetState = "Uttar Pradesh";
          targetDistrict = "Gautam Buddha Nagar (Noida)";
        } else if (prop.location.includes("Delhi")) {
          targetState = "Delhi";
          targetDistrict = "South Delhi";
        }
      }
    }

    // 1. Fetch circle rate from database
    let rate = await prisma.circleRate.findFirst({
      where: {
        state: targetState,
        district: targetDistrict,
        propertyType: targetType,
      },
    });

    // Fallback if not seeded
    const ratePerSqft = rate ? rate.ratePerSqft : 4500;

    const circleValue = targetArea * ratePerSqft;

    // 2. Multipliers logic
    let typeMultiplier = 1.0;
    if (targetType.toLowerCase() === "commercial") {
      typeMultiplier = 1.4;
    } else if (targetType.toLowerCase() === "agricultural") {
      typeMultiplier = 0.8;
    } else if (targetType.toLowerCase() === "industrial") {
      typeMultiplier = 1.25;
    }

    const estimatedValue = circleValue * typeMultiplier;
    const estimatedMarketValue = estimatedValue;
    const fairMarketMin = estimatedValue * 0.92;
    const fairMarketMax = estimatedValue * 1.08;

    // 3. Fetch stamp duty rate
    const dutyRate = await prisma.stampDutyRate.findFirst({
      where: {
        state: targetState,
        propertyType: targetType,
      },
    });

    const dutyPercent = dutyRate ? dutyRate.dutyPercent : 6.0;
    const regFeePercent = dutyRate ? dutyRate.regFeePercent : 1.0;

    const stampDutyPayable = (estimatedValue * dutyPercent) / 100;
    const registrationFee = (estimatedValue * regFeePercent) / 100;

    // 4. Fetch last 5 comparable sales in the same district/location
    const comps = await prisma.transfer.findMany({
      where: {
        status: "COMPLETED",
        property: {
          location: {
            contains: targetDistrict.replace(/\s*\(.*\)/, ""), // search partial name
          },
        },
      },
      take: 5,
      orderBy: { initiatedAt: "desc" },
      include: { property: true },
    });

    // Formulate final comparative listing
    const compsFormatted = comps.length > 0
      ? comps.map(c => ({
          date: c.completedAt || c.initiatedAt,
          amount: c.stampDuty * (100 / (dutyPercent || 6)), // reverse compute price estimate
          area: c.property.area,
          pricePerSqft: (c.stampDuty * (100 / (dutyPercent || 6))) / c.property.area,
        }))
      : [
          // mock comp list fallback
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), amount: estimatedValue * 0.95, area: targetArea, pricePerSqft: (estimatedValue * 0.95) / targetArea },
          { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), amount: estimatedValue * 0.98, area: targetArea, pricePerSqft: (estimatedValue * 0.98) / targetArea },
          { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), amount: estimatedValue * 1.02, area: targetArea, pricePerSqft: (estimatedValue * 1.02) / targetArea },
        ];

    // Valuation history timeline for line graphs
    const historicalValuations = [
      { year: 2022, value: estimatedValue * 0.82 },
      { year: 2023, value: estimatedValue * 0.88 },
      { year: 2024, value: estimatedValue * 0.93 },
      { year: 2025, value: estimatedValue * 0.97 },
      { year: 2026, value: estimatedValue },
    ];

    return NextResponse.json({
      parcelId: parcelId || null,
      state: targetState,
      district: targetDistrict,
      propertyType: targetType,
      area: targetArea,
      circleRatePerSqft: ratePerSqft,
      circleValue,
      estimatedMarketValue,
      fairMarketRange: [fairMarketMin, fairMarketMax],
      stampDutyAutoCalc: stampDutyPayable,
      registrationFeeAutoCalc: registrationFee,
      totalPayableFees: stampDutyPayable + registrationFee,
      comparableSales: compsFormatted,
      historicalValuations,
    });
  } catch (error: any) {
    console.error("[Valuation Exception]:", error);
    return NextResponse.json({ error: error.message || "Valuation engine failed" }, { status: 500 });
  }
}
