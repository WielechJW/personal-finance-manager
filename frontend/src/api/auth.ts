export type User = {
  id: number
  email: string
  full_name: string
  created_at: string
}

export type AuthResponse = {
  access_token: string
  token_type: 'bearer'
  user: User
}

export type RegisterPayload = {
  email: string
  full_name: string
  password: string
}

export type LoginPayload = {
  email: string
  password: string
}

const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'
const tokenKey = 'finance_access_token'

export const getAuthToken = () => localStorage.getItem(tokenKey)
export const saveAuthToken = (token: string) => localStorage.setItem(tokenKey, token)
export const clearAuthToken = () => localStorage.removeItem(tokenKey)

const errorMessage = (detail: unknown) => {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((item) => item?.msg).filter(Boolean).join(' ')
  return 'Nie udało się połączyć z serwerem.'
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(errorMessage(payload?.detail))
  }
  return response.json() as Promise<T>
}

export const register = (payload: RegisterPayload) =>
  request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload) })

export const login = (payload: LoginPayload) =>
  request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(payload) })

export const getCurrentUser = () => request<User>('/auth/me')
