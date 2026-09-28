# STORY WEB — KIẾN TRÚC VÀ TRẠNG THÁI PHÁT TRIỂN

> Cập nhật: 28/09/2026  
> Dự án: **Mộc Thư** — website đọc truyện chữ tiếng Việt  
> Trạng thái: **đang phát triển MVP**

## 1. Mục tiêu hệ thống

Mộc Thư là website đọc truyện online hoạt động tốt trên mobile và desktop, ưu tiên:

- Trải nghiệm đọc tập trung, nhanh và dễ tùy chỉnh.
- Guest có thể đọc truyện mà không bắt buộc đăng nhập.
- SEO và nội dung server-rendered.
- Admin có thể vận hành toàn bộ kho truyện trong cùng hệ thống.
- Chi phí và độ phức tạp vận hành thấp trong giai đoạn MVP.

Luồng đọc chính:

```text
Trang chủ / Tìm kiếm / Thể loại
                ↓
          Chi tiết truyện
                ↓
        Danh sách chương
                ↓
           Đọc chương
                ↓
      Chương trước / chương sau
```

Nguyên tắc phát triển:

- Reader và nội dung trước social features.
- Server Components trước client-side fetching khi phù hợp.
- PostgreSQL trước Elasticsearch hoặc hệ thống search riêng.
- Monolith trước microservices.
- Mọi thay đổi database đi qua migration.
- Không expose secret hoặc service-role key ra client.
- Mutation Admin luôn kiểm tra quyền lại ở server.
- Các tính năng chính phải sử dụng tốt trên mobile.

## 2. Tech stack và môi trường

```text
Next.js 16 App Router
React 19
TypeScript strict
Tailwind CSS 4
Supabase Auth + PostgreSQL + Storage
Drizzle ORM + postgres driver
Zod validation
Quill 2 rich-text editor
sanitize-html allowlist
ESLint 9
```

Runtime yêu cầu:

```text
Node.js >= 24 < 25
npm >= 11
```

Local development:

```text
http://localhost:3003
npm run dev
```

Hạ tầng dự kiến:

```text
Vercel                 Next.js deployment
Supabase               Auth, PostgreSQL, Storage
Cloudflare             DNS/CDN nếu cần
```

Hiện tại không sử dụng NestJS, Redis, Elasticsearch, queue, microservices hoặc
Docker production.

## 3. Kiến trúc tổng thể

Dự án là một Next.js fullstack monolith. Public/User App và Admin App nằm trong
cùng repository, dùng chung PostgreSQL và Supabase nhưng tách route group, layout,
quyền truy cập và UX.

```text
Browser
  ├── Public/User App
  │     ├── Server Components → Drizzle → PostgreSQL
  │     ├── Client Components → localStorage
  │     └── Route Handlers → Supabase Auth/RLS
  │
  └── Admin App
        ├── Server layout → requireAdmin()
        ├── Server Actions → requireAdmin() → Zod
        ├── Drizzle transaction → PostgreSQL
        └── Supabase Storage → story-covers
```

Các lớp mã nguồn chính:

```text
src/app/                  Routing, layouts, pages, Server Actions, Route Handlers
src/components/           UI public, reader, auth và admin
src/db/schema.ts          Drizzle schema
src/db/queries/           Read/query layer
src/db/mutations/         Mutation/transaction layer
src/lib/auth/             Auth và role helpers
src/lib/supabase/         Supabase browser/server/proxy clients
src/lib/storage/          Supabase Storage helpers
src/lib/validation/       Zod schemas
drizzle/                  Database migrations
scripts/                  Seed, database check và integration tests
samples/                  File dữ liệu mẫu cho Bulk Import
```

## 4. Route structure

