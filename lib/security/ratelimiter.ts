import type { NextRequest } from 'next/server';
import type { IRateLimiterRedisOptions, RateLimiterRes } from 'rate-limiter-flexible';
import { NextResponse } from 'next/server';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { logger } from '../logger';
import { redisClient } from '../redis';

const executorRateLimiterOptions: IRateLimiterRedisOptions = {
  storeClient: redisClient,
  keyPrefix: 'executionRatelimit',
  points: 1,
  duration: 1,
};

/**
 * Rate limiter instance for execution-related requests.
 */
export const executorRateLimiter = new RateLimiterRedis(executorRateLimiterOptions);

const tokensRateLimiterOptions: IRateLimiterRedisOptions = {
  storeClient: redisClient,
  keyPrefix: 'tokensRatelimit',
  points: 1,
  duration: 10,
};

/**
 * Rate limiter instance for token-related requests.
 */
export const tokensRateLimiter = new RateLimiterRedis(tokensRateLimiterOptions);

/**
 * Consumes a rate-limiting point for the incoming request.
 *
 * The client is identified by its IP address, resolved using
 * `x-forwarded-for`, `x-real-ip`, or a fallback to `127.0.0.1`.
 *
 * On success, rate-limit metadata headers are returned.
 * On failure, an appropriate HTTP response is generated.
 *
 * @param req - Incoming Next.js request.
 * @param limiter - RateLimiterRedis instance to consume points from.
 * @returns Rate-limit headers on success, or a NextResponse on failure.
 */
export async function consumeRequest(req: NextRequest, limiter: RateLimiterRedis) {
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = req.headers.get('x-real-ip')?.trim();
  const ip = (forwardedFor ?? realIp ?? '127.0.0.1').replaceAll(':', '_');

  try {
    const result = await limiter.consume(ip);
    return {
      'Retry-After': (Math.round(result.msBeforeNext / 1000) || 1).toString(),
      'X-RateLimit-Limit': limiter.points.toString(),
      'X-RateLimit-Remaining': result.remainingPoints.toString(),
      'X-RateLimit-Reset': Math.ceil((Date.now() + result.msBeforeNext) / 1000).toString(),
    };
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Failed to consume token request', {
        message: error.message,
        name: error.name,
      });
      return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }

    const limiterError = error as RateLimiterRes;
    const retryAfterSeconds = Math.round(limiterError.msBeforeNext / 1000) || 1;
    return NextResponse.json(
      { message: 'Too many requests. You are rate-limited.' },
      { status: 429, headers: { 'Retry-After': retryAfterSeconds.toString() } },
    );
  }
}
