import Redis from 'ioredis';
import { config } from './config';

const globalForRedis = globalThis as unknown as { client?: Redis };

export const redisClient = globalForRedis.client ?? new Redis(config.REDIS_DSN);

if (config.NODE_ENV !== 'production') {
  globalForRedis.client = redisClient;
}
