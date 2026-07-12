export default function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    const b64 = parts[1];
    if (!b64) return null;
    const payload = JSON.parse(atob(b64));
    return payload?.userId ?? null;
  } catch {
    return null;
  }
}