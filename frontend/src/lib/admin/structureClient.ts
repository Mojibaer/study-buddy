import { authedFetch } from "@/lib/auth/authClient";
import {
  API_BASE_URL,
  ApiError,
  handleAdminResponse as handle,
} from "@/lib/admin/adminClient";
import type { Category, Semester, Subject } from "@/types";

// Re-exported so existing consumers (e.g. SemestersSection) keep importing from here.
export { ApiError };
export type { ApiErrorDetail } from "@/lib/admin/adminClient";

export interface SemesterWithCounts extends Semester {
  subject_count: number;
  document_count: number;
}

export interface SubjectWithCounts extends Subject {
  document_count: number;
}

export interface CategoryWithCounts extends Category {
  document_count: number;
}

export interface StructureOverview {
  semesters: SemesterWithCounts[];
  subjects: SubjectWithCounts[];
  categories: CategoryWithCounts[];
}

export const adminStructureClient = {
  overview: (): Promise<StructureOverview> =>
    authedFetch(`${API_BASE_URL}/admin/structure/overview`).then(
      handle<StructureOverview>,
    ),

  createSemester: (name: string): Promise<Semester> =>
    authedFetch(`${API_BASE_URL}/admin/structure/semesters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).then(handle<Semester>),

  renameSemester: (id: number, name: string): Promise<Semester> =>
    authedFetch(`${API_BASE_URL}/admin/structure/semesters/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).then(handle<Semester>),

  deleteSemester: (id: number, force = false): Promise<void> =>
    authedFetch(
      `${API_BASE_URL}/admin/structure/semesters/${id}${force ? "?force=true" : ""}`,
      { method: "DELETE" },
    ).then(handle<void>),

  createSubject: (name: string, semesterId: number): Promise<Subject> =>
    authedFetch(`${API_BASE_URL}/admin/structure/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, semester_id: semesterId }),
    }).then(handle<Subject>),

  updateSubject: (
    id: number,
    body: { name?: string; semester_id?: number },
  ): Promise<Subject> =>
    authedFetch(`${API_BASE_URL}/admin/structure/subjects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle<Subject>),

  deleteSubject: (id: number): Promise<void> =>
    authedFetch(`${API_BASE_URL}/admin/structure/subjects/${id}`, {
      method: "DELETE",
    }).then(handle<void>),

  createCategory: (name: string): Promise<Category> =>
    authedFetch(`${API_BASE_URL}/admin/structure/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).then(handle<Category>),

  renameCategory: (id: number, name: string): Promise<Category> =>
    authedFetch(`${API_BASE_URL}/admin/structure/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).then(handle<Category>),

  deleteCategory: (id: number): Promise<void> =>
    authedFetch(`${API_BASE_URL}/admin/structure/categories/${id}`, {
      method: "DELETE",
    }).then(handle<void>),
};
