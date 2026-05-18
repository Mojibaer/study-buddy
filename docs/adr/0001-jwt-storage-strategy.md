# ADR-0001: JWT Storage Strategy

**Status:** Accepted
**Date:** 2026-05-18
**Issue:** AUTH-15

## Context

After login the backend issues two tokens:

- **Access Token** (JWT, HS256, 30 min TTL) — sent with every API call
- **Refresh Token** (opaque random string, 7 day TTL) — exchanged for new access tokens

The question: where does the frontend store them? The decision determines the XSS and CSRF attack surface.

### Threat Model

- **XSS** — any npm dependency, any user-generated content field can inject malicious JS. In a modern SPA with dozens of dependencies, XSS is realistic.
- **CSRF** — an attacker-controlled site triggers an authenticated request from the victim's browser. Mitigatable with `SameSite=Strict` cookies plus optional CSRF tokens.

### Options

| Option | Description | XSS | CSRF |
|---|---|---|---|
| **A** | both tokens in `localStorage` | ❌ both stealable via XSS, 7-day persistence | ✅ no cookie flow |
| **B** | both tokens in HttpOnly cookies | ✅ JS has no access | ⚠️ mitigatable with SameSite+CSRF token but forces cookie flow on every API call |
| **C** | **Hybrid:** refresh in HttpOnly cookie, access in memory | ✅ refresh safe, access only 30-min XSS window | ✅ cookie only on `/auth/*`, Strict possible |

## Decision

**Option C — Hybrid.**

- **Refresh Token** → HttpOnly cookie with `Secure; SameSite=Strict; Path=/api/auth; Max-Age=604800`
- **Access Token** → JavaScript module variable in the frontend (not `localStorage`, not `sessionStorage`, not `useState`)

> **Cookie path:** The cookie is scoped to `/api/auth` (not just `/api/auth/refresh`) so it's also sent on `POST /api/auth/logout` — the backend needs it there to delete and denylist. The CSRF surface is minimally larger than a strict `/refresh`-only scope but stays closed with `SameSite=Strict` in production.

### Rationale

1. A 7-day refresh token in `localStorage` is indefensible — any XSS hit opens a 7-day persistence window.
2. Cookies for **every** API call (Option B) forces CORS `allow_credentials=True` plus CSRF tokens everywhere — complexity without benefit over a Bearer header for the access token.
3. The refresh cookie is restricted to `Path=/api/auth` — it's not sent on every request, only when refreshing or logging out. CSRF surface is minimal.
4. `SameSite=Strict` is usable because frontend and backend share the same domain in production (`studybuddy.mojiverse.at`).
5. Access token in memory: gone after tab close or reload. App load fires a silent refresh; the refresh cookie auto-restores the session.

## Consequences

### Backend (`app/routes/auth.py`)

- `POST /auth/login` — access token in JSON body, refresh token as `Set-Cookie`
- `POST /auth/setup` — same
- `POST /auth/refresh` — reads refresh token from cookie (not body/query), rotates the cookie
- `POST /auth/logout` — denylists access token JTI (AUTH-11), revokes refresh tokens in DB, clears the cookie
- `TokenResponse` schema — no `refresh_token` field; it lives in the cookie
- Cookie settings via `settings.REFRESH_COOKIE_*` in `app/core/config.py` — dev defaults: `SameSite=lax`, `Secure=false`; production overrides to `strict` and `true` via `.env`
- CORS — `allow_credentials=True` set in `main.py`

### Frontend (Next.js 16)

- Access token in `lib/auth/tokenStore.ts` module variable; never persisted
- `fetch` with `credentials: "include"` on `/auth/refresh` and `/auth/logout`
- App-load hook (`AuthProvider`) runs silent refresh before the first protected request
- 401 interceptor: one refresh attempt, then redirect to `/login`
- Login form: receives access token from response body; persists nothing itself

### Dev Setup

- Frontend `localhost:3000`, backend `localhost:8001` — cookie works with `SameSite=Lax` (both are same-site under `localhost`)
- Production: `SameSite=Strict`, both apps on `studybuddy.mojiverse.at`

### Remaining Attack Surface

- **CSRF on `/auth/refresh`** if `SameSite` is ever relaxed to `Lax`/`None` (e.g. for mobile clients) → add a CSRF token
- **XSS theft of the access token** within its 30-minute window → CSP headers, Trusted Types, dependency audits
- **Subdomain takeover** would allow cookie theft despite HttpOnly → document DNS and subdomain management
- **Silent-refresh race on app load** → loading state, no protected requests before the first refresh resolves
