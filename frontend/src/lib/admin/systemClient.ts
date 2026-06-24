import { authedFetch } from '@/lib/auth/authClient'
import { API_BASE_URL, handleAdminResponse as handle } from '@/lib/admin/adminClient'

export interface ServiceStatus {
    name: string
    status: 'up' | 'down'
    detail: string | null
}

export interface DocumentSync {
    postgres_documents: number
    weaviate_documents: number | null
    unindexed_documents: number
    in_sync: boolean
}

export interface StuckAccount {
    id: number
    email: string
    created_at: string
}

export interface SystemHealth {
    services: ServiceStatus[]
    document_sync: DocumentSync
    stuck_unverified_accounts: StuckAccount[]
}

export const adminSystemClient = {
    health: (): Promise<SystemHealth> =>
        authedFetch(`${API_BASE_URL}/admin/system/health`).then(handle<SystemHealth>),
}
