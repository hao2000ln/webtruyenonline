# Mộc Thư — Project Operating Guide

> Canonical onboarding file for humans and coding agents.  
> Last verified against the repository: **2026-10-23**.  
> Workspace: `D:\project\webtruyenonline\story-web`

Read this file before changing the project. Use the code and migrations as the final source of truth when this document and an older document disagree.

## 1. Product in one minute

Mộc Thư is a Vietnamese online text-story website. It is a single Next.js full-stack application with two distinct experiences:

- Public/User App: discovery, search, genres, story detail, reader, local history, account, follows.
- Admin App: dashboard, story/chapter/author/genre CRUD, bulk chapter import, cover management.

Guests can read without logging in. `/admin/**` is protected and requires a user whose auth role is `admin`.

Current phase: MVP stabilization and production preparation.

## 2. Current technology map

| Concern | Current implementation |
| --- | --- |
| Framework | Next.js 16 App Router, React 19 |
| Language | TypeScript strict |
| Styling | Tailwind CSS 4, global CSS |
| Database access | Drizzle ORM + `postgres` driver via `DATABASE_URL` |
| Database | PostgreSQL; current auth data uses the `neon_auth` schema |
| Authentication | Neon Auth / Managed Better Auth through `@neondatabase/auth` |
| File storage | Neon Object Storage bucket `story-covers` |
| Validation | Zod |
| Chapter editor | Quill 2 |
| HTML safety | `sanitize-html` allowlist |
| Icons | `lucide-react` |
| SEO | Next Metadata API, `robots.ts`, dynamic `sitemap.ts` |
| Intended hosting | Next.js host such as Vercel; database, auth and object storage on Neon |

Runtime requirements from `package.json`:

```text
Node.js >= 24 < 25
npm >= 11
```

The project is a monolith. Do not introduce a second backend, queue, Redis, Elasticsearch, or microservices unless the task explicitly requires it.

## 3. Important architecture boundary

```text
Browser
  ├─ Public/User routes
  │    ├─ Server Components → Drizzle → PostgreSQL
  │    ├─ Client state → localStorage
  │    └─ Route Handlers → Neon Auth session → PostgreSQL
  │
  └─ Admin routes
       ├─ src/proxy.ts performs the early session gate
       ├─ Admin server layout calls requireAdmin()
       ├─ Every mutation calls requireAdmin() again
       └─ Server Action → Zod → mutation/transaction → revalidatePath()
```

Rules:

- Prefer Server Components and direct Drizzle queries for server-rendered pages.
- Do not call an internal HTTP API from a Server Component when it can call the query layer directly.
- Use Route Handlers for browser-initiated user operations such as follows/history sync.
- Use Server Actions for Admin mutations.
- Keep database reads in `src/db/queries/` and writes in `src/db/mutations/`.
- Keep validation in `src/lib/validation/`.
- All database schema changes require a migration.

## 4. Source layout

```text
src/app/                         Routes, layouts, Server Actions, Route Handlers
src/app/(site)/                  Public/User route group
src/app/admin/(auth)/            Admin login
src/app/admin/(dashboard)/       Protected Admin application
src/app/api/auth/[...path]/      Neon Auth handler
src/app/api/follows/[slug]/      Follow/unfollow API
src/app/api/history/sync/        Reading-history sync API
src/app/api/annotations/sync/    Reader highlight/note sync API
src/components/                  Public, reader, auth and admin UI
src/db/schema.ts                 Drizzle schema and indexes
src/db/queries/                  Read layer
src/db/mutations/                Write/transaction layer
src/lib/auth/                    Neon Auth clients and authorization helpers
src/lib/storage/                 Neon Object Storage cover helpers
src/lib/validation/              Zod schemas
drizzle/                         Drizzle migrations
scripts/                         Checks, seed and integration tests
samples/                         Bulk-import sample files
neon.ts                          Neon branch services declaration (`auth: true`)
src/proxy.ts                     Next.js route protection proxy
```

## 5. Routes and access

### Public and user routes

