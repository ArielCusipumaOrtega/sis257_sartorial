export function getTokenFromLocalStorage(): string | null {
  const token = localStorage.getItem('token') || ''
  if (!token) return null

  try {
    const payload = parseJwt(token)
    const isExpired = payload.exp < Date.now() / 1000
    if (!isExpired) return token
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return null
  } catch (e) {
    return null
  }
}

export function parseJwt(token: string) {
  const base64Url = token.split('.')[1] ?? ''
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  )
  return JSON.parse(jsonPayload)
}

export function getImageUrl(path?: string | null): string {
  if (!path) return 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600'
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  const base = import.meta.env.VITE_BASE_URL_ENDPOINT || 'http://127.0.0.1:3000/api/v1/'
  const origin = base.replace(/\/api\/v1\/?$/, '')
  return `${origin}/${cleanPath}`
}

export function formatPrice(amount: number | string | null | undefined): string {
  const num = Number(amount || 0)
  return `Bs. ${num.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return '-'
  const d = new Date(dateString)
  return d.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
