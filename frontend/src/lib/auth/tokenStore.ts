import type { JwtPayload } from '@/types/auth'

let accessToken: string | null = null
let cachedPayload: JwtPayload | null = null

type Listener = (token: string | null) => void
const listeners = new Set<Listener>()

export function setAccessToken(token: string | null): void {
  accessToken = token
  cachedPayload = token ? decodePayload(token) : null
  listeners.forEach((listener) => listener(token))
}

export function getAccessToken(): string | null {
  return accessToken
}

export function clearAccessToken(): void {
  setAccessToken(null)
}

export function getTokenPayload(): JwtPayload | null {
  return cachedPayload
}

/**
 * Returns seconds until token expires. Negative if already expired, null if no token.
 */
export function getSecondsUntilExpiry(): number | null {
  if (!cachedPayload) return null
  const nowSeconds = Math.floor(Date.now() / 1000)
  return cachedPayload.exp - nowSeconds
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function decodePayload(token: string): JwtPayload | null {
  try {
    const [, payloadB64] = token.split('.')
    if (!payloadB64) return null
    const padded = payloadB64 + '='.repeat((4 - (payloadB64.length % 4)) % 4)
    const json = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}
