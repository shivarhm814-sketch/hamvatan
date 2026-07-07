const TOKEN_COOKIE = 'esmaeili_token';

export interface JwtPayload {
  sub: string;
  mobile: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  iat: number;
  exp: number;
}

export function setAuthToken(token: string, maxAgeSeconds = 60 * 60 * 24 * 7): void {
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearAuthToken(): void {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
}

// Not signature-verified — only used for client/edge-side UX decisions (nav, redirects).
// The backend independently verifies the signature and enforces roles on every request.
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const segment = token.split('.')[1];
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getCurrentUserRole(): JwtPayload['role'] | null {
  const token = getAuthToken();
  if (!token) return null;
  return decodeJwtPayload(token)?.role ?? null;
}

export { TOKEN_COOKIE };
