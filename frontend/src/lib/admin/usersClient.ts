import {authedFetch} from '@/lib/auth/authClient'
import type {User, UserRole} from '@/types/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export interface AdminUsersFilter {
    role?: UserRole
    is_active?: boolean
    is_verified?: boolean
    search?: string
}

export interface AdminUserUpdate {
    role?: UserRole
    is_active?: boolean
}

async function handle<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let message: string
        try {
            const body = (await response.json()) as { detail?: string; message?: string }
            message = body.detail || body.message || response.statusText
        } catch {
            message = response.statusText
        }
        throw new Error(message)
    }
    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
}

function buildQuery(filter: AdminUsersFilter): string {
    const params = new URLSearchParams()
    if (filter.role) params.set('role', filter.role)
    if (filter.is_active !== undefined) params.set('is_active', String(filter.is_active))
    if (filter.is_verified !== undefined) params.set('is_verified', String(filter.is_verified))
    if (filter.search) params.set('search', filter.search)
    const qs = params.toString()
    return qs ? `?${qs}` : ''
}

export const adminUsersClient = {
    list: (filter: AdminUsersFilter = {}): Promise<User[]> =>
        authedFetch(`${API_BASE_URL}/admin/users${buildQuery(filter)}`).then(handle<User[]>),

    update: (id: number, body: AdminUserUpdate): Promise<User> =>
        authedFetch(`${API_BASE_URL}/admin/users/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        }).then(handle<User>),

    resendVerification: (id: number): Promise<User> =>
        authedFetch(`${API_BASE_URL}/admin/users/${id}/resend-verification`, {
            method: 'POST',
        }).then(handle<User>),

    remove: (id: number): Promise<void> =>
        authedFetch(`${API_BASE_URL}/admin/users/${id}`, {method: 'DELETE'}).then(handle<void>),
}