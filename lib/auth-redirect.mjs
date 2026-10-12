export function getSafeReturnPath(value, fallback = '/dashboard') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return fallback;

  try {
    const base = 'https://soilcredit.invalid';
    const destination = new URL(value, base);
    if (destination.origin !== base || destination.pathname === '/login') return fallback;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
}
