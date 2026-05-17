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
 * Refresh proactively if the access token expires in less than REFRESH_LEEWAY_SECONDS.
 * 60s is a safe default — accounts for minor server/client clock drift.
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
 * Mutex for parallel refresh attempts. With n concurrent requests all wanting
 * to refresh, only one network call runs; the rest await the same promise.
 * After it resolves, the slot is cleared so the next refresh starts fresh.
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
 * Wrapper for authenticated requests: proactive refresh + lazy fallback on 401.
 * Refresh is attempted at most once per request — a repeated 401 surfaces the
 * error so callers (e.g. UI) can redirect to the login page.
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

export const authClient = {
  /**
   * Step 1 of onboarding: register the email; verify mail is sent (AUTH-16).
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
   * Step 2: redeem the verify token together with username + password; the
   * access token lands in the in-memory store.
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
    // Backend uses OAuth2PasswordRequestForm — username/password as x-www-form-urlencoded
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
