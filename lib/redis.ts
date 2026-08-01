import { Redis } from '@upstash/redis'

// In-memory store for local development (when Redis credentials are not set)
const memStore = new Map<string, unknown>()
const memSets = new Map<string, Set<string>>()

const mockRedis = {
  async get<T>(key: string): Promise<T | null> {
    return (memStore.get(key) as T) ?? null
  },
  async set(key: string, value: unknown): Promise<void> {
    memStore.set(key, value)
  },
  async del(key: string): Promise<void> {
    memStore.delete(key)
  },
  async smembers(key: string): Promise<string[]> {
    return Array.from(memSets.get(key) ?? [])
  },
  async sadd(key: string, member: string): Promise<void> {
    if (!memSets.has(key)) memSets.set(key, new Set())
    memSets.get(key)!.add(member)
  },
  async srem(key: string, member: string): Promise<void> {
    memSets.get(key)?.delete(member)
  },
}

let redis: Redis | null = null

export function getRedis(): Redis | typeof mockRedis {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    // Fallback: in-memory mock for local development
    if (process.env.NODE_ENV !== 'production') {
      return mockRedis as unknown as Redis
    }
    throw new Error('Missing Redis environment variables (KV_REST_API_URL / UPSTASH_REDIS_REST_URL or KV_REST_API_TOKEN / UPSTASH_REDIS_REST_TOKEN)')
  }

  if (!redis) {
    redis = new Redis({ url, token })
  }

  return redis
}

