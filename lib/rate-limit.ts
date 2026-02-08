// Simple in-memory rate limiter for API routes
// For production, consider using Redis or Upstash

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

// Default rate limits for different route types
export const RATE_LIMITS = {
  verification: { maxRequests: 10, windowMs: 60000 },    // 10 per minute
  claims: { maxRequests: 30, windowMs: 60000 },          // 30 per minute
  payments: { maxRequests: 20, windowMs: 60000 },        // 20 per minute
  exports: { maxRequests: 5, windowMs: 60000 },          // 5 per minute
  admin: { maxRequests: 100, windowMs: 60000 },          // 100 per minute
  default: { maxRequests: 60, windowMs: 60000 },         // 60 per minute
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.default
): RateLimitResult {
  const now = Date.now()
  const key = identifier
  
  let entry = rateLimitStore.get(key)
  
  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs
    }
    rateLimitStore.set(key, entry)
    
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime
    }
  }
  
  // Increment count
  entry.count++
  
  // Check if over limit
  if (entry.count > config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000)
    }
  }
  
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  }
}

// Helper to get identifier from request
export function getClientIdentifier(request: Request, userId?: string): string {
  // Prefer user ID if authenticated
  if (userId) {
    return `user:${userId}`
  }
  
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  
  return `ip:${ip}`
}

// Helper to create rate limit response
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      retryAfter: result.retryAfter,
      message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetTime.toString(),
        'Retry-After': result.retryAfter?.toString() || '60'
      }
    }
  )
}

// Middleware helper for API routes
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  config: RateLimitConfig = RATE_LIMITS.default
) {
  return async (request: Request): Promise<Response> => {
    const identifier = getClientIdentifier(request)
    const result = rateLimit(identifier, config)
    
    if (!result.success) {
      return rateLimitResponse(result)
    }
    
    const response = await handler(request)
    
    // Add rate limit headers to successful responses
    const headers = new Headers(response.headers)
    headers.set('X-RateLimit-Remaining', result.remaining.toString())
    headers.set('X-RateLimit-Reset', result.resetTime.toString())
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    })
  }
}
