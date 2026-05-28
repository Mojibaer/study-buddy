import {authedFetch} from '@/lib/auth/authClient'
import {API_BASE_URL, handleAdminResponse as handle} from '@/lib/admin/adminClient'
import type {User, UserRole} from '@/types/auth'

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