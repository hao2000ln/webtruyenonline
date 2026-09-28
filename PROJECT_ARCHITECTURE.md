# STORY WEB — KIẾN TRÚC VÀ TRẠNG THÁI PHÁT TRIỂN

> Cập nhật: 28/09/2026
>
> Dự án: **Mộc Thư** — website đọc truyện chữ tiếng Việt
>
> Trạng thái: **đang phát triển MVP**

## 1. Mục tiêu

Xây dựng website đọc truyện chữ có trải nghiệm tốt trên mobile và desktop, ưu
tiên tốc độ, SEO, khả năng vận hành nội dung và chi phí ban đầu thấp.

Luồng chính:

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
- Không đưa secret hoặc service-role key xuống client.
- Mọi tính năng phải sử dụng tốt trên mobile.

## 2. Tech stack

```text
Next.js 16 + React 19
TypeScript strict
Tailwind CSS 4
Supabase Auth + PostgreSQL + Storage (dự kiến cho cover)
Drizzle ORM + PostgreSQL driver
Zod validation
Vercel (dự kiến deploy)
Cloudflare (dự kiến DNS/CDN)
```

Local development:

```text
http://localhost:3003
```

Hiện tại không sử dụng NestJS, Redis, Elasticsearch, queue, microservices hoặc
Docker production.

## 3. Kiến trúc ứng dụng hiện tại

Dự án là một Next.js fullstack monolith. Public/User App và Admin App nằm chung
repository, dùng chung Supabase/PostgreSQL nhưng tách layout và quyền truy cập.

```text
src/app/
├── (site)/                     Public/User App
│   ├── layout.tsx              Header + content + footer
│   ├── page.tsx                Trang chủ
│   ├── truyen/                 Chi tiết truyện + reader
│   ├── the-loai/               Danh mục thể loại
│   ├── tim-kiem/               Tìm kiếm
│   ├── lich-su/                Guest history
│   ├── dang-nhap/              User login
│   ├── dang-ky/                User registration
│   ├── tai-khoan/              User account
│   └── theo-doi/               Truyện đang theo dõi
│
├── admin/
│   ├── (auth)/login/           Admin login riêng
│   └── (dashboard)/            Sidebar + topbar + admin content
│       ├── stories/            Stories CRUD
│       ├── chapters/           Đang chờ CRUD
│       ├── authors/            Đang chờ CRUD
│       ├── genres/             Đang chờ CRUD
│       └── import/             Đang chờ Bulk Import
│
├── api/
│   ├── follows/[slug]/         Follow/unfollow
│   └── history/sync/           Sync guest history lên tài khoản
│
└── auth/confirm/               Xác nhận email Supabase SSR
```

## 4. Public/User App

Các route chính:

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

### Đã hoàn thành

- Trang chủ lấy dữ liệu thật từ PostgreSQL.
- Chi tiết truyện và danh sách chương.
- Search/filter/sort/pagination danh sách chương.
- Reader với previous/next chapter.
- Reader settings: font size, line height, content width và bốn theme.
- Guest history bằng `localStorage`.
- Tìm kiếm truyện theo tên/tác giả.
- Danh sách và chi tiết thể loại.
- User đăng ký/đăng nhập bằng Supabase Auth.
- Cookie session SSR, persist sau reload.
- Trang tài khoản và đăng xuất.
- Follow/unfollow truyện.
- Đồng bộ guest history lên `reading_history` khi user vào trang tài khoản.
- Metadata động cơ bản cho story, chapter, search và genre.

### Quyền User

- Guest luôn được đọc truyện, tìm kiếm và dùng lịch sử local.
- User đã đăng nhập chỉ được thao tác dữ liệu thuộc chính mình.
- RLS giới hạn `profiles`, `follows`, `reading_history` theo `auth.uid()`.
- Bookmark, rating và comment chưa triển khai.

## 5. Admin App

Các route:

```text
/admin/login
/admin
/admin/stories
/admin/stories/new
/admin/stories/[id]/edit
/admin/chapters
/admin/authors
/admin/genres
/admin/import
```

Admin có layout riêng gồm sidebar, topbar và content area; không sử dụng
header/footer public.

### Authentication và authorization

- Chỉ user có `app_metadata.role === "admin"` được truy cập.
- Guest vào `/admin/**` được redirect về `/admin/login`.
- User thường bị redirect về public site.
- Proxy chỉ là lớp kiểm tra sớm.
- Server layout và mọi mutation phải kiểm tra lại bằng `requireAdmin()`.
- Service-role key không được sử dụng ở client.

### Stories CRUD — đã hoàn thành

- Table dữ liệu thật bằng Drizzle.
- Hiển thị title, author, status, total chapters, views, latest chapter và actions.
- Search theo title hoặc author.
- Filter status.
- Pagination server-side, 20 truyện/trang.
- Create và edit story.
- Zod validation.
- Slug unique, kiểm tra ở application và database constraint.
- Chọn một author và nhiều genres.
- Draft/published state.
- Delete có confirmation; chapters, genres relation và dữ liệu liên quan cascade.
- Revalidate homepage, search, genre, story detail và chapter pages sau mutation.

### Admin chưa hoàn thành

- Chapters CRUD.
- Authors CRUD.
- Genres CRUD.
- Bulk chapter import có preview/confirm.
- Upload cover qua Supabase Storage.
- Dashboard statistics thật.

