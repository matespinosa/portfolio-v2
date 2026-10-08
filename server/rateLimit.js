import { createHmac } from 'node:crypto'
import { Redis } from '@upstash/redis'

const COUNTER_TTL_SECONDS = 60 * 60 * 48

const RESERVE_REQUEST_SCRIPT = `
local global_count = tonumber(redis.call('GET', KEYS[1]) or '0')
local visitor_count = tonumber(redis.call('GET', KEYS[2]) or '0')
local global_limit = tonumber(ARGV[1])
local visitor_limit = tonumber(ARGV[2])
local ttl = tonumber(ARGV[3])

if global_count >= global_limit then
  return {0, global_count, visitor_count, 1}
end

if visitor_count >= visitor_limit then
  return {0, global_count, visitor_count, 2}
end

global_count = redis.call('INCR', KEYS[1])
visitor_count = redis.call('INCR', KEYS[2])

if global_count == 1 then redis.call('EXPIRE', KEYS[1], ttl) end
if visitor_count == 1 then redis.call('EXPIRE', KEYS[2], ttl) end

return {1, global_count, visitor_count, 0}
`

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function bogotaDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function clientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'unknown'
  )
}

export function createRateLimitStore(env = process.env) {
  const url =
    env.UPSTASH_REDIS_REST_URL ||
    env.UPSTASH_REDIS_REST_KV_REST_API_URL ||
    env.KV_REST_API_URL
  const token =
    env.UPSTASH_REDIS_REST_TOKEN ||
    env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN ||
    env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export async function reserveGeminiRequest({ request, redis, env = process.env, date = new Date() }) {
  const globalLimit = positiveInteger(env.GEMINI_DAILY_LIMIT, 15)
  const visitorLimit = Math.min(
    positiveInteger(env.GEMINI_VISITOR_DAILY_LIMIT, 5),
    globalLimit,
  )
  const day = bogotaDateKey(date)
  const visitorHash = createHmac(
    'sha256',
    env.RATE_LIMIT_SALT || env.GEMINI_API_KEY || 'portfolio-chat',
  )
    .update(clientIp(request))
    .digest('hex')
    .slice(0, 24)
  const keyPrefix = `portfolio-chat:{${day}}`

  const result = await redis.eval(
    RESERVE_REQUEST_SCRIPT,
    [`${keyPrefix}:global`, `${keyPrefix}:visitor:${visitorHash}`],
    [globalLimit, visitorLimit, COUNTER_TTL_SECONDS],
  )
  const [allowed, globalCount, visitorCount, reasonCode] = result.map(Number)

  return {
    allowed: allowed === 1,
    globalCount,
    globalLimit,
    remaining: Math.max(0, globalLimit - globalCount),
    visitorCount,
    visitorLimit,
    reason: reasonCode === 1 ? 'global' : reasonCode === 2 ? 'visitor' : null,
  }
}
