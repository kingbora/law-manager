import {
  appendHeader,
  eventHandler,
  getHeader,
  getMethod,
  sendNoContent,
  setHeader,
} from 'h3';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const parseList = (value?: string) =>
  value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

const allowedOriginsFromEnv = parseList(process.env.CORS_ALLOWED_ORIGINS);
const allowedOrigins =
  allowedOriginsFromEnv.length > 0 ? allowedOriginsFromEnv : DEFAULT_ALLOWED_ORIGINS;

const allowCredentials = (process.env.CORS_ALLOW_CREDENTIALS ?? 'true') !== 'false';
const allowMethods =
  process.env.CORS_ALLOW_METHODS ?? 'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD';
const allowHeaders =
  process.env.CORS_ALLOW_HEADERS ?? 'Content-Type, Authorization, X-Requested-With';
const exposeHeaders = process.env.CORS_EXPOSE_HEADERS;
const maxAge = process.env.CORS_MAX_AGE ?? '600';

const allowAll = allowedOrigins.includes('*');

const resolveAllowedOrigin = (requestOrigin: string) => {
  if (!requestOrigin) {
    return allowAll && !allowCredentials ? '*' : '';
  }

  if (allowAll) {
    return allowCredentials ? requestOrigin : '*';
  }

  return allowedOrigins.includes(requestOrigin) ? requestOrigin : '';
};

export const corsEventHandler = eventHandler((event) => {
  const origin = getHeader(event, 'origin') ?? '';
  const allowedOrigin = resolveAllowedOrigin(origin);
  const isPreflight = getMethod(event).toUpperCase() === 'OPTIONS';

  if (allowedOrigin) {
    setHeader(event, 'Access-Control-Allow-Origin', allowedOrigin);
    appendHeader(event, 'Vary', 'Origin');

    if (allowCredentials && allowedOrigin !== '*') {
      setHeader(event, 'Access-Control-Allow-Credentials', 'true');
    }

    setHeader(event, 'Access-Control-Allow-Methods', allowMethods);
    setHeader(event, 'Access-Control-Allow-Headers', allowHeaders);

    if (exposeHeaders) {
      setHeader(event, 'Access-Control-Expose-Headers', exposeHeaders);
    }

    if (maxAge) {
      setHeader(event, 'Access-Control-Max-Age', maxAge);
    }
  }

  if (isPreflight) {
    return sendNoContent(event, 204);
  }
});
