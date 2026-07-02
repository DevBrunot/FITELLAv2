export function getDatabaseSsl(url?: string) {
  if (!url) return undefined;
  const needsSsl =
    url.includes('sslmode=require')
    || url.includes('neon.tech')
    || url.includes('amazonaws.com');
  return needsSsl ? { rejectUnauthorized: false } : undefined;
}

/** Remove aspas e espaços; valida host da connection string do Neon/Postgres. */
export function normalizeDatabaseUrl(raw?: string): string {
  const url = raw?.trim().replace(/^["']|["']$/g, '');
  if (!url) {
    throw new Error(
      'DATABASE_URL não está definida. No Render: fitela-api → Environment → cole a connection string do Neon.',
    );
  }

  if (/^(base|host|HOST|DB|USER|PASSWORD)$/i.test(url)) {
    throw new Error(
      `DATABASE_URL inválida ("${url}"). Cole a URL completa do Neon, ex: postgresql://user:senha@ep-xxx.neon.tech/neondb?sslmode=require`,
    );
  }

  const probe = url.replace(/^postgres(ql)?:\/\//, 'https://');
  let hostname: string;
  try {
    hostname = new URL(probe).hostname;
  } catch {
    throw new Error(
      'DATABASE_URL inválida. Use a connection string completa do painel Neon (aba Connection string).',
    );
  }

  if (!hostname || ['base', 'host', 'localhost'].includes(hostname.toLowerCase()) && !url.includes('localhost')) {
    throw new Error(
      `DATABASE_URL com host inválido ("${hostname}"). Verifique no Render se não colou VITE_API_BASE_URL ou placeholder no lugar da URL do Neon.`,
    );
  }

  return url;
}
