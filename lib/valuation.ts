import { prisma } from './db'

export interface ValuationResult {
  estimatedValue: number
  circleRateValue: number
  marketValue: number
  stampDutyPercent: number
  stampDutyAmount: number
  registrationFee: number
}

export async function calculateValuation(params: {
  parcelId: string
  state: string
  district: string
  propertyType: string
  areaSqft: number
}): Promise<ValuationResult> {
  // 1. Fetch Circle Rate for district & type
  const circleRate = await prisma.circleRate.findFirst({
    where: { 
      state: params.state, 
      district: params.district, 
      propertyType: params.propertyType, 
      year: new Date().getFullYear() 
    }
  })

  // Circle rate per sqft defaults to 3000 if not seeded
  const ratePerSqft = circleRate?.ratePerSqft ?? 3000
  const circleRateValue = ratePerSqft * params.areaSqft

  // 2. Fetch recent completed transfers in the same district/location to compute market multiplier
  const recentTransfers = await prisma.transfer.findMany({
    where: {
      status: 'COMPLETED',
      property: { 
        location: { contains: params.district }, 
        status: 'ACTIVE' 
      }
    },
    orderBy: { completedAt: 'desc' },
    take: 5,
    include: { property: true }
  })

  const marketMultiplier = recentTransfers.length > 0
    ? recentTransfers.reduce((acc, t) => acc + ((t.property.area * ratePerSqft) / circleRateValue), 0) / recentTransfers.length
    : 1.15

  const marketValue = circleRateValue * Math.max(0.8, Math.min(2.5, marketMultiplier))
  const estimatedValue = (circleRateValue + marketValue) / 2

  // 3. Fetch Stamp Duty Rate for state & type
  const stampDutyRate = await prisma.stampDutyRate.findFirst({
    where: { 
      state: params.state, 
      propertyType: params.propertyType, 
      relationship: 'unrelated' 
    }
  })

  const stampDutyPercent = stampDutyRate?.dutyPercent ?? 5
  const regFeePercent = stampDutyRate?.regFeePercent ?? 1

  const stampDutyAmount = (estimatedValue * stampDutyPercent) / 100
  const registrationFee = (estimatedValue * regFeePercent) / 100

  return { 
    estimatedValue: Math.round(estimatedValue), 
    circleRateValue: Math.round(circleRateValue), 
    marketValue: Math.round(marketValue), 
    stampDutyPercent, 
    stampDutyAmount: Math.round(stampDutyAmount), 
    registrationFee: Math.round(registrationFee) 
  }
}
