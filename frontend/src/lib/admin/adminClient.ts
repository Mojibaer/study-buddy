export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

/**
 * Structured error payload some admin endpoints return as `detail`, e.g.
 * `{ reason: "has_subjects", subject_count: 3 }`. Lets the UI offer a
 * force-delete flow instead of just showing a string.
 */
export interface ApiErrorDetail {
  reason?: string;
  subject_count?: number;
  document_count?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public detail?: ApiErrorDetail,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Shared response handler for all admin API clients. Unwraps JSON, treats 204
 * as void, and turns non-OK responses into an {@link ApiError} that preserves
 * both a human-readable message and any structured `detail` from the backend.
 */
export async function handleAdminResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail: ApiErrorDetail | undefined;
    let message = response.statusText;
    try {
      const body = (await response.json()) as {
        detail?: string | ApiErrorDetail;
        message?: string;
      };
      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (body.detail && typeof body.detail === "object") {
        detail = body.detail;
        message = body.detail.reason ?? response.statusText;
      } else if (body.message) {
        message = body.message;
      }
    } catch {
      // keep statusText
    }
    throw new ApiError(message, detail, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
