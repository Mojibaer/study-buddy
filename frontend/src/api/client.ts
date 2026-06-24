import type {
  FiltersResponse,
  Document,
  SearchFilters,
  SearchResponse,
  UploadMetadata,
  BookmarkListResponse,
} from '@/types'
import { authedFetch } from '@/lib/auth/authClient'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export interface SimilarDocument {
  id: number
  original_filename: string
  subject: string | null
  score: number
}

export type BulkUploadItemStatus = 'uploaded' | 'plagiarism' | 'rate_limited' | 'error'

export interface BulkUploadItemResult {
  filename: string
  status: BulkUploadItemStatus
  document?: Document | null
  similar_document?: SimilarDocument | null
  message?: string | null
}

export interface BulkUploadResponse {
  results: BulkUploadItemResult[]
  uploaded: number
  failed: number
}

export class ApiError extends Error {
  status: number
  /** Set when the backend returns a structured `detail` object (e.g. plagiarism). */
  code?: string
  similarDocument?: SimilarDocument

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = response.statusText
    let detail: unknown
    try {
      const body = await response.json()
      detail = body.detail ?? body.message
    } catch {
      detail = undefined
    }

    const error = new ApiError(message, response.status)
    if (typeof detail === 'string') {
      error.message = detail
    } else if (detail && typeof detail === 'object') {
      const d = detail as Record<string, unknown>
      if (typeof d.message === 'string') error.message = d.message
      if (typeof d.code === 'string') error.code = d.code
      if (d.similar_document) error.similarDocument = d.similar_document as SimilarDocument
    }
    throw error
  }
  return response.json() as Promise<T>
}

export const api = {
  // Filters
  getFilters: (): Promise<FiltersResponse> =>
    authedFetch(`${API_BASE_URL}/filters/all`).then(handleResponse<FiltersResponse>),

  // Search
  search: (query: string, filters: Partial<SearchFilters> = {}): Promise<SearchResponse> => {
    const params = new URLSearchParams({ query })
    if (filters.category_id) params.append('category_id', filters.category_id)
    if (filters.subject_id) params.append('subject_id', filters.subject_id)
    if (filters.semester_id) params.append('semester_id', filters.semester_id)
    if (filters.limit) params.append('limit', filters.limit.toString())
    return authedFetch(`${API_BASE_URL}/search/semantic?${params}`).then(handleResponse<SearchResponse>)
  },

  // Documents
  getDocuments: (filters: Partial<SearchFilters> = {}): Promise<Document[]> => {
    const params = new URLSearchParams()
    if (filters.category_id) params.append('category_id', filters.category_id)
    if (filters.subject_id) params.append('subject_id', filters.subject_id)
    if (filters.semester_id) params.append('semester_id', filters.semester_id)
    return authedFetch(`${API_BASE_URL}/documents/?${params}`).then(handleResponse<Document[]>)
  },

  getDocument: (id: string | number): Promise<Document> =>
    authedFetch(`${API_BASE_URL}/documents/${id}`).then(handleResponse<Document>),

  uploadDocument: async (file: File, metadata: UploadMetadata): Promise<Document> => {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata?.category_id) formData.append('category_id', metadata.category_id)
    if (metadata?.subject_id) formData.append('subject_id', metadata.subject_id)
    return authedFetch(`${API_BASE_URL}/documents/upload`, { method: 'POST', body: formData }).then(handleResponse<Document>)
  },

  uploadDocumentsBulk: async (files: File[], metadata: UploadMetadata): Promise<BulkUploadResponse> => {
    const formData = new FormData()
    for (const file of files) formData.append('files', file)
    if (metadata?.category_id) formData.append('category_id', metadata.category_id)
    if (metadata?.subject_id) formData.append('subject_id', metadata.subject_id)
    return authedFetch(`${API_BASE_URL}/documents/upload/bulk`, { method: 'POST', body: formData }).then(
      handleResponse<BulkUploadResponse>,
    )
  },

  deleteDocument: (id: string | number): Promise<void> =>
    authedFetch(`${API_BASE_URL}/documents/${id}`, { method: 'DELETE' }).then(handleResponse<void>),

  // Bookmarks
  getBookmarks: (): Promise<BookmarkListResponse> =>
    authedFetch(`${API_BASE_URL}/bookmarks`).then(handleResponse<BookmarkListResponse>),

  addBookmark: (id: number): Promise<void> =>
    authedFetch(`${API_BASE_URL}/bookmarks/${id}`, { method: 'POST' }).then(handleResponse<void>),

  removeBookmark: (id: number): Promise<void> =>
    authedFetch(`${API_BASE_URL}/bookmarks/${id}`, { method: 'DELETE' }).then(handleResponse<void>),
}
