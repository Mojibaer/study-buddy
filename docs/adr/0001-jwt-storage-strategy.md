# ADR-0001: JWT Storage Strategy

**Status:** Accepted
**Date:** 2026-05-18
**Issue:** AUTH-15

## Context

Das Backend gibt nach erfolgreichem Login zwei Tokens aus:

- **Access Token** (JWT, HS256, 30 min TTL) — wird bei jedem API-Call mitgeschickt
- **Refresh Token** (opaque, 7 Tage TTL) — wird verwendet um neue Access Tokens auszustellen

Aktuell werden beide als JSON-Body zurückgegeben (`TokenResponse`). Wo das Frontend (Next.js 16 SPA) sie speichert, ist noch nicht entschieden. Die Wahl bestimmt die Angriffsfläche für XSS und CSRF.

### Threat Model

- **XSS** — jede npm-Dependency, jedes user-generated Content Feld kann Schadcode injizieren. In einer modernen SPA mit dutzenden Dependencies ist XSS realistisch.
- **CSRF** — Angreifer-Website triggert einen authentifizierten Request vom Browser des Opfers. Mit modernen Browser-Defaults (`SameSite=Lax`) und korrekter Cookie-Config gut zu mitigieren.

### Optionen

| Option | Beschreibung | XSS | CSRF |
|---|---|---|---|
| **A** | beide Tokens in `localStorage` | ❌ beide stehlbar via XSS, 7-Tage-Persistenz | ✅ kein Cookie-Flow |
| **B** | beide Tokens in HttpOnly Cookies | ✅ JS hat keinen Zugriff | ⚠️ mitigierbar mit SameSite+CSRF-Token, aber erzwingt Cookie-Flow für jeden API-Call |
| **C** | **Hybrid:** Refresh in HttpOnly Cookie, Access in Memory | ✅ Refresh sicher, Access nur 30-min XSS-Fenster | ✅ Cookie nur für `/auth/refresh`, Strict möglich |

## Decision

**Option C — Hybrid.**

- **Refresh Token** → HttpOnly Cookie mit `Secure; SameSite=Strict; Path=/api/auth; Max-Age=604800`
- **Access Token** → JavaScript Module-Variable im Frontend (nicht `localStorage`, nicht `sessionStorage`, nicht `useState`)

> **Cookie-Path-Hinweis:** Der Cookie ist auf `/api/auth` gescoped (nicht nur `/api/auth/refresh`), damit er auch beim `POST /api/auth/logout` mitgeschickt wird. Dort muss das Backend ihn löschen können. Damit ist die CSRF-Angriffsfläche minimal größer als bei einem reinen `/refresh`-Scope — durch `SameSite=Strict` in Production aber weiterhin geschlossen.

### Begründung

1. Ein 7-Tage-Refresh-Token in `localStorage` ist unverteidigbar — jeder XSS-Treffer öffnet ein 7-Tage-Persistenz-Fenster für den Angreifer.
2. Cookie-Flow für **jeden** API-Call (Option B) erzwingt CORS `allow_credentials=True` und CSRF-Token überall — die Komplexität bringt keinen Mehrwert gegenüber Bearer Tokens im Header für den Access Token.
3. Der Refresh-Token-Cookie ist auf `Path=/auth/refresh` beschränkt — er wird nicht bei jedem Request mitgeschickt, sondern nur beim Refresh-Endpoint. Damit ist die CSRF-Angriffsfläche minimal.
4. `SameSite=Strict` ist nutzbar, weil Frontend und Backend in Production unter derselben Parent-Domain liegen (`app.studybuddy.at` ↔ `api.studybuddy.at`).
5. Access Token in Memory bedeutet: nach Tab-Close / Browser-Restart ist er weg. Beim nächsten App-Load wird via Silent Refresh ein neuer ausgestellt (Refresh Cookie wird automatisch mitgeschickt).

## Consequences

### Backend (`app/routes/auth.py`) — **umgesetzt**

- `POST /auth/login` — Access Token im JSON-Body, Refresh Token als `Set-Cookie`
- `POST /auth/setup` — analog
- `POST /auth/refresh` — Refresh Token aus Cookie lesen (nicht aus Body/Query), Cookie rotieren
- `POST /auth/logout` — Cookie löschen via `delete_cookie`; Access-Token-JTI denylisten ist offen → AUTH-11
- `TokenResponse` Schema — `refresh_token` Feld entfernt (kommt nur noch via Cookie)
- Cookie-Settings via `settings.REFRESH_COOKIE_*` in `app/core/config.py` (Dev-Defaults: `SameSite=lax`, `Secure=false`; in Production via `.env` auf `strict` und `true` setzen)
- CORS-Config — `allow_credentials=True` bereits gesetzt in `main.py`

### Frontend (Next.js 16, kommt mit AUTH-07)

- Access Token in Module-Variable (z.B. `lib/auth/tokenStore.ts`), niemals Persistenz
- `fetch`/`axios` mit `credentials: "include"` für `/auth/refresh` und `/auth/logout`
- App-Load Hook: Silent Refresh vor erstem geschützten Request
- 401-Interceptor: einmaliger Refresh-Versuch, dann Redirect auf `/login`
- Login-Form: erhält Access Token aus Response Body, persistiert nichts selbst

### Dev-Setup

- Frontend `localhost:3000`, Backend `localhost:8000` — Cookie funktioniert mit `SameSite=Lax` im Dev (Same-Site via `localhost`)
- In Production: `SameSite=Strict`, weil beide Subdomains der gleichen Site sind

### Verbleibende Angriffsfläche

- **CSRF auf `/auth/refresh`** falls `SameSite` jemals auf `Lax`/`None` gelockert wird (z.B. für mobile Clients) → CSRF-Token nachrüsten
- **XSS-Diebstahl des Access Tokens** im 30-Minuten-Fenster → CSP-Header, Trusted Types, Dependency-Audits
- **Subdomain-Takeover** auf `*.studybuddy.at` würde Cookie-Diebstahl trotz HttpOnly ermöglichen → DNS und Subdomain-Management dokumentieren
- **Silent-Refresh-Race** beim App-Load → Loading-State, keine geschützten Requests vor erstem Refresh
