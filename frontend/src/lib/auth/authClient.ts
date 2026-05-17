import type {
  LoginRequest,
  RegisterRequest,
  SetupRequest,
  TokenResponse,
  User,
} from '@/types/auth'
import {
  clearAccessToken,
  getAccessToken,
  getSecondsUntilExpiry,
  setAccessToken,
} from './tokenStore'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

/**
 * Refresh proaktiv, wenn der Access Token in weniger als REFRESH_LEEWAY_SECONDS abläuft.
 * 60s ist sicherer Default — verhindert Race mit Server-Clock-Drift.
 */
const REFRESH_LEEWAY_SECONDS = 60

class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'AuthError'
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string; message?: string }
    return body.detail || body.message || response.statusText
  } catch {
    return response.statusText
  }
}

/**
 * Mutex für parallele Refresh-Versuche. Bei n gleichzeitigen Requests, die alle
 * refreshen wollen, läuft genau ein Network-Call und alle warten auf dasselbe Promise.
 * Nach Auflösung wird das Promise wieder genullt, damit der nächste Refresh frisch startet.
 */
let refreshInFlight: Promise<boolean> | null = null

async function performRefresh(): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    clearAccessToken()
    return false
  }

  const data = (await response.json()) as TokenResponse
  setAccessToken(data.access_token)
  return true
}

function refresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = performRefresh().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

async function ensureFreshToken(): Promise<string | null> {
  const token = getAccessToken()
  if (!token) return null
  const seconds = getSecondsUntilExpiry()
  if (seconds === null || seconds < REFRESH_LEEWAY_SECONDS) {
    const ok = await refresh()
    return ok ? getAccessToken() : null
  }
  return token
}

/**
 * Wrapper für authentifizierte Requests: Proactive Refresh + Lazy Fallback bei 401.
 * Refresh wird genau einmal pro Request versucht — bei wiederholtem 401 kommt der
 * Error durch, damit der Caller (z.B. UI) auf die Login-Seite umleiten kann.
 */
export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)

  const fresh = await ensureFreshToken()
  if (fresh) headers.set('Authorization', `Bearer ${fresh}`)

  let response = await fetch(input, { ...init, headers })

  if (response.status === 401 && fresh) {
    const ok = await refresh()
    if (!ok) return response
    const retryHeaders = new Headers(init.headers)
    const retryToken = getAccessToken()
    if (retryToken) retryHeaders.set('Authorization', `Bearer ${retryToken}`)
    response = await fetch(input, { ...init, headers: retryHeaders })
  }

  return response
}

async function handleJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new AuthError(await parseError(response), response.status)
  }
  return response.json() as Promise<T>
}

async function expectStatus(response: Response, expected: number): Promise<void> {
  if (response.status !== expected) {
    throw new AuthError(await parseError(response), response.status)
  }
}

export const authClient = {
  /**
   * Schritt 1 des Onboardings: Email registrieren, Verify-Mail wird verschickt (AUTH-16).
   */
  async register(body: RegisterRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return handleJson<User>(response)
  },

  /**
   * Schritt 2: Verify-Token + Username + Passwort einlösen, Access Token landet im Store.
   */
  async setup(body: SetupRequest): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    })
    const data = await handleJson<TokenResponse>(response)
    setAccessToken(data.access_token)
    return data
  },

  async login(body: LoginRequest): Promise<TokenResponse> {
    // Backend nutzt OAuth2PasswordRequestForm — username/password als x-www-form-urlencoded
    const formData = new URLSearchParams()
    formData.set('username', body.email)
    formData.set('password', body.password)

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'include',
      body: formData,
    })
    const data = await handleJson<TokenResponse>(response)
    setAccessToken(data.access_token)
    return data
  },

  async logout(): Promise<void> {
    const response = await authedFetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    clearAccessToken()
    if (response.status !== 204 && !response.ok) {
      throw new AuthError(await parseError(response), response.status)
    }
  },

  async refresh(): Promise<boolean> {
    return refresh()
  },

  async getMe(): Promise<User> {
    const response = await authedFetch(`${API_BASE_URL}/auth/me`)
    return handleJson<User>(response)
  },
}

export { AuthError }
