import { authedFetch } from '@/lib/auth/authClient'
import { API_BASE_URL, handleAdminResponse as handle } from '@/lib/admin/adminClient'

export interface UploadActivityPoint {
    date: string
    count: number
}

export interface SubjectCoverage {
    subject_id: number
    subject_name: string
    semester_name: string
    document_count: number
}

export interface AnalyticsOverview {
    total_documents: number
    total_users: number
    total_storage_bytes: number
    upload_activity: UploadActivityPoint[]
    subject_coverage: SubjectCoverage[]
}

export const adminAnalyticsClient = {
    overview: (): Promise<AnalyticsOverview> =>
        authedFetch(`${API_BASE_URL}/admin/analytics/overview`).then(handle<AnalyticsOverview>),
}