```text
/
/truyen/[slug]
/truyen/[slug]/chuong-[chapter]
/the-loai
/the-loai/[slug]
/tim-kiem
/lich-su
/dang-nhap
/dang-ky
/tai-khoan        authenticated
/theo-doi         authenticated
/ghi-chu           authenticated annotation notebook
```

### Admin routes

```text
/admin/login
/admin
/admin/stories
/admin/stories/new
/admin/stories/[id]/edit
/admin/chapters
/admin/chapters/new
/admin/chapters/[id]/edit
/admin/authors
/admin/authors/new
/admin/authors/[id]/edit
/admin/genres
/admin/genres/new
/admin/genres/[id]/edit
/admin/import
```

Public pages use the site header/footer. Admin uses a separate layout with fixed desktop sidebar, sticky topbar and responsive mobile navigation.

## 6. Authentication and authorization

The active authentication path is Neon Auth:

- Server instance: `src/lib/auth/server.ts`.
- Browser instance: `src/lib/auth/client.ts`.
- Catch-all auth endpoint: `src/app/api/auth/[...path]/route.ts`.
- Route gate: `src/proxy.ts`.
- User guard: `requireUser()` in `src/lib/auth/user.ts`.
- Admin guard: `requireAdmin()` in `src/lib/auth/admin.ts`.
- Role helper accepts `user.role === "admin"`; `app_metadata.role` remains as compatibility support.
- Sign-in/sign-up methods use `auth.signIn.email()` and `auth.signUp.email()`.
- Users and sessions live in PostgreSQL schema `neon_auth`.
- Application profile rows live in public table `profiles`; `ensureProfile()` creates the row after sign-in/sign-up.

Admin provisioning:

```bash
npm run set-admin -- admin@example.com
```

`scripts/grant-admin.mjs` updates `neon_auth.user.role`. Never grant Admin from browser code.

The project has a single identity implementation. Do not add a second auth
provider or browser-side database client. Authentication and authorization must
continue through Neon Auth and the existing server guards.

## 7. Database model

Main public tables:

```text
profiles
authors
genres
stories
story_genres
chapters
follows
reading_history
reader_annotations
```

Relationships:

```text
authors  1 ── n stories
stories  n ── n genres          through story_genres
stories  1 ── n chapters
profiles n ── n stories         through follows
profiles 1 ── n reading_history
profiles 1 ── n reader_annotations
chapters 1 ── n reader_annotations
```

Critical invariants:

- `stories.slug` is unique.
- `authors.slug` is unique.
- `genres.slug` is unique.
- Chapter number is unique per story: `(story_id, chapter_number)`.
- Chapter slug is unique per story: `(story_id, slug)`.
- `stories.total_chapters` counts **published chapters only**.
- `stories.latest_chapter_at` is the latest published chapter timestamp.
- Create/update/delete/publish/unpublish/move/import chapter operations must update both aggregates in the same transaction.
- Moving a chapter must sync the old story and the new story.

Performance indexes in `src/db/schema.ts` cover public story feeds, chapter navigation and reverse follow lookup. Search also has manually managed trigram indexes in `drizzle/0006_performance_indexes.sql`.

### Migration warning

- The current production database has the expected public tables but no
  `drizzle.__drizzle_migrations` table. Do not run `db:migrate` against
  production until its existing schema is safely baselined.
- Drizzle journal currently tracks migrations through `0006_fixed_sleeper`.
- `drizzle/0006_performance_indexes.sql` is a manual performance migration and is not a normal journal entry.
- Use `npm run db:check-indexes` before `npm run db:apply-indexes`.
- Object Storage is infrastructure, not SQL: provision `story-covers` with `neon deploy` from `neon.ts`.
- Never rename, reorder or re-run migrations against production without checking migration history first.

## 8. Implemented Public/User features

