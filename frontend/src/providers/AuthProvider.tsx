'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { authClient, AuthError } from '@/lib/auth/authClient'
import { getAccessToken, subscribe } from '@/lib/auth/tokenStore'
import type { LoginRequest, RegisterRequest, SetupRequest, User } from '@/types/auth'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (body: LoginRequest) => Promise<void>
  register: (body: RegisterRequest) => Promise<User>
  setup: (body: SetupRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const bootstrapped = useRef(false)

  const loadUser = useCallback(async (): Promise<void> => {
    try {
      const me = await authClient.getMe()
      setUser(me)
      setStatus('authenticated')
    } catch {
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  // App-Bootstrap: einmaliger Silent Refresh über Cookie. Klappt es, ziehen wir
  // direkt /me; sonst Status auf unauthenticated.
  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true

    let cancelled = false
    void (async () => {
      const refreshed = await authClient.refresh()
      if (cancelled) return
      if (refreshed) {
        await loadUser()
      } else {
        setUser(null)
        setStatus('unauthenticated')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [loadUser])

  // Token-Wechsel aus authClient (z.B. nach login/setup) → User refreshen.
  useEffect(() => {
    return subscribe((token) => {
      if (token) {
        void loadUser()
      } else {
        setUser(null)
        setStatus('unauthenticated')
      }
    })
  }, [loadUser])

  const login = useCallback(async (body: LoginRequest): Promise<void> => {
    await authClient.login(body)
    // loadUser läuft über subscribe-Listener nach setAccessToken
  }, [])

  const register = useCallback(async (body: RegisterRequest): Promise<User> => {
    return authClient.register(body)
  }, [])

  const setup = useCallback(async (body: SetupRequest): Promise<void> => {
    await authClient.setup(body)
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authClient.logout()
    } catch (err) {
      // Logout-Fehler nicht durchreichen: lokal sind wir trotzdem ausgeloggt
      if (!(err instanceof AuthError) || err.status !== 401) {
        console.error('Logout request failed:', err)
      }
    }
  }, [])

  const refreshUser = useCallback(async (): Promise<void> => {
    if (!getAccessToken()) return
    await loadUser()
  }, [loadUser])

  return (
    <AuthContext.Provider value={{ user, status, login, register, setup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
