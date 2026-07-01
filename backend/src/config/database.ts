export function getDatabaseSsl(url?: string) {
  if (!url) return undefined;
  const needsSsl =
    url.includes('sslmode=require')
    || url.includes('neon.tech')
    || url.includes('amazonaws.com');
  return needsSsl ? { rejectUnauthorized: false } : undefined;
}
