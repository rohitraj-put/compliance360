# Compliance360 — Full-Stack Next.js App

A complete, single-codebase full-stack rebuild of Compliance360: the same product (React/Next.js UI,
ink-stamp/ledger design system, dashboard, companies, compliance tracker, renewal calendar, document
vault, tasks, consultant portal, settings, light/dark theme, login/register/logout with confirmation)
now running on **Next.js 14 (App Router)** with its own built-in API routes backed by **real MySQL** —
no separate backend server, no `localStorage`. One `npm install`, one `npm run dev`.

## Stack

- **Next.js 14 (App Router)** — pages *and* API routes (`app/api/**/route.js`) in one project
- **MySQL** (via `mysql2`) — same schema family as the standalone Express backend, minus the
  refresh-token table (see "Auth model" below for why)
- **jose** — signs/verifies the session JWT; works in both Edge middleware and Node route handlers
- **bcryptjs** — password hashing
- Plain CSS design system (`app/globals.css`) — no Tailwind, no build-step CSS framework

## Quick start

```bash
npm install
cp .env.example .env        # then edit .env with your MySQL credentials
npm run db:migrate          # creates the database + tables + reference data
npm run db:seed             # optional: demo login with sample companies/records/tasks
npm run dev                 # http://localhost:3000
```

Demo login after `npm run db:seed`:
```
email:    demo@Compliance360.app
password: password123
```

### Requirements
- Node.js 18.17+
- A running MySQL 8 (or MariaDB 10.6+) server you can create a database on

## Auth model — how this differs from a typical SPA + API

This app authenticates with a **single httpOnly session cookie**, not `localStorage` and not a
`Authorization` header:

1. `POST /api/auth/login` (or `/register`) verifies credentials and sets an httpOnly, signed JWT
   cookie (`c360_session` by default).
2. **`middleware.js`** runs on every request (Edge runtime) and verifies that cookie with `jose`:
   - Missing/invalid cookie on a page route → redirect to `/login`.
   - Missing/invalid cookie on an API route → `401 JSON`.
   - Valid cookie → the user's id/email/role are forwarded to the route handler as request headers
     (`x-user-id`, etc.), so route handlers never need to re-verify the JWT or hit the database just
     to know who's asking.
3. Every API route scopes its SQL by that forwarded user id (`WHERE owner_user_id = ?`, or a join back
   to it), and returns a plain `404` — not `403` — for anything that isn't yours, so requests can't be
   used to probe which IDs exist. This was verified with two separate accounts during development.

**Why one session token instead of the Express backend's rotating access/refresh pair:** simplicity and
correctness. A single well-scoped, reasonably-lived (7 days by default) httpOnly cookie is secure enough
for this app and removes an entire class of bugs (the standalone Express backend in this project's
history originally shipped a rotating-refresh-token race condition — two tokens issued in the same
second could collide — which is exactly the kind of thing added complexity invites). If you need
instant server-side revocation (e.g. "log out this device remotely"), reintroduce a `refresh_tokens`
table and check it in `middleware.js`'s Node-runtime counterpart — see "Extending auth" below.

## Database schema

See `db/schema.sql`. Same shape as before:

```
users               — accounts (name, company, email, password_hash, role, photo_url)
companies           — client register, owned by a user (owner_user_id)
compliance_types    — reference table: GST, PF, ESI, Factory License, Fire NOC, Pollution NOC, Trade License
compliance_records  — one row per license/filing
documents           — versioned files attached to a compliance record
tasks               — kanban tasks (Open / In Progress / Completed)
```
All child tables cascade on delete (`ON DELETE CASCADE`) up to `companies`, and `companies` cascades
from `users`. Re-run `npm run db:migrate` any time — it's idempotent.

## API reference

