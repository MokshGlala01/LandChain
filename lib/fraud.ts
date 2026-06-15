import { prisma } from './db'

export interface FraudScoreResult {
  score: number
  flags: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

export async function calculateFraudScore(parcelId: string): Promise<FraudScoreResult> {
  const property = await prisma.property.findUnique({
    where: { parcelId },
    include: {
      transfers: { orderBy: { initiatedAt: 'asc' } }
    }
  })

  if (!property) return { score: 0, flags: [], riskLevel: 'low' }

  let score = 0
  const flags: string[] = []

  // 1. Transfer frequency check: High activity is a risk flag
  const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)
  const recentTransfers = property.transfers.filter(t => t.initiatedAt > twoYearsAgo)
  if (recentTransfers.length >= 3) {
    score += 30
    flags.push(`${recentTransfers.length} transfers in 2 years`)
  }

  // 2. Valuation jump check
  const completedTransfers = property.transfers.filter(t => t.status === 'COMPLETED')
  if (completedTransfers.length >= 2) {
    const latest = completedTransfers[completedTransfers.length - 1]
    const prev = completedTransfers[completedTransfers.length - 2]
    if (prev.stampDuty > 0) {
      const jump = ((latest.stampDuty - prev.stampDuty) / prev.stampDuty) * 100
      if (jump > 50) {
        score += 25
        flags.push(`${jump.toFixed(0)}% valuation jump`)
      }
    }
  }

  // 3. Status checks (active disputes, legal holds or litigation)
  if (property.status === 'DISPUTED') {
    score += 25
    flags.push('Active dispute: Property has a boundary or ownership claim filed')
  } else if (property.status === 'FROZEN') {
    score += 35
    flags.push('Property is frozen by authorities')
  } else if (property.status === 'LITIGATED') {
    score += 40
    flags.push('Active litigation: Property is in court proceedings')
  } else if (property.status === 'FLAGGED') {
    score += 15
    flags.push('Property marked as flagged')
  }

  // 4. Same buyer pattern
  const buyerCounts = property.transfers.reduce((acc, t) => {
    acc[t.toOwnerId] = (acc[t.toOwnerId] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  const repeatedBuyers = Object.values(buyerCounts).filter(c => c > 1)
  if (repeatedBuyers.length > 0) {
    score += 10
    flags.push('Repeated buyer detected')
  }

  score = Math.min(score, 100)
  const riskLevel = score < 30 ? 'low' : score < 75 ? 'medium' : 'high'

  return { score, flags, riskLevel }
}
