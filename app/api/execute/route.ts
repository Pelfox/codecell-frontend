import type { NextRequest } from 'next/server';
import type { RunResponseMessage } from '@/generated/runner';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/lib/logger';
import { grpcClient } from '@/lib/realtime/grpc-client';
import { redisClient } from '@/lib/redis';
import { validateExecutionToken } from '@/lib/security/jwt';
import { consumeRequest, executorRateLimiter } from '@/lib/security/ratelimiter';
import { executeSchema } from '@/lib/types/execute-schema';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('execution_token');
  if (!tokenCookie) {
    return NextResponse.json({ message: 'Authorzation is requried.' }, { status: 401 });
  }

  const result = await validateExecutionToken(tokenCookie.value);
  if (!result) {
    return NextResponse.json({ message: 'Authorzation is requried.' }, { status: 401 });
  }

  const body = await req.json();
  const validationResult = await executeSchema.safeParseAsync(body);

  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: 'Validation failed.',
        details: z.treeifyError(validationResult.error),
      },
      { status: 422 },
    );
  }

  const consumeResult = await consumeRequest(req, executorRateLimiter);
  if (consumeResult instanceof NextResponse) {
    return consumeResult;
  }

  const executionKey = `execution:${result.id}`;
  const setResult = await redisClient.set(executionKey, '1', 'EX', 360, 'NX');
  if (setResult !== 'OK') {
    return NextResponse.json(
      { message: 'An execution is already running for this user.' },
      { status: 409 },
    );
  }

  const { sourceCode, timeoutSeconds, stdin } = validationResult.data;
  logger.info('Processing a new request for the execution', validationResult.data);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      let isClosed = false;

      // helper function to write messages onto SSE stream
      function writeMessage(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`),
        );
      }

      // helper function to close the SSE stream
      function closeStream(reason?: string) {
        if (isClosed) {
          return;
        }

        try {
          controller.close();
          logger.info('Closed SSE connection', { reason });
        } catch {}

        redisClient.del(executionKey).catch((error) => {
          logger.error('Failed to delete execution key from Redis', {
            message: error.message,
            name: error.name,
          });
        });

        isClosed = true;
      }

      // making actual gRPC call
      const call = grpcClient.run({
        stdin,
        sourceCode,
        timeoutSeconds,
        language: 'dotnet',
      });

      call.on('end', () => closeStream('gRPC call ended'));
      call.on('data', (message: RunResponseMessage) => writeMessage('message', message));

      call.on('error', (error) => {
        logger.error('gRPC error got caught:', { message: error.message, name: error.name });
        writeMessage('error', { message: 'Server-side error.' });
        closeStream();
      });

      req.signal.addEventListener('abort', () => {
        call.cancel();
        closeStream();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