```text
src/app/
├── (site)/                         Public/User App
│   ├── layout.tsx                  Header + content + footer
│   ├── page.tsx                    Trang chủ
│   ├── truyen/[slug]/              Chi tiết truyện
│   ├── truyen/[slug]/[chapter]/    Reader
│   ├── the-loai/                   Danh sách thể loại
│   ├── the-loai/[slug]/            Truyện theo thể loại
│   ├── tim-kiem/                   Tìm kiếm
│   ├── lich-su/                    Guest history
│   ├── dang-nhap/                  User login
│   ├── dang-ky/                    User registration
│   ├── tai-khoan/                  User account + history sync
│   └── theo-doi/                   Truyện đang theo dõi
│
├── admin/
│   ├── (auth)/login/               Admin login riêng
│   └── (dashboard)/                Admin layout riêng
│       ├── page.tsx                Dashboard + Statistics
│       ├── stories/                Stories CRUD
│       ├── chapters/               Chapters CRUD
│       ├── authors/                Authors CRUD
│       ├── genres/                 Genres CRUD
│       └── import/                 Bulk Import Chapters
│
├── api/
│   ├── follows/[slug]/             Follow/unfollow
│   └── history/sync/               Sync guest history
│
└── auth/confirm/                   Email confirmation callback
```

## 5. Public/User App

Các route public chính:

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
/tai-khoan
/theo-doi
```

### Chức năng đã hoàn thành

- Trang chủ lấy dữ liệu thật từ PostgreSQL.
- Các nhóm truyện mới cập nhật, mới xuất bản, đọc nhiều và hoàn thành.
- Chi tiết truyện, metadata, ảnh bìa, tác giả, thể loại và danh sách chương.
- Search/filter/sort/pagination danh sách chương.
- Tìm kiếm truyện theo tên truyện hoặc tác giả.
- Danh sách thể loại và trang truyện theo thể loại.
- Reader với previous/next chapter.
- Reader settings: font size, line height, content width và bốn theme.
- Guest history bằng `localStorage`, tối đa 50 truyện gần nhất.
- Đăng ký/đăng nhập bằng Supabase Auth.
- Cookie session SSR persist sau reload.
- Trang tài khoản và đăng xuất.
- Follow/unfollow truyện.
- Đồng bộ guest history lên `reading_history` khi user mở trang tài khoản.
- Tăng `stories.view_count` và `chapters.view_count` khi mở một chương.
- Metadata động cơ bản cho story, chapter, search và genre.

### Quyền User

- Guest luôn được đọc truyện, tìm kiếm và dùng lịch sử local.
- User đã đăng nhập chỉ thao tác dữ liệu thuộc chính mình.
- RLS giới hạn `profiles`, `follows`, `reading_history` theo `auth.uid()`.
- Bookmark, rating và comment chưa triển khai.

## 6. Reader và nội dung chương

Reader là phần UX quan trọng nhất:

- Chiều rộng nội dung tùy chỉnh 640–880px.
- Cỡ chữ 16–26px.
- Line height 1.5–2.1.
- Theme light, sepia, dark và black.
- Settings và guest history không yêu cầu đăng nhập.
- Nội dung chương được sanitize lại trước khi render public.

Nội dung chương được soạn bằng Quill và lưu dưới dạng HTML đã qua allowlist:

```text
Quill HTML
    ↓
Zod validation
    ↓
sanitize-html allowlist
    ↓
PostgreSQL chapters.content
    ↓