- Homepage with real PostgreSQL data and sections for featured/latest/ranking/completed content.
- Story detail with author, genres, cover, metadata and paginated chapters.
- Search by story title or author.
- Genre listing and genre detail pages.
- Reader with previous/next navigation.
- Reader font size, line height, content width and light/sepia/dark/black themes.
- Guest history in `localStorage`, limited to 50 recent stories.
- Reader text highlights and plain-text notes. Guests use localStorage; signed-in users sync to `reader_annotations`.
- Text anchors store quote, surrounding context and offsets so highlights can be recovered after small chapter edits.
- `/ghi-chu` lists the signed-in user's latest annotations.
- Neon Auth email/password registration, login, persistent session and logout.
- Account page and followed-stories page.
- Follow/unfollow API.
- Guest-history synchronization to `reading_history`.
- Story/chapter view counters when a chapter is opened.
- Dynamic metadata, robots and sitemap.
- `next/image` story covers with fallback generated cover.

Not implemented yet: bookmark, rating, comments/moderation and notifications.

## 9. Implemented Admin features

### Dashboard

- Counts for stories, chapters, authors, genres and published content.
- Total views.
- Top five stories by views.
- Published ongoing stories with no chapter update for at least 30 days.
- Recently updated stories and chapters.

### Stories CRUD

- Server-side Drizzle list, title/author search, status filter and pagination.
- Create/edit/delete with Zod validation.
- Unique slug.
- One author and multiple genres.
- Draft/published state.
- Public-path revalidation after mutation.

### Chapters CRUD

- Fields: `storyId`, `chapterNumber`, `title`, `slug`, `content`, `isPublished`, `publishedAt`.
- Story filter, title/number search, sort and pagination.
- Quill editor, auto slug, safe preview and unsaved-change warning.
- Automatic word count based on sanitized content.
- Draft/publish/unpublish.
- Duplicate number/slug protection.
- Transactional story aggregate synchronization.

### Authors and genres

- Create/list/edit/delete.
- Search, server pagination, Zod validation and unique slug.

### Bulk chapter import

- Input: TXT, Markdown or JSON.
- Maximum source file: 2 MB.
- Maximum: 200 chapters per import.
- Parse → preview → edit/deselect → confirm.
- Import as draft or published.
- Conflict modes: `skip`, `update`, `abort`.
- Update mode preserves chapter ID, views, creation time and foreign-key references.
- Entire operation uses a transaction and resynchronizes story aggregates.
- Sample: `samples/bulk-import-chapters-mau.txt`.

### Story covers

- Client center-crop to 2:3, resize to 600×900, encode WebP.
- Original input accepts JPEG/PNG/WebP up to 5 MB.
- Server validates WebP signature and output size under 1 MB.
- Intended Storage path: `stories/{storyId}/{uuid}.webp` in bucket `story-covers`.
- Public rendering is restricted by `next.config.ts` remote image pattern.

Cover upload/delete uses Neon Object Storage server credentials and is called
only after `requireAdmin()`. The `story-covers` bucket is `public_read`; writes
remain authenticated server-side. Never expose `AWS_ACCESS_KEY_ID` or
`AWS_SECRET_ACCESS_KEY` to the browser.

## 10. Chapter content security

Chapter HTML pipeline:

```text
Quill HTML
  → Zod validation
  → sanitize-html allowlist
  → chapters.content
  → sanitize again before public render
```

Allowed content is intentionally narrow: paragraphs, line breaks, basic emphasis,
headings, lists, blockquote, links, code and preformatted text. Scripts, styles,
event handlers, unsafe schemes and unapproved attributes are removed.

Do not render new user/admin HTML with `dangerouslySetInnerHTML` unless it passes the shared sanitizer in `src/lib/chapter-content.ts`.

## 11. SEO, caching and performance

Implemented:

- Metadata API and global Open Graph/Twitter defaults.
- `src/app/robots.ts`.
- `src/app/sitemap.ts` for static routes, stories, genres and chapters.
- Homepage ISR/revalidation.
- `revalidatePath()` after content mutations.
- AVIF/WebP image formats.
- Static asset cache headers.
- CDN cache headers for chapter routes.
- Optimized `lucide-react` imports.
- Composite and partial database indexes.

Check before production:

- Confirm `/og-default.png` exists; metadata currently references it.
- Confirm `NEXT_PUBLIC_APP_URL` is the real canonical production origin.
- Review canonical metadata on every dynamic route.
- Run a production Core Web Vitals and accessibility audit.
- View counting currently increments on page render and has no bot/reload deduplication.

