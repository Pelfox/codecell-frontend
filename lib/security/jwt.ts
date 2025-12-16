/* eslint-disable perfectionist/sort-imports */
import 'server-only';

import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { importPKCS8, importSPKI, jwtVerify, SignJWT } from 'jose';
import { config } from '../config';
import { env } from 'node:process';

let jwtPrivateKey: Promise<any>;
let jwtPublicKey: Promise<any>;

if (env.CI !== 'true') {
  jwtPrivateKey = importPKCS8(readFileSync(path.resolve(config.JWT_PRIVATE_PATH), 'utf8'), 'RS256');
  jwtPublicKey = importSPKI(readFileSync(path.resolve(config.JWT_PUBLIC_PATH), 'utf8'), 'RS256');
} else {
  jwtPrivateKey = Promise.resolve(null);
  jwtPublicKey = Promise.resolve(null);
}

/**
 * Creates a short-lived execution JWT.
 *
 * @returns A signed JWT string.
 */
export async function createExecutionToken() {
  const privateKey = await jwtPrivateKey;
  return new SignJWT({
    version: 1,
    scope: 'executionRequest',
  })
    .setProtectedHeader({
      alg: 'RS256',
      kid: 'v1',
    })
    .setIssuedAt()
    .setJti(randomUUID())
    .setIssuer('codecell-frontend')
    .setAudience('codecell-runner')
    .setExpirationTime('5m')
    .sign(privateKey);
}

/**
 * Validates an execution JWT.
 *
 * @param token - String with JWT token to validate.
 * @returns An object containing the token ID if valid, otherwise `null`.
 */
export async function validateExecutionToken(token: string) {
  const publicKey = await jwtPublicKey;

  try {
    const { payload, protectedHeader } = await jwtVerify(token, publicKey, {
      issuer: 'codecell-frontend',
      audience: 'codecell-runner',
      algorithms: ['RS256'],
    });

    if (protectedHeader.kid !== 'v1') {
      return null;
    }

    if (payload.version !== 1 || payload.scope !== 'executionRequest') {
      return null;
    }

    return { id: payload.jti };
  } catch {
    return null;
  }
}
