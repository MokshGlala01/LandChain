import Redis from 'ioredis'

let redis: Redis | null = null

if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    })
    redis.on('error', (err) => {
      console.warn('Redis connection failed:', err.message)
    })
  } catch (err) {
    console.warn('Redis initialization error:', err)
  }
} else {
  console.log('REDIS_URL not configured. Running in memory-fallback mode.')
}

export { redis }
