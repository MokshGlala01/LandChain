import Redis from 'ioredis'

let redis: Redis | null = null
const redisUrl = process.env.REDIS_URL || process.env.REDIS_TLS_URL

if (redisUrl) {
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000
    })
    redis.on('error', (err) => {
      console.warn('[Cache] Redis error, falling back to memory:', err.message)
    })
  } catch (err) {
    console.warn('[Cache] Failed to initialize Redis client, using memory fallback.')
  }
}

// In-memory cache fallback
const memoryStore = new Map<string, { valStr: string; expiresAt: number }>()

export async function cacheGet(key: string): Promise<any> {
  if (redis && redis.status === 'ready') {
    try {
      const data = await redis.get(key)
      if (data) {
        return JSON.parse(data)
      }
      return null
    } catch (e) {
      // Fall through to memory store
    }
  }

  const record = memoryStore.get(key)
  if (!record) return null
  if (Date.now() > record.expiresAt) {
    memoryStore.delete(key)
    return null
  }
  try {
    return JSON.parse(record.valStr)
  } catch {
    return record.valStr
  }
}

export async function cacheSet(key: string, value: any, ttlSeconds: number): Promise<void> {
  if (redis && redis.status === 'ready') {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
      return
    } catch (e) {
      // Fall through to memory store
    }
  }

  memoryStore.set(key, {
    valStr: JSON.stringify(value),
    expiresAt: Date.now() + ttlSeconds * 1000
  })
}

export async function cacheDel(key: string): Promise<void> {
  if (redis && redis.status === 'ready') {
    try {
      await redis.del(key)
      return
    } catch (e) {
      // Fall through to memory store
    }
  }

  memoryStore.delete(key)
}

export async function cacheIncr(key: string): Promise<number> {
  if (redis && redis.status === 'ready') {
    try {
      return await redis.incr(key)
    } catch (e) {
      // Fall through to memory store
    }
  }

  const current = await cacheGet(key)
  const nextVal = (typeof current === 'number' ? current : parseInt(current || '0', 10)) + 1
  await cacheSet(key, nextVal, 3600) // Default 1 hour TTL
  return nextVal
}
