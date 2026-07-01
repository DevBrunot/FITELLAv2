function normalizeApiBaseUrl(raw: string | undefined): string {
  const base = (raw ?? 'http://localhost:3000').trim()
  if (base.startsWith('http://') || base.startsWith('https://')) {
    return base.replace(/\/$/, '')
  }
  return `https://${base.replace(/\/$/, '')}`
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)

export const apiBaseUrl = API_BASE_URL.replace(/\/$/, '')
export const apiUrl = `${apiBaseUrl}/api`
