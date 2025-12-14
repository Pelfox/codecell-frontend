import { credentials } from '@grpc/grpc-js';
import { RunnerServiceClient } from '@/generated/runner';
import { config } from '../config';

/**
 * Preconfigured gRPC client for communicating with the Runner service.
 */
export const grpcClient = new RunnerServiceClient(config.GRPC_SERVER, credentials.createInsecure());
