interface RateLimitEntry {
    count: number;
    resetAt: number; // Milliseconds timestamp
}

// In-memory store for rate limiting (per serverless instance)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 2 minutes
let lastCleanup = Date.now();
function cleanupExpired() {
    const now = Date.now();
    if (now - lastCleanup < 120_000) return;
    lastCleanup = now;

    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetAt) {
            rateLimitStore.delete(key);
        }
    }
}

export interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetAt: number; // Unix timestamp in seconds
    retryAfter: number; // Seconds until reset
}

/**
 * Checks and updates rate limit for a given identifier (e.g. IP address).
 * Default: 60 requests per 60,000 ms (1 minute).
 */
export function checkRateLimit(
    identifier: string,
    limit = 60,
    windowMs = 60_000
): RateLimitResult {
    cleanupExpired();

    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    if (!entry || now > entry.resetAt) {
        // Window expired or first request
        const newResetAt = now + windowMs;
        rateLimitStore.set(identifier, {
            count: 1,
            resetAt: newResetAt
        });

        return {
            allowed: true,
            limit,
            remaining: Math.max(0, limit - 1),
            resetAt: Math.ceil(newResetAt / 1000),
            retryAfter: 0
        };
    }

    // Window still active
    entry.count += 1;
    const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));

    if (entry.count > limit) {
        return {
            allowed: false,
            limit,
            remaining: 0,
            resetAt: Math.ceil(entry.resetAt / 1000),
            retryAfter
        };
    }

    return {
        allowed: true,
        limit,
        remaining: Math.max(0, limit - entry.count),
        resetAt: Math.ceil(entry.resetAt / 1000),
        retryAfter: 0
    };
}

/**
 * Extracts client IP from standard proxy and CDN request headers.
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        const first = forwarded.split(",")[0].trim();
        if (first) return first;
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp) return realIp.trim();

    const cfConnectingIp = request.headers.get("cf-connecting-ip");
    if (cfConnectingIp) return cfConnectingIp.trim();

    return "127.0.0.1";
}
