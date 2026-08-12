import { HttpHeaders } from '@angular/common/http';

/**
 * Request options for the administrative endpoints that authenticate with the
 * short lived admin JWT (`/brandconfiguration/admin/*`) rather than the static
 * per-service tokens in `environment.tokens`.
 *
 * Returns null when there is no usable session, so callers can surface an explicit
 * re-login message instead of letting the request fail with a confusing 401.
 */
export function adminAuthorizedOptions(
  token: string | null | undefined,
): { headers: HttpHeaders } | null {
  if (!token || isTokenExpired(token)) return null;

  return {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }),
  };
}

/**
 * The administrative JWT is short lived and there is no refresh endpoint, so a
 * stale session is the normal end state of a long editing session.
 */
function isTokenExpired(token: string): boolean {
  const expiresAt = readExpiry(token);
  return expiresAt !== null && expiresAt <= Date.now();
}

function readExpiry(token: string): number | null {
  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(normalized));
    return typeof claims?.exp === 'number' ? claims.exp * 1000 : null;
  } catch {
    // An unreadable token is left to the server, which is the only authority.
    return null;
  }
}
