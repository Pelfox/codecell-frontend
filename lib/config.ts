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