sanitize lại khi render Reader
```

Allowlist chỉ giữ các thẻ nội dung cần thiết như đoạn văn, heading, bold, italic,
underline, danh sách, blockquote, link, code và pre. Script, style, event handler,
URL `javascript:` và thuộc tính không cho phép bị loại bỏ.

## 7. Admin App

Admin dùng layout riêng hoàn toàn, không dùng header/footer public.

Layout gồm:

- Sidebar trái cố định trên desktop.
- Topbar cố định khi cuộn.
- Navigation responsive trên mobile.
- Content area riêng.
- Logout trong sidebar/topbar.

### Authentication và authorization

- Chỉ user có `app_metadata.role === "admin"` được truy cập `/admin/**`.
- Guest được redirect về `/admin/login`.
- User thường được redirect về public site.
- Proxy chỉ là lớp kiểm tra sớm.
- Server layout và mọi mutation kiểm tra lại bằng `requireAdmin()`.
- Role lấy từ `app_metadata`, không lấy từ `user_metadata`.
- Service-role key không được đưa xuống client.

### Dashboard và Statistics

- Tổng số truyện, chương, tác giả và thể loại.
- Số truyện/chương đã xuất bản.
- Tổng lượt đọc toàn hệ thống.
- Top 5 truyện theo lượt đọc.
- Truyện `ONGOING` đã publish nhưng không có chương mới trong 30 ngày.
- Danh sách truyện và chương cập nhật gần đây.
- Query bằng Drizzle server-side, chưa cần analytics service riêng.

### Stories CRUD

- Table dữ liệu thật bằng Drizzle.
- Title, author, status, total chapters, views, latest chapter và actions.
- Search theo title/author.
- Filter status.
- Pagination server-side, mặc định 10 truyện/trang.
- Create, edit và delete có confirmation.
- Zod validation và slug unique.
- Chọn một author và nhiều genres.
- Draft/published state.
- Cascade relation khi xóa.
- Revalidate homepage, search, genre, story detail và chapter pages.

### Ảnh bìa truyện

- Upload JPEG, PNG hoặc WebP gốc tối đa 5 MB.
- Crop giữa theo tỷ lệ 2:3 phía client.
- Resize 600×900 và chuyển WebP chất lượng 82%.
- File sau tối ưu được server kiểm tra MIME, WebP signature và giới hạn 1 MB.
- Upload vào public bucket `story-covers` theo path:

```text
stories/{storyId}/{uuid}.webp
```

- Storage INSERT/UPDATE/DELETE chỉ cho JWT có role Admin qua RLS.
- Public chỉ có quyền đọc ảnh trong public bucket.
- Thay ảnh sử dụng path mới để tránh stale CDN cache.
- Sau khi database cập nhật thành công, ảnh cũ được xóa.
- Xóa story cũng dọn ảnh cover thuộc Storage.
- Public render ảnh bằng `next/image` với `remotePatterns` giới hạn đúng bucket.

### Chapters CRUD

- Create, list, edit và delete.
- Field: `storyId`, `chapterNumber`, `title`, `slug`, `content`, `isPublished`, `publishedAt`.
- Search theo số chương/tiêu đề.
- Filter theo truyện.
- Sort mới nhất/cũ nhất.
- Pagination và page-size server-side.
- Rich-text editor bằng Quill.
- Auto-generate slug từ tiêu đề.
- Preview nội dung đã sanitize.
- Tự tính `wordCount` từ text sau sanitize.
- Draft/publish/unpublish.
- Cảnh báo unsaved changes khi reload hoặc rời form.
- Unique constraint `storyId + chapterNumber` và `storyId + slug`.
- Đồng bộ `stories.total_chapters` và `latest_chapter_at` trong transaction.
- Khi chuyển chương sang truyện khác, aggregate của cả truyện cũ và mới được cập nhật.

`total_chapters` chỉ tính các chương đã publish.

### Authors và Genres CRUD

- Create, list, edit và delete.
- Search và pagination server-side.
- Zod validation.
- Slug unique.
- Xử lý relation an toàn khi xóa.
- Table responsive.

### Bulk Import Chapters

Định dạng hỗ trợ:

- TXT.
- Markdown.
- JSON array hoặc object có thuộc tính `chapters`.

Luồng xử lý:

```text
Chọn truyện + upload/paste file
              ↓
       Parse tối đa 200 chương
              ↓
 Preview + sửa + bỏ chọn từng chương
              ↓
 Chọn draft/publish + conflict mode
              ↓
 Server requireAdmin + Zod + sanitize
              ↓
     PostgreSQL transaction
              ↓
 Sync story aggregates + revalidate
```

Conflict mode:

- `skip`: bỏ qua chương đã tồn tại.
- `update`: cập nhật theo `storyId + chapterNumber`.
- `abort`: rollback toàn bộ khi có conflict.

Khi update chương cũ:

- Giữ nguyên `id`, `viewCount`, `createdAt` và các foreign key.
- Cập nhật title, slug, content, wordCount và updatedAt.
- Mặc định giữ trạng thái publish hiện tại.
- Có tùy chọn áp dụng draft/publish của lần import cho chương cập nhật.
- Slug thuộc về chương khác vẫn bị chặn.

Giới hạn:

- File đầu vào tối đa 2 MB.
- Tối đa 200 chương mỗi lần.
- Server Action payload tối đa 4 MB cho dữ liệu chapter đã parse.
- Có file mẫu tại `samples/bulk-import-chapters-mau.txt`.

## 8. Database

Các bảng hiện tại:

```text
profiles
authors
genres
stories
story_genres
chapters
reading_history
follows
```

Quan hệ chính:

```text
authors  1 ─── n stories
stories  n ─── n genres          qua story_genres
stories  1 ─── n chapters
profiles n ─── n stories         qua follows
profiles 1 ─── n reading_history
```

Aggregate denormalized trong `stories`:

```text
total_chapters       Số chương đã publish
latest_chapter_at    publishedAt mới nhất
view_count           Tổng lượt mở chapter thuộc truyện
follow_count         Số lượt theo dõi
rating_avg/count     Chuẩn bị cho phase rating
```

Constraint quan trọng:

- Story slug unique.
- Author slug unique.
- Genre slug unique.
- Chapter unique theo `(story_id, chapter_number)`.
- Chapter slug unique theo `(story_id, slug)`.
- `story_genres`, `follows`, `reading_history` sử dụng composite primary key phù hợp.

Migrations:

```text
0000_overrated_scream.sql              Schema ban đầu
0001_enable_rls.sql                    RLS setup
0002_enable_rls_actual.sql             RLS thực tế
0003_user_self_service_policies.sql    Profile trigger + user self-service policies
0004_story_cover_storage.sql           Storage bucket + Admin cover policies
```

## 9. Data access và transaction

Server-rendered pages ưu tiên:

```text
Server Component
      ↓
Drizzle query
      ↓
Supabase PostgreSQL
```

Không gọi HTTP API nội bộ khi Server Component có thể query database trực tiếp.

Route Handlers chỉ dùng cho thao tác user từ Client Component:

```text
GET/POST/DELETE /api/follows/[slug]
POST            /api/history/sync
```

Admin create/update/delete/import dùng Server Actions:

```text
Server Action
    ↓
requireAdmin()
    ↓
Zod validation
    ↓
Mutation/transaction
    ↓
revalidatePath()
```

Các thao tác chapter và bulk import đồng bộ aggregate trong cùng transaction để
không tạo trạng thái story/chapter lệch nhau.

## 10. Auth, session và RLS

### Supabase Auth

- Email/password cho User và Admin.
- Session lưu bằng cookie qua `@supabase/ssr`.
- Proxy refresh token trước khi request đến protected pages.
- Server luôn xác minh user bằng `supabase.auth.getUser()`.

### User RLS

- `profiles`: user chỉ đọc/cập nhật profile của chính mình.
- `follows`: user chỉ thao tác follow của chính mình.
- `reading_history`: user chỉ thao tác lịch sử của chính mình.
- Trigger tạo `profiles` khi có Supabase Auth user mới.

### Storage RLS

- Bucket `story-covers` là public-read.
- INSERT/UPDATE/DELETE chỉ dành cho authenticated Admin.
- Storage helper sử dụng session Admin hiện tại, không đưa service-role key xuống browser.

## 11. Guest history và user history

Guest history:

```text
Reader
  ↓
localStorage
  ↓
Tối đa 50 truyện gần nhất
```

User history:

```text
localStorage
    ↓ đăng nhập / mở trang tài khoản
/api/history/sync
    ↓
reading_history
```

Server chỉ ghi lịch sử mới hơn để tránh dữ liệu local cũ ghi đè tiến độ mới.

## 12. Cache, revalidation và SEO

Đã có:

- Server Components cho nội dung chính.
- Homepage revalidate 60 giây.
- `revalidatePath()` sau Admin mutation/import.
- Metadata động cơ bản.
- `next/image` cho story cover.
- Remote image pattern giới hạn vào Supabase `story-covers`.
- Local font, không phụ thuộc font CDN.
- Pagination server-side.

Chưa hoàn thành:

- `robots.txt` production.
- Sitemap cho stories, genres và chapters.
- Canonical đầy đủ.
- Open Graph image hoàn chỉnh.
- JSON-LD cho story/chapter.
- Đo Core Web Vitals trên production.

## 13. Security

Đã triển khai:

- TypeScript strict.
- Input Admin validate bằng Zod.
- Database unique constraints chống race condition.
- Admin authorization ở server layout và mọi mutation.
- User data bảo vệ bằng RLS.
- Chapter HTML sanitize bằng allowlist khi lưu, preview và render.
- Cover validate cả client và server.
- Import giới hạn kích thước, số chương và payload.
- Không expose `SUPABASE_SERVICE_ROLE_KEY` ra client.
- Secrets nằm trong `.env.local`, không commit.

Cần bổ sung trước production:

- Rate limit login, follow, history sync và page-view recording.
- Security headers/CSP phù hợp deployment.
- Chống spam view count tốt hơn session/IP đơn giản hiện tại.
- Audit log cho Admin mutation.
- Soft delete/thùng rác cho nội dung quan trọng.
- Backup và restore procedure.

## 14. Environment variables

```text
DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
```

`SUPABASE_SERVICE_ROLE_KEY` chỉ được phép dùng trong server-only operational code.
Luồng cover hiện tại dùng JWT Admin + Storage RLS, không gửi service key xuống client.

## 15. Testing và quality gates

Scripts hiện có:

```bash
npm run lint
npx tsc --noEmit
npm run test:reader-storage
npm run test:admin-stories
npm run test:admin-chapters
npm run test:admin-chapter-import
npm run test:admin-statistics
npm run test:story-cover-storage
npm run db:check
npm run build
```

Coverage chính:

- Reader settings/history localStorage.
- Stories CRUD TC01–TC11.
- Chapter CRUD, word count, sanitize, duplicate và aggregate sync.
- Bulk Import parse TXT/JSON, draft/publish, skip/update/abort và rollback.
- Update chapter qua import giữ ID, view count và createdAt.
- Statistics query và tăng story/chapter view count.
- Storage bucket config và ba Admin RLS policies.
- Fixture integration test có prefix riêng và cleanup sau mỗi lần chạy.

Trạng thái gần nhất:

- TypeScript strict: pass.
- ESLint: pass.
- Stories CRUD integration TC01–TC11: pass.
- Chapters CRUD integration: pass.
- Bulk Import integration: pass.
- Statistics integration: pass.
- Storage bucket/RLS verification: pass.
- Database migration `0004_story_cover_storage`: đã áp dụng thành công.
- Production source compilation: pass.
- Full `next build`: chưa xác nhận exit code 0 trong môi trường Codex vì Windows
  sandbox chặn Next.js TypeScript worker với `spawn EPERM`; cần chạy lại local/CI.

## 16. Trạng thái tính năng

### Hoàn thành cho MVP

- Public discovery/search/genre/story detail.
- Reader và guest history.
- User Auth, account, follow và history sync.
- Admin Auth và role authorization.
- Stories, Chapters, Authors, Genres CRUD.
- Bulk Import Chapters.
- Story cover upload/replace/delete.
- Dashboard statistics nhẹ.
- Responsive public/admin layouts.

### Ưu tiên tiếp theo

```text
SEO production: robots + sitemap + canonical + JSON-LD
    ↓
Rate limit + security headers
    ↓
Soft delete + audit log Admin
    ↓
Production build/CI + deploy Vercel
    ↓
Monitoring + backup procedure
```

### User features phase sau

```text
Server history UI đầy đủ
Merge local/server history hai chiều
Bookmark
Rating
Comment/moderation
Notification
```

### Chỉ bổ sung khi có nhu cầu thực tế

```text
Redis/cache riêng
Elasticsearch
Queue/background worker
Recommendation engine
PWA/offline reading
Backend service riêng
```

## 17. Tiêu chí public MVP

MVP có thể public khi:

- Core reading flow ổn định trên mobile và desktop.
- Admin quản lý/import nội dung và ảnh bìa ổn định.
- SEO metadata, robots và sitemap hoàn chỉnh.
- Production build và CI pass.
- Auth/RLS/Storage policy được kiểm tra trên production.
- Rate limit tối thiểu cho endpoint dễ bị abuse.
- Có backup database và dữ liệu nội dung.
- Có đủ truyện/chương để người dùng khám phá và đọc liên tục.

## 18. Tóm tắt

```text
Next.js fullstack monolith + Supabase/PostgreSQL/Storage + Drizzle
→ Public/User App và Admin App tách layout/quyền nhưng dùng chung dữ liệu
→ Reader + Auth + Follow/History + Admin CRUD + Bulk Import đã hoạt động
→ Cover pipeline và Statistics nhẹ đã hoạt động
→ Ưu tiên tiếp theo: SEO, security hardening, CI/deploy và vận hành production
```
