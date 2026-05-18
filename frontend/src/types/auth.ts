export type UserRole = 'student' | 'admin'

export interface User {
  id: number
  email: string
  username: string | null
  role: UserRole
  is_active: boolean
  email_verified_at: string | null
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface RegisterRequest {
  email: string
}

export interface SetupRequest {
  token: string
  username: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface JwtPayload {
  sub: string
  exp: number
  iat: number
  jti: string
  type: string
  iss: string
  aud: string
}
