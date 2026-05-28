import { authedFetch } from "@/lib/auth/authClient";
import {
  API_BASE_URL,
  handleAdminResponse as handle,
} from "@/lib/admin/adminClient";
import type { Category, Subject } from "@/types";
import type { User } from "@/types/auth";

export interface AdminDocument {
  id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  file_url: string | null;
  subject_id: number;
  category_id: number;
  uploaded_by: number | null;
  uploader: User | null;
  subject: Subject;
  category: Category;
  vectorized_at: string | null;
  indexed_in_weaviate: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface AdminDocumentsFilter {
  semester_id?: number;
  subject_id?: number;
  category_id?: number;
  uploader_id?: number;
  orphaned?: boolean;
  indexed?: boolean;
  search?: string;
}

export interface AdminDocumentUpdate {
  subject_id?: number;
  category_id?: number;
}

export interface BulkDeleteResponse {
  deleted: number[];
  not_found: number[];
}

function buildQuery(filter: AdminDocumentsFilter): string {
  const params = new URLSearchParams();
  if (filter.semester_id !== undefined)
    params.set("semester_id", String(filter.semester_id));
  if (filter.subject_id !== undefined)
    params.set("subject_id", String(filter.subject_id));
  if (filter.category_id !== undefined)
    params.set("category_id", String(filter.category_id));
  if (filter.uploader_id !== undefined)
    params.set("uploader_id", String(filter.uploader_id));
  if (filter.orphaned !== undefined)
    params.set("orphaned", String(filter.orphaned));
  if (filter.indexed !== undefined)
    params.set("indexed", String(filter.indexed));
  if (filter.search) params.set("search", filter.search);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const adminDocumentsClient = {
  list: (filter: AdminDocumentsFilter = {}): Promise<AdminDocument[]> =>
    authedFetch(`${API_BASE_URL}/admin/documents${buildQuery(filter)}`).then(
      handle<AdminDocument[]>,
    ),

  get: (id: number): Promise<AdminDocument> =>
    authedFetch(`${API_BASE_URL}/admin/documents/${id}`).then(
      handle<AdminDocument>,
    ),

  update: (id: number, body: AdminDocumentUpdate): Promise<AdminDocument> =>
    authedFetch(`${API_BASE_URL}/admin/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle<AdminDocument>),

  remove: (id: number): Promise<void> =>
    authedFetch(`${API_BASE_URL}/admin/documents/${id}`, {
      method: "DELETE",
    }).then(handle<void>),

  bulkDelete: (ids: number[]): Promise<BulkDeleteResponse> =>
    authedFetch(`${API_BASE_URL}/admin/documents/bulk-delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    }).then(handle<BulkDeleteResponse>),
};
