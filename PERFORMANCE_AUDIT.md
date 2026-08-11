# ScholaOne LMS — Performance Audit

**Date:** 2026-08-11  
**Frontend:** `EduNexus_Web` (React 19 + Vite 8 + TanStack Query)  
**Backend:** `EduNexus_Backend` (Django REST + PostgreSQL + Redis)  
**Staging API:** `https://scholaonebackend-staging.up.railway.app`

---

## Current Architecture

| Layer | Stack |
|-------|--------|
| UI | React 19, React Router, Tailwind, Framer Motion, Recharts |
| State | AuthContext, TenantContext, UIContext, TanStack Query |
| API | Axios (`axiosInstance`), JWT Bearer + optional `X-Tenant-ID` |
| Auth storage | `localStorage` / `sessionStorage` via `authSession.js` |
| Backend | Django REST, SimpleJWT, session/device tracking, Redis cache |

---

## Login Flow (Actual)

```
LoginPage.onSubmit
  → AuthContext.login()
  → POST /api/auth/login/                    [BLOCKS submit button]
  → persistAuthSession + setAuthHandlers
  → queryClient.clear()
  → setState(authenticated)                    [immediate — no longer waits for dashboard]
  → notifyAuthSync(LOGIN)
  → void prefetchPostLoginData()               [background: dashboard + menus in parallel]
  → navigate('/dashboard')
  → ProtectedRoute (isHydrated && isAuthenticated)
  → DashboardLayout (Sidebar + Header + Outlet)
  → Dashboard useQuery (cache hit if prefetch finished; else fetch + skeleton UI)
  → Sidebar menus useQuery (parallel, cache hit if prefetched)
  → Header notifications (deferred 1.5s)
```

### Backend login sequence (successful)

1. `UserRepository.resolve_login_identifier` — SELECT user (`select_related organization, school`)
2. `DeviceService.assert_not_blocked` — SELECT device
3. `check_password` — CPU only
4. `SessionService.create_login_session` — INSERT session
5. `DeviceService.record_device` — UPSERT device + optional user UPDATE
6. `record_successful_login` — UPDATE user + audit on_commit (single audit row after fix)
7. JWT mint + bind refresh JTI — UPDATE session
8. `UserSerializer` — includes `school_name`, `organization_name` (no extra API needed)

---

## Authentication Hydration Flow (App Start)

```
bootstrapStoredSession()
  ├─ Valid access token → render immediately (isHydrated: true)
  ├─ Expired access + refresh token → isHydrated: false, "Restoring session…"
  │     → hydrateAuthSession() → POST /api/auth/refresh/ OR use stored access
  │     → setState + prefetchPostLoginData (background)
  └─ No session → login/public routes
```

---

## Dashboard Flow

| Role | Primary API | Cache |
|------|-------------|-------|
| Super admin | `GET /api/v1/dashboard/super-admin/` | Redis 90s (added) |
| School admin | `GET /api/v1/dashboard/school-admin/` | Redis 90s (existing) |
| Other roles | None | — |

Dashboard UI: shell + banner + stat skeletons immediately; charts/lists fill when query resolves.

---

## Measured Timings (Before Optimization)

| Metric | Before | Notes |
|--------|--------|-------|
| Login API TTFB (invalid creds, staging) | **~588 ms** | `curl` POST to staging, 2026-08-11 |
| Login API total (invalid creds) | **~588 ms** | Same request |
| Login → Dashboard shell | **Blocked by prefetch** | Prior code `await prefetchPostLoginData` |
| Dashboard API (super admin) | Not measured | Requires authenticated token |
| Dashboard API (school admin) | Not measured | Requires authenticated token |
| Initial JS bundle (production build) | **2,560 KB** (694 KB gzip) | Single monolithic chunk |
| Main entry chunk after split | **448 KB** (103 KB gzip) | `index-*.js` after manualChunks |
| Initial critical JS (entry + react + query) | **~633 KB** (~161 KB gzip) | Down ~75% from monolith |
| Duplicate login audit rows | **2 per login** | Fixed: removed duplicate `AuditLogger.login` |

## Measured Timings (After Optimization — Partial)

| Metric | After | Notes |
|--------|-------|-------|
| Login API TTFB | Not re-measured | Backend fixes require deploy |
| Login → Dashboard shell | **Immediate after login API** | Prefetch non-blocking |
| Initial JS bundle | **448 KB entry** + lazy modules | manualChunks — see build output |
| Super-admin dashboard DB queries | **~0 on cache hit** | Redis 90s TTL |
| School dashboard schema probe | **Cached 24h** | Was per cache-miss |

---

## API Waterfall (School Admin — After Fix)

```
T+0ms     POST /auth/login/          (sequential — required)
T+login   Navigate → dashboard shell visible
T+login   GET dashboard + GET menus   (parallel, background prefetch + useQuery dedupe)
T+1500ms  GET notifications/unread    (deferred)
```

