const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:3000', 'http://localhost:3100'];

const configuredOrigins = (process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS;
const isProduction = process.env.NODE_ENV === 'production';

export function getCorsHeaders(origin?: string | null): Record<string, string> {
  const normalizedOrigin = origin?.trim();
  const isAllowedOrigin = !!normalizedOrigin && allowedOrigins.includes(normalizedOrigin);

  const allowOrigin =
    isAllowedOrigin || (!isProduction && normalizedOrigin)
      ? normalizedOrigin!
      : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export const corsHeaders = getCorsHeaders();
