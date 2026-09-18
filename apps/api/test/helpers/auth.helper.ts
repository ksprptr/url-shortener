import { JwtService } from '@nestjs/jwt';

// Matches OPERATOR_SUBJECT — every session the API issues is for the single operator.
export const TEST_SUBJECT = 'operator';

const jwtService = new JwtService();

/**
 * Signs an access token with the test secret (read from the env loaded by setup-env.ts).
 **/
export const signAccessToken = (over: { sub?: string; ver?: number } = {}): string =>
  jwtService.sign(
    { sub: over.sub ?? TEST_SUBJECT, ver: over.ver ?? 0 },
    { secret: process.env['JWT_ACCESS_SECRET'], expiresIn: 3600 },
  );

/**
 * Builds an `accessToken` cookie header value for an authenticated request.
 **/
export const accessCookie = (over?: { sub?: string; ver?: number }): string =>
  `accessToken=${signAccessToken(over)}`;
