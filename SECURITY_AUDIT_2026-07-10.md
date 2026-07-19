# Security Audit — Hamvatan Platform
Date: 2026-07-10
Scope: `backend/` (NestJS + Prisma + PostgreSQL + Redis) and `frontend/` (Next.js 14)

## Summary

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 (1 fixed) |
| Medium | 4 |
| Low / Informational | 3 |
| Coverage gap (couldn't verify) | 1 |

No leaked secrets, hardcoded credentials, or SQL-injection patterns were found. Prisma's query builder is used throughout (no raw string-concatenated SQL), and React's default JSX escaping is used everywhere (no `dangerouslySetInnerHTML`/`innerHTML` found), which rules out the two most common injection classes for this stack. The findings below are about upload validation, session/token lifecycle, and dependency versions.

---

## High

### H1 — File upload type validation is spoofable, and stored files keep the attacker-controlled extension — ✅ FIXED 2026-07-10
**Files:** `backend/src/common/utils/file-upload.util.ts`, `backend/src/modules/storage/storage.service.ts`, `backend/src/modules/storage/storage-port.interface.ts`, `backend/src/modules/properties/properties.service.ts`, `backend/src/modules/admin-service-requests/admin-service-requests.service.ts` — reachable via `POST /admin-service-requests` (public, unauthenticated) and `POST /properties/:id/images` (admin)

`imageFileFilter`/`documentFileFilter` only checked `file.mimetype` — the `Content-Type` value the *client* declares in the multipart request, not the actual file bytes. Anyone sending a raw HTTP request (not just a browser form) could label any file as `image/jpeg` regardless of its real content. Meanwhile `StorageService.upload()` derived the saved file's extension from `extname(file.originalname)` — also fully attacker-controlled.

**Failure scenario:** An anonymous visitor submits the public "بررسی رایگان مدارک" form with a document named `x.svg` and `Content-Type: image/jpeg`. The filter accepted it (declared type matched the whitelist), and it was saved/served as `<uuid>.svg`. An SVG can contain `<script>`. If that URL was ever opened directly in a browser tab (not just embedded via `<img>`), the script would execute in that origin's context — a stored-XSS-via-upload path, on an endpoint that requires no login.

**Fix applied:**
- Added `detectFileType()` in `file-upload.util.ts` — sniffs the real magic bytes (JPEG `FF D8 FF`, PNG `89 50 4E 47...`, PDF `%PDF-`) instead of trusting the declared `Content-Type`.
- `assertRealImageType()` / `assertRealDocumentType()` throw `BadRequestException` unless the actual bytes match an allowed type — called in `properties.service.ts#addImage` and `admin-service-requests.service.ts#create`, after the buffer is fully received (multer's `fileFilter` runs before the body is read, so it can only ever see the declared type — the real check has to happen after upload completes).
- `UploadableFile.extension` replaces `originalname` — the stored file's extension now always comes from the validated detection (`.jpg`/`.png`/`.pdf` only), never from the client-supplied filename. SVG (and everything else) can no longer end up as a stored extension.
- File size limits were already enforced (`IMAGE_MAX_SIZE_BYTES`/`DOCUMENT_MAX_SIZE_BYTES` = 10MB via multer `limits`) — unchanged, already adequate.
- Verified end-to-end: an SVG containing `<script>alert(document.cookie)</script>` sent with a spoofed `Content-Type: image/jpeg` header was rejected with `400` ("فقط فایل‌های JPEG یا PNG مجاز هستند."). Full backend test suite (73 tests) passes, including new tests covering the spoofed-mimetype rejection case.

### H2 — Frontend dependency: Next.js 14.2.35 has multiple known high-severity advisories
**File:** `frontend/package.json`

`npm audit` (ran successfully for frontend) reports 5 advisories against the installed `next@14.2.35`, several rated **high**: SSRF via WebSocket upgrades (GHSA-c4j6-fc7j-m34r), DoS with Server Components (GHSA-q4gf-8mx6-v5v3, GHSA-8h8q-6873-q5fj), and a Middleware/Proxy bypass in Pages Router apps using i18n (GHSA-36qx-fr4f-26g5), plus several moderate ones (cache poisoning, XSS via CSP-nonce handling). npm's suggested fix is Next `16.2.10` (a major-version jump); check release notes for a smaller in-place patch on the 14.x line first since 16 will require a compat pass.

`eslint-config-next`, `@next/eslint-plugin-next`, and `postcss` are flagged only as transitive fallout of the Next.js version and will resolve once Next is upgraded.

**Fix:** Plan a Next.js upgrade (test the admin panel + middleware auth redirect afterward, since that's the area GHSA-36qx-fr4f-26g5 concerns — though this app doesn't use i18n routing, so exposure there is likely low).

---

## Medium

### M1 — No JWT revocation: role/active-status changes don't take effect until the token naturally expires
**Files:** `backend/src/modules/auth/strategies/jwt.strategy.ts`, `backend/src/common/guards/roles.guard.ts`

`RolesGuard` checks `user.role`, which comes straight from the JWT's `role` claim — never re-checked against the database per-request. `JWT_EXPIRES_IN=7d`. So if an admin demotes a STAFF account, deactivates a compromised user, or revokes admin access, anyone already holding a valid token for that account keeps their *old* permissions for up to 7 days.

**Fix:** Either shorten token lifetime significantly for an app with an admin panel, or add a lightweight revocation check (e.g., store a `tokenVersion`/`isActive` flag looked up from Redis or the DB on each request, bump it on role change/deactivation).

### M2 — Auth token stored in a non-httpOnly, non-Secure cookie
**File:** `frontend/lib/auth.ts`

```
document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
```
No `HttpOnly` (required, since the code reads it back via `document.cookie` for client-side role checks) and no `Secure` flag. No current XSS vector was found in this codebase (see summary above), so this isn't actively exploitable today — but it means *any* future XSS anywhere in the app (a rich-text field added later, a third-party script, etc.) is an instant full account/admin takeover, with no defense-in-depth layer to fall back on.

**Fix (longer-term):** Move to an httpOnly cookie set by the backend, with role/user info fetched via an authenticated endpoint instead of decoded client-side. Shorter-term: at minimum add `Secure` once the site is served over HTTPS.

### M3 — `docker-compose.yml` binds Postgres/Redis to all network interfaces with weak hardcoded credentials
**File:** `backend/docker-compose.yml`

```yaml
ports:
  - '5433:5432'   # postgres — esmaeili / pass
  - '6380:6379'   # redis, no password
```
Fine for local development on a laptop (nothing else can reach it). But if this compose file is ever run as-is on a server with a public IP (rather than Railway's managed DB, which the user is moving to), both services would be reachable from the internet with trivial/no credentials.

**Fix:** Not urgent given the Railway deployment plan, but if this ever runs on a bare VPS, bind to `127.0.0.1:5433:5432` instead and use real generated passwords.

### M4 — Backend `npm audit` could not be completed (coverage gap, not a clean bill of health)
The sandbox's network access reset consistently on the backend's dependency-advisory request (frontend's smaller request succeeded). **This is an unknown, not a "no vulnerabilities found."** Please run `npm audit` inside `backend/` yourself (or in CI) before treating the backend dependency tree as reviewed.

---

## Low / Informational

### L1 — The fixed dev-OTP bypass (`11111`) is a full auth bypass, by design, currently left on for the Railway demo
**File:** `backend/src/modules/auth/auth.service.ts`

Active whenever `SMS_PROVIDER=mock` and `NODE_ENV !== 'production'`. This was a deliberate decision (confirmed with the user) so the demo deployment's admin panel can be shown without a real SMS provider — but it means **anyone who knows the admin's mobile number can log in as admin with code `11111`** on that public link. Flagging here as a standing reminder: this must be disabled (`NODE_ENV=production`, or a real SMS provider wired up) before this is ever a real customer-facing launch, not just a demo.

### L2 — No content-length/rate limits observed to be an issue elsewhere
Global `ThrottlerGuard` (Redis-backed, survives restarts) plus per-mobile OTP request/verify-attempt limits in `AuthService` are solid — called out here as a positive, not a gap.

### L3 — CSP/helmet defaults look reasonable
`helmet()` is applied with defaults (confirmed via response headers in earlier testing) and CORS is scoped to a specific `CORS_ORIGIN`, not a wildcard. No action needed.

---

## What was checked and came back clean
- No secrets/API keys/private keys found in tracked files or git history (only one commit exists so far; `.env` files are correctly gitignored, only `.env.example` templates are tracked).
- No SQL injection patterns (Prisma used throughout, no raw queries found).
- No `eval`/`dangerouslySetInnerHTML`/`innerHTML` usage in the frontend.
- OTP flow: timing-safe code comparison, per-mobile rate limits on both request and verify, `isActive` checked at login.
- Error responses don't leak stack traces (generic Persian message on 500s; real stack only goes to server logs).
- Public case-tracking endpoint intentionally omits contact mobile/documents from its response, and tracking codes have enough entropy (32 bits) combined with global rate limiting to resist brute-forcing.

## Suggested priority order
1. ~~H1 (file upload validation)~~ — done, see fix note above.
2. Re-run backend `npm audit` outside this sandbox (M4) to close the coverage gap, then address whatever it finds alongside H2.
3. M1/M2 if/when this becomes a real production deployment (not just the current demo).
4. L1 — remember to flip off before any real launch.
