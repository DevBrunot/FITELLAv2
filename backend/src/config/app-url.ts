/** Normaliza host ou URL completa para uso em CORS e links. */
export function normalizeAppUrl(value: string | undefined, fallback: string): string {
  const raw = (value ?? fallback).trim();
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw.replace(/\/$/, '');
  }
  return `https://${raw.replace(/\/$/, '')}`;
}

export function parseCorsOrigins(value: string | undefined, fallback: string): string[] {
  const raw = value ?? fallback;
  return raw
    .split(',')
    .map((part) => normalizeAppUrl(part.trim(), fallback))
    .filter(Boolean);
}
