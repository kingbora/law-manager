import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildUrl, normalizeBase, normalizePrefix } from './api-client';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('api-client config helpers', () => {
  it('normalizes base url by removing trailing slash', () => {
    expect(normalizeBase('http://localhost:4000/')).toBe('http://localhost:4000');
    expect(normalizeBase('https://example.com')).toBe('https://example.com');
    expect(normalizeBase(undefined)).toBe('http://localhost:4000');
  });

  it('normalizes prefix to start with slash', () => {
    expect(normalizePrefix('api')).toBe('/api');
    expect(normalizePrefix('/api')).toBe('/api');
    expect(normalizePrefix(undefined)).toBe('/api');
  });

  it('builds url by combining base, prefix and path', () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_BASE_URL', 'https://api.example.com/');
    vi.stubEnv('NEXT_PUBLIC_API_PREFIX', '/v1');
    expect(buildUrl('auth/login')).toBe('https://api.example.com/v1/auth/login');
    expect(buildUrl('/auth/session')).toBe('https://api.example.com/v1/auth/session');
  });
});
