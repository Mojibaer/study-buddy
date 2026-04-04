import type {
  FiltersResponse,
  Document,
  SearchFilters,
  SearchResponse,
  UploadMetadata,
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message: string
    try {
      const error = await response.json()
      message = error.detail || error.message || response.statusText
    } catch {
      message = response.statusText
    }
    throw new Error(message)
  }
  return response.json() as Promise<T>
}

export const api = {
  // Filters
  getFilters: (): Promise<FiltersResponse> =>
    fetch(`${API_BASE_URL}/filters/all`).then(handleResponse<FiltersResponse>),

  // Search
  search: (query: string, filters: Partial<SearchFilters> = {}): Promise<SearchResponse> => {
    const params = new URLSearchParams({ query })
    if (filters.category_id) params.append('category_id', filters.category_id)
    if (filters.subject_id) params.append('subject_id', filters.subject_id)
    if (filters.semester_id) params.append('semester_id', filters.semester_id)
    if (filters.limit) params.append('limit', filters.limit.toString())
    return fetch(`${API_BASE_URL}/search/semantic?${params}`).then(handleResponse<SearchResponse>)
  },

  // Documents
  getDocuments: (filters: Partial<SearchFilters> = {}): Promise<Document[]> => {
    const params = new URLSearchParams()
    if (filters.category_id) params.append('category_id', filters.category_id)
    if (filters.subject_id) params.append('subject_id', filters.subject_id)
    if (filters.semester_id) params.append('semester_id', filters.semester_id)
    return fetch(`${API_BASE_URL}/documents/?${params}`).then(handleResponse<Document[]>)
  },

  getDocument: (id: string | number): Promise<Document> =>
    fetch(`${API_BASE_URL}/documents/${id}`).then(handleResponse<Document>),

  uploadDocument: async (file: File, metadata: UploadMetadata): Promise<Document> => {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata?.category_id) formData.append('category_id', metadata.category_id)
    if (metadata?.subject_id) formData.append('subject_id', metadata.subject_id)
    if (metadata?.tags) formData.append('tags', metadata.tags)
    return fetch(`${API_BASE_URL}/documents/upload`, { method: 'POST', body: formData }).then(handleResponse<Document>)
  },

  deleteDocument: (id: string | number): Promise<void> =>
    fetch(`${API_BASE_URL}/documents/${id}`, { method: 'DELETE' }).then(handleResponse<void>),
}