## 12. Environment variables

Required by current code:

```text
DATABASE_URL
NEON_AUTH_BASE_URL
NEON_AUTH_COOKIE_SECRET
NEXT_PUBLIC_APP_URL
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_ENDPOINT_URL_S3
AWS_REGION
```

Notes:

- `.env.local` is secret and must never be committed.
- Never print secret values in logs or task output.
- `NEXT_PUBLIC_*` values are exposed to the browser.
- Run `neon deploy` after changing `neon.ts`, then configure the same variables on the production app host.

## 13. Commands

Install and run:

```bash
npm install
npm run dev              # http://localhost:3003
npm run build
npm run start
```

Quality checks:

```bash
npm run lint
npm exec tsc -- --noEmit
npm run test:routes
npm run test:reader-storage
npm run test:admin-stories
npm run test:admin-chapters
npm run test:admin-chapter-import
npm run test:admin-statistics
npm run test:story-cover-storage
```

Database operations:

```bash
npm run db:check
npm run db:generate
npm run db:migrate
npm run db:studio
npm run db:check-indexes
npm run db:apply-indexes
npm run db:seed
```

Account operations:

```bash
npm run set-admin -- admin@example.com
```

Do not run `set-password` with defaults. The current script contains a fallback email/password and deletes/recreates a matching auth user before setting Admin. Treat it as destructive operational tooling; pass explicit values and obtain user approval before running it.

## 14. Test expectations

Before handing off code changes, run checks proportional to the change:

- UI/CSS only: lint + typecheck; visually verify when a browser is available.
- Query/mutation: lint + typecheck + the relevant integration test.
- Schema/index: generate/review migration, database check and relevant integration tests.
- Auth: sign-up/sign-in/sign-out, reload persistence, protected User route, protected Admin route and non-Admin rejection.
- Storage: verify upload, public display, replace and delete using the active auth system—not only a policy query.
- Broad change: run all tests and production build.

Known environment behavior: in restricted Windows sandboxes, `next build` or `tsx`
may compile successfully and then fail with `spawn EPERM` when creating a worker.
Retry outside the sandbox/CI before treating this as an application failure.

## 15. Non-negotiable implementation rules

- Preserve guest reading; never make public reading require login.
- Preserve public route SEO and reader behavior when changing Admin code.
- Every Admin mutation must call `requireAdmin()` server-side.
- Never trust client preview/import/crop data; validate again on the server.
- Never expose service-role keys, database URLs, auth secrets or cookie secrets.
- Do not weaken unique constraints to “fix” duplicate errors.
- Keep chapter aggregate updates transactional.
- Revalidate affected public and Admin pages after content mutations.
- Preserve existing IDs and view/history relations when updating imported chapters.
- Use `apply_patch` for source edits and preserve unrelated user changes in a dirty worktree.
- Do not delete or rewrite migrations without first checking deployed migration history.
- Keep Vietnamese UI copy consistent and save text files as UTF-8.

## 16. Known gaps and next priorities

High priority:

1. Baseline the current production schema into Drizzle migration history.
2. Add rate limits for login, follow/history APIs and view recording.
3. Add security headers/CSP and production monitoring.
4. Configure a CDN/custom domain in front of public story covers when traffic grows.

Then:

- Soft delete/trash and Admin audit log.
- Backup/restore procedure.
- Better view-count deduplication.
- Complete canonical/OG/JSON-LD audit.
- User bookmarks, ratings, comments/moderation and notifications.

Only add Redis, search infrastructure, queues, recommendation services, PWA or a separate backend when real scale/product requirements justify them.

## 17. Documentation authority

Use this order when information conflicts:

1. Current source code and `src/db/schema.ts`.
2. Applied database/storage/auth configuration.
3. `AGENTS.md` (this file).
4. `PROJECT_ARCHITECTURE.md` for longer historical/product context.
5. `README.md` for basic setup only.

After a material architecture, auth, storage, route, schema, command or feature change, update this file in the same task. Record facts that were verified; label risks and unverified behavior explicitly.