---

## Duplicate Requests Identified

| Issue | Severity | Status |
|-------|----------|--------|
| Login blocked on dashboard+menus prefetch | CRITICAL | **Fixed** — fire-and-forget after setState |
| Duplicate login audit INSERT | CRITICAL | **Fixed** — backend |
| Dashboard + menus duplicate on mount | LOW | React Query dedupes same queryKey |
| Dual JWT refresh paths (axios vs authSession) | HIGH | **Partial** — refresh token fallback in axios |
| No prefetch on session hydrate | HIGH | **Fixed** — prefetch on hydrate effect |
| Super-admin dashboard uncached (~40 queries) | CRITICAL | **Fixed** — Redis cache 90s |
| `information_schema` probe every school dashboard miss | CRITICAL | **Fixed** — 24h cache |

---

## Frontend Bottlenecks

| Issue | Rank | Fix |
|-------|------|-----|
| Await prefetch blocked login | CRITICAL | Non-blocking prefetch |
| ~170 eager route imports | HIGH | Vite `manualChunks` by module |
| Global `refetchOnWindowFocus: true` | MEDIUM | Default `false`; opt-in per query |
| School banner waited on dashboard API for name | MEDIUM | Use `user.school_name` from login |
| Empty sidebar while menus load | MEDIUM | Fallback `schoolAdminNav` |
| Notifications on mount | LOW | Deferred 1.5s |

---

## Backend / PostgreSQL Bottlenecks

| Issue | Rank | Fix |
|-------|------|-----|
| Super-admin dashboard no cache | CRITICAL | Redis TTL 90s |
| Duplicate audit on login | CRITICAL | Single on_commit audit |
| 8× `_count_users_by_roles` queries | HIGH | Not yet consolidated (future) |
| Duplicate aggregates in `_platform_overview` | HIGH | Not yet consolidated (future) |
| Admission N+1 on `applied_class` | MEDIUM | **Fixed** — `select_related` |
| Admission login missing prefetch | MEDIUM | **Fixed** — `select_related` on student user |
| Schema probe on every cache miss | CRITICAL | **Fixed** — 24h cache |

---

## Network / Infrastructure

| Factor | Impact |
|--------|--------|
| Frontend `.env` → Railway staging | Every API crosses network to cloud |
| Railway cold starts | Not measured — possible 1–3s on idle |
| Cloudflare (production domain) | Not measured in this audit |
| CORS preflight | Standard JSON + Bearer — minimal preflight on same-origin proxy in dev |

**Recommendation:** Use local backend (`VITE_API_BASE_URL=http://127.0.0.1:8000`) for dev; deploy backend optimizations to staging for production-like testing.

---

## Issue Ranking Summary

### CRITICAL (addressed in this pass)
1. Login blocked on prefetch — **fixed**
2. Super-admin dashboard uncached — **fixed**
3. Duplicate login audit — **fixed**
4. School dashboard schema probe — **fixed**

### HIGH (remaining / partial)
1. No React.lazy route splitting — **mitigated** via Vite manualChunks
2. Dual JWT refresh race — **partial** (token fallback)
3. Super-admin duplicate role-count queries — document for future sprint
4. Login endpoint throttling disabled — future

### MEDIUM
1. Window focus storage sync
2. Dashboard refetchInterval 60s
3. Broader cache invalidation for school dashboard

### LOW
1. Redundant double navigate on login
2. StrictMode double-fetch in dev

---

## Branding Status

User-facing `src/` contains **ScholaOne** branding. Remaining technical references:

- Folder names: `EduNexus_Web`, `EduNexus_Backend`
- `constants.js`: legacy production URL comment `edunexusbackend-production.up.railway.app`
- Route redirect: `/edu-nexus-post` → `/scholaone-post` (intentional compat)

---

## School Navbar

| Item | Value |
|------|-------|
| Data source | Login `user.school_name` / `user.organization_name` via `getAuthenticatedTenantLabel()` |
| Location | Header center column |
| Additional API | **NO** |
| Logout cleanup | `queryClient.clear()` + `clearAuth()` clears user/school from state |

---

## Files Modified (This Optimization Pass)

See implementation commit / diff for full list. Key files:

- `src/contexts/AuthContext.jsx` — non-blocking prefetch, hydrate prefetch
- `src/components/layout/Header.jsx` — centered school name, ScholaOne brand
- `src/utils/tenantDisplay.js` — tenant label helper
- `src/providers/AppProviders.jsx` — query defaults
- `src/api/axios.js` — refresh token fallback
- `vite.config.js` — manualChunks
- `services/auth_service.py` — dedupe audit
- `services/dashboard_service.py` — super-admin cache
- `services/school_dashboard_service.py` — schema cache, select_related
