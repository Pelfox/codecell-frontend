import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { createExecutionToken } from '@/lib/security/jwt';
import { consumeRequest, tokensRateLimiter } from '@/lib/security/ratelimiter';

export async function POST(req: NextRequest) {
  const rateLimitResult = await consumeRequest(req, tokensRateLimiter);
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  const cookieStore = await cookies();
  if (cookieStore.has('execution_token')) {
    return NextResponse.json(
      { executionToken: cookieStore.get('execution_token') },
      { status: 200, headers: rateLimitResult },
    );
  }

  const executionToken = await createExecutionToken();
  cookieStore.set({
    name: 'execution_token',
    value: executionToken,
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    expires: new Date(Date.now() + 5 * 60000),
  });

  return NextResponse.json({ executionToken }, { status: 201, headers: rateLimitResult });
}