## 6. Database

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
authors 1 ─── n stories
stories n ─── n genres       qua story_genres
stories 1 ─── n chapters
profiles n ── n stories      qua follows
profiles 1 ── n reading_history
```

Nội dung chương lưu trực tiếp trong `chapters.content` dưới dạng plain text hoặc
Markdown đã được kiểm soát. Không lưu HTML ngoài chưa sanitize.

Migration gần nhất:

```text
0003_user_self_service_policies.sql
```

Migration này tạo profile cho Supabase Auth user mới và thêm RLS policy cho dữ
liệu cá nhân.

## 7. Cách truy cập dữ liệu

Server-rendered public/admin pages ưu tiên:

```text
Server Component
      ↓
Drizzle ORM
      ↓
Supabase PostgreSQL
```

Không gọi HTTP API nội bộ khi Server Component có thể query database trực tiếp.

Route Handlers dùng cho thao tác từ Client Component:

```text
GET/POST/DELETE /api/follows/[slug]
POST            /api/history/sync
```

Admin create/update/delete dùng Server Actions, xác thực Admin trước khi gọi
database mutation.

## 8. Reader và lịch sử đọc

Reader là phần UX quan trọng nhất:

- Nội dung giới hạn chiều rộng 640–880px.
- Cỡ chữ 16–26px.
- Line height 1.5–2.1.
- Theme light, sepia, dark và black.
- Settings và guest history không yêu cầu đăng nhập.

Guest history:

```text
localStorage → tối đa 50 truyện gần nhất
```

User history:

```text
localStorage
    ↓ đăng nhập / mở tài khoản
/api/history/sync
    ↓
reading_history
```

Server chỉ ghi lịch sử mới hơn để tránh ghi đè tiến độ mới bằng dữ liệu local cũ.

## 9. SEO và performance

Đã có:

- Server Components cho nội dung chính.
- Metadata động cơ bản.
- Homepage revalidate 60 giây.
- Pagination chapter/story admin.
- Hạn chế JavaScript trên reader ngoài settings/history.
- Local font để tránh phụ thuộc font CDN.

Chưa có:

- `robots.txt`.
- Sitemap cho stories, genres và chapters.
- Canonical đầy đủ.
- Open Graph image hoàn chỉnh.
- JSON-LD cho story/chapter.
- Đo Core Web Vitals production.

## 10. Security

- Input Admin được validate bằng Zod.
- Slug có unique index tại PostgreSQL.
- Auth user được xác minh bằng `supabase.auth.getUser()` ở server.
- Admin role lấy từ `app_metadata`, không lấy từ `user_metadata`.
- Mutation Admin gọi `requireAdmin()`.
- User data được bảo vệ bằng RLS.
- `.env.local` và secrets không commit.
- Không expose `SUPABASE_SERVICE_ROLE_KEY` ra client.

Cần bổ sung trước production:

- Rate limit login và các endpoint có thể bị abuse.
- Upload validation cho cover/import.
- Giới hạn kích thước nội dung và file import.
- Security headers phù hợp deployment.

## 11. Testing hiện tại

Scripts:

```bash
npm run lint
npx tsc --noEmit
npm run test:reader-storage
npm run test:admin-stories
npm run build
```

Stories integration test hiện kiểm tra:

```text
TC01 list dữ liệu thật
TC02 search title
TC03 search author
TC04 filter status
TC05 pagination
TC06 create
TC07 duplicate slug
TC08 edit được public query đọc thấy
TC09 đổi author/genres
TC10 delete cascade
TC11 Admin authorization boundary
```

Các fixture integration test có prefix riêng và được cleanup sau mỗi lần chạy.

Trạng thái gần nhất:

- TypeScript strict: pass.
- ESLint: pass.
- Reader storage tests: pass.
- Stories CRUD integration TC01–TC11: pass.
- Production source compilation: pass.
- Full `next build`: chưa xác nhận exit code 0 trong môi trường Codex vì sandbox
  chặn Next.js worker với `spawn EPERM`; cần chạy lại ngoài sandbox/local CI.

## 12. Đang phát triển và kế hoạch tiếp theo

### Ưu tiên 1 — Admin content operations

```text
Chapters CRUD
    ↓
Authors CRUD + Genres CRUD
    ↓
Bulk chapter import: parse → preview → confirm → insert
    ↓
Upload cover bằng Supabase Storage
```

### Ưu tiên 2 — SEO và production

```text
robots.txt
sitemap phân trang
canonical + Open Graph + JSON-LD
performance/accessibility audit
production build + deploy Vercel
domain/Cloudflare
```

### Ưu tiên 3 — User features

```text
Hiển thị server reading history đầy đủ
Merge local/server history hai chiều
Bookmark
Rating
Comment
Notification
```

### Chỉ bổ sung khi có nhu cầu thực tế

```text
Redis/cache riêng
Elasticsearch
Queue
Recommendation engine
PWA/offline reading
Backend service riêng
```

## 13. Tiêu chí MVP public

MVP có thể public khi:

- Core reading flow ổn định trên mobile và desktop.
- Admin có thể tạo/sửa truyện và quản lý/import chương.
- Cover upload hoạt động.
- SEO metadata, robots và sitemap hoàn chỉnh.
- Production build và deployment pass.
- Auth/RLS được kiểm tra trên môi trường production.
- Có dữ liệu nội dung đủ để người dùng khám phá và đọc liên tục.

## 14. Tóm tắt một dòng

```text
Next.js fullstack + Supabase/PostgreSQL + Drizzle
→ Public/User App và Admin App tách layout/quyền
→ Core Reader + Auth + Follow/History + Stories CRUD đã hoạt động
→ Đang ưu tiên Chapters CRUD, Bulk Import, Storage và SEO để public MVP.
```
