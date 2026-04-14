const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:3000', 'http://localhost:3100'];

const configuredOrigins = (process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS;
const isProduction = process.env.NODE_ENV === 'production';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isOriginAllowed(origin: string): boolean {
  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin.includes('*')) {
      const regexPattern = `^${escapeRegex(allowedOrigin).replace(/\\\*/g, '.*')}$`;
      return new RegExp(regexPattern).test(origin);
    }

    return allowedOrigin === origin;
  });
}

export function getCorsHeaders(origin?: string | null): Record<string, string> {
  const normalizedOrigin = origin?.trim();
  const allowOrigin =
    normalizedOrigin && (isOriginAllowed(normalizedOrigin) || (!isProduction && normalizedOrigin))
      ? normalizedOrigin
      : undefined;

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };

  if (allowOrigin) {
    headers['Access-Control-Allow-Origin'] = allowOrigin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

export const corsHeaders = getCorsHeaders();
