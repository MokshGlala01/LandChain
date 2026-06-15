import { redis } from './redis'

const memoryCache = new Map<string, { count: number; expires: number }>()

export async function rateLimit(
  key: string,
  opts: { max: number; window: string }
): Promise<void> {
  const windowSecs = parseWindow(opts.window)

  if (redis && redis.status === 'ready') {
    try {
      const current = await redis.incr(`rl:${key}`)
      if (current === 1) await redis.expire(`rl:${key}`, windowSecs)
      if (current > opts.max) {
        const ttl = await redis.ttl(`rl:${key}`)
        throw new RateLimitError(`Rate limit exceeded. Retry after ${ttl}s`)
      }
      return
    } catch (err) {
      if (err instanceof RateLimitError) throw err
      console.warn('Redis rate limiting error, falling back to memory:', err)
    }
  }

  // In-memory sliding window fallback
  const now = Date.now()
  const cached = memoryCache.get(key)

  if (!cached || now > cached.expires) {
    memoryCache.set(key, { count: 1, expires: now + windowSecs * 1000 })
  } else {
    cached.count++
    if (cached.count > opts.max) {
      const ttl = Math.ceil((cached.expires - now) / 1000)
      throw new RateLimitError(`Rate limit exceeded. Retry after ${ttl}s`)
    }
  }
}

function parseWindow(w: string): number {
  if (w.endsWith('s')) return parseInt(w)
  if (w.endsWith('m')) return parseInt(w) * 60
  if (w.endsWith('h')) return parseInt(w) * 3600
  if (w.endsWith('d')) return parseInt(w) * 86400
  return 3600
}

export class RateLimitError extends Error {
  constructor(message: string) { 
    super(message)
    this.name = 'RateLimitError' 
  }
}