Base path: `/api`. Everything except `POST /api/auth/register`, `POST /api/auth/login`,
`POST /api/auth/logout`, and `GET /api/uploads/*` requires the session cookie (sent automatically by
the browser — no manual header needed from the bundled frontend).

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register` | `{ name, company?, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |
| POST | `/api/auth/logout` | Clears the session cookie |
| GET | `/api/auth/me` | Current profile |
| PUT | `/api/auth/me` | multipart: `name?, company?, email?, photo?` (file), `removePhoto?` |
| PUT | `/api/auth/me/password` | `{ currentPassword, newPassword }` |
| GET / POST | `/api/companies` | List / create |
| GET / PUT / DELETE | `/api/companies/:id` | — |
| GET | `/api/compliance/types` | The 7 reference types |
| GET / POST | `/api/compliance/records` | `?company_id=&status=` filters on GET |
| PUT / DELETE | `/api/compliance/records/:id` | — |
| GET | `/api/documents?compliance_record_id=` | — |
| POST | `/api/documents` | multipart: `compliance_record_id`, `file` (PDF/DOC/DOCX/JPG/PNG/WEBP, ≤10MB) |
| DELETE | `/api/documents/:id` | Also deletes the file from disk |
| GET / POST | `/api/tasks` | `?company_id=&status=` filters on GET |
| PUT / DELETE | `/api/tasks/:id` | — |
| PATCH | `/api/tasks/:id/status` | `{ status }` |
| GET | `/api/dashboard/summary?company_id=all\|<id>` | Counts, by-type breakdown, upcoming renewals |
| GET | `/api/consultant/rollup` | Every company ranked by overdue → expiring |
| GET | `/api/uploads/:filename` | Serves an uploaded file (documents + profile photos) |

## Uploads

Files are written to `./uploads` on the server's disk and served back through `GET /api/uploads/:filename`
(filename is sanitized with `path.basename()` to prevent path traversal — verified during development).
This works great for `npm run dev` / `npm start` on a normal server or VM. **It will not persist on
serverless platforms with ephemeral/read-only filesystems** (e.g. Vercel's default deployment) — for
those, swap `lib/uploads.js` for an S3 (or equivalent) client; the function signatures
(`saveUploadedFile`, `deleteUploadedFile`) are the only things route handlers depend on.

## What's been verified

This wasn't just written — it was built and run against a real MySQL 8 instance, with a full
regression pass before packaging: unauthenticated redirect on page routes, `401` on API routes,
login/logout, wrong-password rejection, cookie-gated access to every one of the 7 app pages,
company/record/task CRUD, document upload + file serving + 404 on missing files + path-traversal
rejection, profile photo upload, validation errors, and two-account data isolation (a second
registered account sees zero companies and cannot read the first account's data).

## Project structure

```
app/
  layout.jsx              Root layout — fonts, theme-flash-prevention script, providers
  login/page.jsx           Public
  register/page.jsx        Public
  (app)/                   Route group — every page here requires a session (enforced by middleware.js)
    layout.jsx              Sidebar + DataProvider
    page.jsx                 Dashboard
    companies/page.jsx
    compliance/page.jsx
    calendar/page.jsx
    documents/page.jsx
    tasks/page.jsx
    consultant/page.jsx
    settings/page.jsx
  api/                     Route handlers — the whole backend lives here
    auth/, companies/, compliance/, documents/, tasks/, dashboard/, consultant/, uploads/
  globals.css              Design system (navy/parchment/saffron, ink-stamp status badges, dark theme)
middleware.js              Edge-runtime session check + identity forwarding for every request
lib/                       db.js, auth.js, ApiError.js, apiHelpers.js, ownership.js, uploads.js,
                           complianceStatus.js, apiClient.js (client-side fetch wrapper), date.js, plans.js
context/                   AuthContext, DataContext, ThemeContext (all client components)
components/                Sidebar, Topbar, Modal, ConfirmDialog, EditProfileModal, Avatar,
                           StampBadge, StatCard, charts, icons, AuthHeader
db/                        schema.sql, seed.sql, migrate.js, seedDemoData.js
uploads/                   Uploaded files land here at runtime (gitignored except .gitkeep)
```

## Extending auth (remote logout / device revocation)

If you need to invalidate a session before it expires (e.g. "log out everywhere"):
1. Add back a `refresh_tokens`-style table (see the standalone Express backend's `db/schema.sql` in
   this project's history for a working example, with the same-second collision bug already fixed
   via a `jti` claim).
2. Store a session id (not the whole JWT) in that table, put the session id in the JWT payload, and
   check it against the table in `middleware.js` — note this requires a Node-runtime middleware
   (`export const runtime = 'nodejs'`) or an edge-compatible database driver, since the default Edge
   runtime can't open a `mysql2` TCP connection.

## Production checklist

- Put this behind HTTPS — the session cookie is marked `secure` automatically when `NODE_ENV=production`.
- Move uploads to S3/object storage if deploying anywhere with an ephemeral filesystem.
- Add rate limiting on `/api/auth/*` (e.g. a small in-memory or Redis-backed limiter in middleware).
- `next@14.2.35` is the newest 14.x patch as of this build; a handful of advisories affecting
  self-hosted Next.js are only fixed in the 15.x/16.x line (Server Components DoS, image-optimizer
  edge cases). None affect this app's usage (no `next/image`, no advanced RSC caching), but plan a
  major-version upgrade before this goes in front of real users.
- Add automated tests — this was verified manually end-to-end (see above) but has no test suite yet.
