// Reads the expiry time inside a JWT so the app can log the user out nicely.
//
// IMPORTANT: this only DECODES the token. It does NOT verify the signature
// (the frontend cannot, and must not know the secret). This is used purely
// for user experience. The backend is the only place that truly verifies tokens.

function decodePayload(token) {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

// Returns the expiry as milliseconds since 1970, or null if the token has none.
export function getTokenExpiryMs(token) {
  const payload = token ? decodePayload(token) : null;
  return payload && typeof payload.exp === 'number' ? payload.exp * 1000 : null;
}

export function isTokenExpired(token) {
  if (!token) return true;
  const payload = decodePayload(token);
  if (!payload) return true; // Malformed token: treat as unusable.
  if (typeof payload.exp !== 'number') return false; // No expiry: let the server decide.
  return Date.now() >= payload.exp * 1000;
}