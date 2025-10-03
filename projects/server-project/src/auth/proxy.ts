import { appendResponseHeader, getRequestHeaders, H3Event, setResponseStatus } from 'h3';
import { authBasePath, authInstance, authOptions } from './';

type ProxyInit = {
  method: string;
  body?: string | URLSearchParams | FormData;
  headers?: Record<string, string>;
};

type ProxyResult<T> = {
  status: number;
  ok: boolean;
  data: T;
  headers: Headers;
};

const toRequestHeaders = (event: H3Event) => {
  const headers = new Headers();
  const requestHeaders = getRequestHeaders(event);
  for (const [key, value] of Object.entries(requestHeaders)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      headers.set(key, value.join(', '));
    } else {
      headers.set(key, value);
    }
  }
  return headers;
};

const applyResponseHeaders = (event: H3Event, response: Response) => {
  for (const [key, value] of response.headers) {
    if (key.toLowerCase() === 'set-cookie') {
      appendResponseHeader(event, 'set-cookie', value);
    } else {
      appendResponseHeader(event, key, value);
    }
  }
};

const resolveUrl = (route: string) => {
  const base = authOptions.baseURL || `http://localhost:${process.env.PORT ?? 4000}`;
  return new URL(`${authBasePath}${route}`, base).toString();
};

export const proxyAuthRequest = async <T>(
  event: H3Event,
  route: string,
  init: ProxyInit,
): Promise<ProxyResult<T>> => {
  const headers = toRequestHeaders(event);

  if (init.headers) {
    for (const [key, value] of Object.entries(init.headers)) {
      headers.set(key, value);
    }
  }

  const request = new Request(resolveUrl(route), {
    method: init.method,
    headers,
    body: init.body,
  });

  const response = await authInstance.handler(request);
  applyResponseHeaders(event, response);
  setResponseStatus(event, response.status);

  const contentType = response.headers.get('content-type') ?? '';
  let data: unknown = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else if (contentType.startsWith('text/')) {
    data = await response.text();
  }

  return {
    status: response.status,
    ok: response.ok,
    data: data as T,
    headers: response.headers,
  };
};
