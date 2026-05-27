import { authedFetch } from "@/lib/auth/authClient";
import type { Category, Semester, Subject } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

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

export interface ApiErrorDetail {
  reason?: string;
  subject_count?: number;
  document_count?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public detail?: ApiErrorDetail,
  ) {
    super(message);
  }
}

async function handle<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail: ApiErrorDetail | undefined;
    let message = response.statusText;
    try {
      const body = (await response.json()) as {
        detail?: string | ApiErrorDetail;
      };
      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (body.detail && typeof body.detail === "object") {
        detail = body.detail;
        message = body.detail.reason ?? response.statusText;
      }
    } catch {
      // keep statusText
    }
    throw new ApiError(message, detail);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
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
