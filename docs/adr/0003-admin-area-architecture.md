# ADR-0003: Admin Area Architecture

**Status:** Accepted
**Date:** 2026-05-29
**Issue:** ADMIN-00 - 03

## Context

Study Buddy needs an admin area to manage users, the study structure
(semesters / subjects / categories), and uploaded documents. This raises
several decisions that shape the whole feature: how admin access is gated, how
the first admin comes into existence, where the read/write boundary for shared
entities sits, and how the code is layered so it stays testable as it grows.

The auth foundation is already set by [ADR-0001](0001-jwt-storage-strategy.md):
the access token (JWT) carries only the user id in `sub`; the role is **not** in
the token. A separate `UserRole` enum (`student` | `admin`) lives on the user
row.

## Decisions

### 1. Role is read from the DB per request, never from the JWT

`require_admin = require_role(UserRole.admin)` is a FastAPI dependency that loads
the user fresh on every request (`get_current_active_user`) and checks the role.

- **Why not put the role in the JWT?** A token claim is stale until expiry (30
  min). A demotion or deactivation must take effect immediately — a fresh DB
  read guarantees that. The cost (one indexed lookup per request) is acceptable.

### 2. The admin area is guarded at the route-group layout, not per page

Frontend: the `(admin)` route group wraps its layout in
`<ProtectedRoute requireRole="admin">`. Unauthenticated users redirect to
`/login?next=…`; authenticated non-admins redirect to `/`. While auth is still
bootstrapping (`status === 'loading'`) a spinner renders and **no child mounts**.

- **Why at the layout?** One guard covers every admin page. It also fixes a race
  where admin data hooks fired their requests before the in-memory access token
  was restored — children only mount once `status === 'authenticated'`.
- The backend is the real authority (`require_admin` on every endpoint); the
  frontend guard is UX, not security.

### 3. Read/write split for shared structure entities

Semesters, subjects, and categories are read by all users (filter dropdowns) but
written only by admins. Two routers own them with a clear boundary:

| Router | Scope | Auth |
|---|---|---|
| `routes/filters.py` | **read-only** — `GET` lists for dropdowns | any active user |
| `routes/admin_structure.py` | **all mutations** + counts + cascade rules | `require_admin` |

The write endpoints that previously lived in `filters.py` were removed (they were
unused duplicates of the richer `admin_structure.py` ones).

- **Why not one router?** The read surface is needed by students on
  search/browse; the write surface is admin-only with extra validation (uniqueness
  clashes, force-delete with dependent-count checks). Splitting keeps each
  router's responsibility and auth boundary unambiguous.

### 4. First admin is bootstrapped via a script, not a self-service flow

`scripts/create_admin.py` (run via `make create-admin`) reads `ADMIN_EMAIL` /
`ADMIN_PASSWORD` / `ADMIN_USERNAME` from the environment and creates a verified,
active admin — or promotes an existing user. It is idempotent and does not
overwrite an existing password / verification.

- **Why a script?** Registration always creates `student` (and is restricted to
  `@edu.fh-joanneum.at`). There is no in-app path to admin, so the first one must
  be seeded out-of-band. A script is explicit, auditable, and re-runnable, and it
  deliberately bypasses the email-domain restriction (admins need not be students).

### 5. Last-admin protection

Demote / deactivate / delete is blocked when the target is the last active admin
(`_forbid_last_admin`), in addition to the existing self-target blocks. This
prevents locking everyone out of the admin area.

### 6. Business logic lives in a service module, routes stay thin

`admin_users.py` holds real logic (last-admin rules, session revocation,
verification resend), so it was extracted to `services/admin_user_service.py`.

- Functional style (`async def`, `db` as first arg) to match the existing
  `repositories/crud.py` / `document_service.py` — **not** a class, since there is
  no state to hold.
- The service is **HTTP-free**: locale is derived from the request header in the
  route and passed in as a plain string, so the service is unit-testable without
  FastAPI objects.
- `admin_structure.py` and `admin_documents.py` stay thin in the route layer —
  they are mostly CRUD, and a service there would be pass-through boilerplate.

### 7. One shared API-error handler on the frontend

`lib/admin/adminClient.ts` exports a single `ApiError` class and
`handleAdminResponse<T>()`, used by all three admin clients (users / structure /
documents). It preserves both a human-readable message and any structured
`detail` (e.g. `{ reason: "has_subjects", subject_count: 3 }`) so the UI can offer
force-delete flows.

- Replaces three near-duplicate `handle<T>()` helpers; only `structureClient` had
  the structured-error class before.

## Consequences

### Backend

- `routes/admin_users.py`, `admin_structure.py`, `admin_documents.py` — all
  endpoints gated by `require_admin`
- `services/admin_user_service.py` — extracted, HTTP-free, testable
- `routes/filters.py` — reduced to `GET` only
- `scripts/create_admin.py` + `make create-admin` — admin bootstrap
- Structured `409` detail dicts for cascade-blocked deletes
  (`has_subjects` / `has_documents` with counts)

### Frontend

- `(admin)` route group guarded by `ProtectedRoute requireRole="admin"`
- `lib/admin/adminClient.ts` — shared `ApiError` + `handleAdminResponse`
- client → hook → container → table layering per admin domain

### Remaining Surface / Known Gaps

- **Access tokens are not actively revoked on deactivate/delete.** Only refresh
  tokens are revoked; an existing access token stays valid until expiry (≤30 min).
  In practice the per-request `is_active` check in `get_current_active_user`
  blocks the user immediately, so this is defense-in-depth, not an open hole. A
  Redis JTI denylist on deactivation would close it explicitly.
- **No rate limiting on admin endpoints.** A compromised admin token could mass-
  delete unthrottled. Low priority (presupposes an already-compromised admin).
- **Verification resend** discloses account-existence via 404 vs 409 and is
  unthrottled — admin-only endpoint, low risk.
