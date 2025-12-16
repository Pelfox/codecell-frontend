import { env } from 'node:process';
import z from 'zod';

const configSchema = z.object({
  /**
   * Runner gRPC server address (in the format `host:port`).
   */
  GRPC_SERVER: z.string().default('localhost:50051'),
  /**
   * Level for the Next.js' server-side logger (Winston).
   */
  LOGGER_LEVEL: z.string().default('info'),
  /**
   * Active environment for the Node.js process.
   */
  NODE_ENV: z.enum(['development', 'test', 'production']),
  /**
   * Absolute path to the private key used for signing JWTs.
   */
  JWT_PRIVATE_PATH: z.string().default('private.pem'),
  /**
   * Absolute path to the public key used for verifying JWTs.
   */
  JWT_PUBLIC_PATH: z.string().default('public.pem'),
  /**
   * Redis connection string.
   * Format: `redis://[:password@]host:port[/db]`
   */
  REDIS_DSN: z.string().default('redis://localhost:6379'),
});

const parsedConfig = configSchema.safeParse(env);
if (!parsedConfig.success) {
  console.error('Failed to parse configuration', z.treeifyError(parsedConfig.error));
  throw new Error('Invalid configuration, see the error above.');
}

/**
 * Parsed and validated configuration for the application.
 */
export const config = parsedConfig.data;
