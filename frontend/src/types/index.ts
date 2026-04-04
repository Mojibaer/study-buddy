// --- Filter entities ---

export interface Semester {
  id: number
  name: string
}

export interface Subject {
  id: number
  name: string
  semester_id: number
  semester?: Semester
}

export interface Category {
  id: number
  name: string
}

export interface FiltersResponse {
  semesters: Semester[]
  subjects: Subject[]
  categories: Category[]
}

// --- Document ---

export interface Document {
  id: number
  filename: string
  original_filename?: string
  file_url?: string
  file_size?: number
  created_at?: string
  tags?: string[]
  category_id?: number
  subject_id?: number
  category?: Category
  subject?: Subject
}

// --- Search ---

export interface SearchFilters {
  semester_id: string | null
  subject_id: string | null
  category_id: string | null
  limit?: number
}

export interface SearchResult {
  document: Document
  distance: number
}

export interface SearchResponse {
  query: string
  total_results: number
  results: SearchResult[]
}

// --- Upload ---

export interface UploadMetadata {
  category_id: string | null
  subject_id: string | null
  tags: string | null
}

// --- Breadcrumb ---

export interface BreadcrumbItem {
  label: string
  href: string
}

// --- FolderList item ---

export interface FolderItem {
  key: number | string
  label: string
  href: string
  count?: number
}
