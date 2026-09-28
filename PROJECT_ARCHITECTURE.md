# STORY WEB — KIẾN TRÚC & KẾ HOẠCH TRIỂN KHAI

> Tài liệu này mô tả ngắn gọn kiến trúc, phạm vi, cấu trúc dữ liệu và lộ trình phát triển của dự án web đọc **truyện chữ**.  
> Mục tiêu: một developer mới chỉ cần đọc file này là hiểu dự án đang xây gì, dùng công nghệ gì và nên làm tiếp phần nào.

---

## 1. Mục tiêu dự án

Xây dựng website Mộc Thư chữ tiếng Việt, tham khảo mô hình nội dung của WebNovel.vn nhưng không sao chép giao diện.

Core flow:

```text
Trang chủ
  ↓
Tìm kiếm / Thể loại / Danh sách truyện
  ↓
Chi tiết truyện
  ↓
Danh sách chương
  ↓
Đọc chương
  ↓
Chương tiếp theo
```

Ưu tiên hiện tại:

1. Chi phí vận hành ban đầu gần bằng `0`.
2. SEO tốt.
3. Trải nghiệm đọc tốt trên mobile.
4. Code đơn giản, dễ bảo trì.
5. Có thể nâng cấp backend/hạ tầng sau khi có traffic.

---

## 2. Phạm vi MVP

### Có trong MVP

- Trang chủ.
- Danh sách truyện.
- Truyện mới cập nhật.
- Truyện mới đăng.
- Truyện hoàn thành.
- Truyện nổi bật / xem nhiều.
- Danh sách thể loại.
- Tìm kiếm truyện.
- Trang chi tiết truyện.
- Danh sách chương.
- Trang đọc chương.
- Previous / Next chapter.
- Reader settings.
- Lịch sử đọc cho guest bằng `localStorage`.
- Admin CRUD truyện.
- Admin CRUD chương.
- CRUD tác giả / thể loại.
- Bulk import chương.
- SEO metadata.
- Sitemap.
- Responsive mobile / desktop.

### Làm sau MVP

- Đăng ký / đăng nhập.
- Theo dõi truyện.
- Đồng bộ lịch sử đọc.
- Bookmark.
- Rating.
- Comment.
- Notification.
- PWA / offline reading.
- Recommendation engine.

---

## 3. Tech stack

### Application

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
```

Next.js đảm nhiệm cả:

```text
Frontend
Server Components
Route Handlers / API
Admin
SEO
```

Hiện tại **không tách NestJS backend**.

### Database

```text
Supabase PostgreSQL
```

### ORM

```text
Drizzle ORM
```

### Validation

```text
Zod
```

### Authentication

```text
Supabase Auth
```

Auth được chuẩn bị từ đầu nhưng chưa phải chức năng ưu tiên của MVP.

### Storage

Giai đoạn đầu:

```text
Supabase Storage
```

Chỉ dùng cho:

- cover truyện;
- avatar nếu sau này cần.

Nội dung chương được lưu trong PostgreSQL, không lưu thành file.

### Hosting

```text
Vercel
```

### DNS / CDN

Sau khi có domain:

```text
Cloudflare
```

---

## 4. Kiến trúc hệ thống

```text
                       User
                        │
                        ▼
                  Cloudflare
                  (sau này)
                        │
                        ▼
              ┌──────────────────┐
              │      Vercel      │
              │                  │
              │     Next.js      │
              │                  │
              │ Frontend + API   │
              │ Admin + SEO      │
              └────────┬─────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
┌───────────────────┐    ┌───────────────────┐
│ Supabase Postgres │    │ Supabase Storage  │
│                   │    │                   │
│ Story             │    │ Story Covers      │
│ Chapter           │    │ Avatars           │
│ Genre             │    │                   │
│ Author            │    └───────────────────┘
│ History           │
│ User              │
└───────────────────┘
```

Không dùng ở giai đoạn hiện tại:

```text
Redis
NestJS
Elasticsearch
Kafka
RabbitMQ
Docker production
Microservices
```

Chỉ bổ sung khi có nhu cầu thực tế.

---

## 5. Kiến trúc code

Dự án dùng một Next.js application.

```text
story-web/
│
├── src/
│   │
│   ├── app/
│   │   │
│   │   ├── (site)/
│   │   │   ├── page.tsx
│   │   │   │
│   │   │   ├── truyen/
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── chuong-[chapter]/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── the-loai/
│   │   │   ├── truyen-moi/
│   │   │   ├── moi-cap-nhat/
│   │   │   ├── truyen-hot/
│   │   │   ├── truyen-full/
│   │   │   └── tim-kiem/
│   │   │
│   │   ├── admin/
│   │   │
│   │   └── api/
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── story/
│   │   ├── reader/
│   │   ├── search/
│   │   └── ui/
│   │
│   ├── db/
│   │   ├── schema.ts
│   │   └── index.ts
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   ├── validation/
│   │   └── utils/
│   │
│   └── types/
│
├── drizzle/
├── public/
├── .env.local
├── .env.example
├── drizzle.config.ts
├── package.json
└── README.md
```

---

## 6. Routing chính

```text
/
```

Trang chủ.

```text
/truyen-moi
/moi-cap-nhat
/truyen-hot
/truyen-full
```

Danh sách truyện.

```text
/the-loai
/the-loai/[slug]
```

Danh mục / thể loại.

```text
/tim-kiem?q=...
```

Tìm kiếm.

```text
/truyen/[slug]
```

Chi tiết truyện.

Ví dụ:

```text
/truyen/pham-nhan-tu-tien
```

Trang đọc:

```text
/truyen/[slug]/chuong-[chapter]
```

Ví dụ:

```text
/truyen/pham-nhan-tu-tien/chuong-100
```

Admin:

```text
/admin
/admin/stories
/admin/stories/new
/admin/stories/[id]
/admin/stories/[id]/chapters
```

---

## 7. Database schema

Các bảng chính:

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

Có thể bổ sung sau:

```text
bookmarks
ratings
comments
notifications
```

---

## 8. `stories`

Chứa metadata của một truyện.

Các field chính:

```text
id
title
slug
original_title
description
cover_url

author_id

status

total_chapters

view_count
follow_count

rating_avg
rating_count

latest_chapter_id
latest_chapter_at

published_at
created_at
updated_at
```

Status:

```text
ONGOING
COMPLETED
HIATUS
```

`slug` phải unique.

Ví dụ:

```text
title: Phàm Nhân Tu Tiên
slug: pham-nhan-tu-tien
```

---

## 9. `authors`

```text
id
name
slug
description
created_at
updated_at
```

Một truyện MVP được gắn một tác giả chính.

Nếu sau này cần nhiều tác giả / truyện, tạo bảng:

```text
story_authors
```

---

## 10. `genres`

```text
id
name
slug
description
```

Ví dụ:

```text
Tiên Hiệp
Huyền Huyễn
Kiếm Hiệp
Đô Thị
Ngôn Tình
Xuyên Không
Trọng Sinh
Khoa Huyễn
Lịch Sử
```

Quan hệ nhiều-nhiều:

```text
stories
   │
   ▼
story_genres
   │
   ▼
genres
```

---

## 11. `chapters`

Đây là bảng dữ liệu lớn nhất của hệ thống.

```text
id
story_id

chapter_number
title
slug

content
word_count

view_count

published_at
created_at
updated_at
```

`chapter_number` nên là kiểu numeric thay vì integer để có thể hỗ trợ:

```text
1
2
2.5
3
```

---

## 12. Nội dung chương

Nội dung chương được lưu trực tiếp trong PostgreSQL:

```text
chapters.content
```

Ưu tiên lưu:

```text
plain text
```

hoặc:

```text
Markdown
```

Không lưu HTML từ nguồn bên ngoài mà chưa sanitize.

Ví dụ nội dung chuẩn:

```markdown
Hàn Lập đứng trước cánh cửa đá.

Hắn chậm rãi đưa tay lên.

“Đây là nơi nào?”
```

Khi render:

```text
Markdown / Text
      ↓
Sanitize
      ↓
HTML
      ↓
Reader
```

---

## 13. Trang chủ

Các block dự kiến:

```text
Header
Search
Featured / Đề cử

Mới lên chương
Truyện mới
Truyện hot

Bảng xếp hạng
Truyện hoàn thành

Genres
Footer
```

Ưu tiên hiển thị nội dung hơn hiệu ứng.

---

## 14. Trang chi tiết truyện

Hiển thị:

```text
Cover

Tên truyện
Tác giả
Thể loại
Trạng thái

Số chương
Lượt đọc

Mô tả

Đọc từ đầu
Đọc tiếp

Danh sách chương
```

Nếu user có lịch sử:

```text
Đọc tiếp chương X
```

Nếu chưa:

```text
Đọc từ đầu
```

---

## 15. Reader

Reader là phần UX quan trọng nhất.

Layout desktop:

```text
max-width: khoảng 700–850px
```

Không kéo text full màn hình.

Reader hỗ trợ:

```text
Previous chapter
Next chapter

Font size
Line height
Content width

Light theme
Sepia theme
Dark theme
Black theme
```

Reader settings được lưu vào:

```text
localStorage
```

Không cần lưu database.

Ví dụ:

```json
{
  "fontSize": 20,
  "lineHeight": 1.9,
  "theme": "sepia",
  "width": 760
}
```

---

## 16. Reading history

### Guest

Lưu trong:

```text
localStorage
```

Ví dụ:

```json
[
  {
    "storySlug": "pham-nhan-tu-tien",
    "chapter": 128,
    "updatedAt": 123456789
  }
]
```

Không bắt buộc user đăng nhập để có lịch sử đọc.

### Logged-in user

Sau MVP, lưu database:

```text
reading_history
```

Field:

```text
user_id
story_id
chapter_id
progress
last_read_at
```

Unique:

```text
user_id + story_id
```

Khi login có thể merge local history vào server.

---

## 17. Search

Giai đoạn đầu dùng PostgreSQL.

Search theo:

```text
story.title
story.original_title
author.name
```

Có thể bật PostgreSQL extension:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

Index:

```sql
CREATE INDEX stories_title_trgm
ON stories
USING gin(title gin_trgm_ops);
```

Chưa cần Elasticsearch.

---

## 18. Search autocomplete

Flow:

```text
User nhập từ khóa
       ↓
debounce ~300ms
       ↓
GET /api/search?q=...
       ↓
PostgreSQL
       ↓
5–10 kết quả
```

---

## 19. Admin

Admin MVP gồm:

```text
Dashboard

Stories
Chapters
Genres
Authors
```

### Story CRUD

Form:

```text
Tên truyện
Slug
Tên gốc
Tác giả
Cover
Mô tả
Thể loại
Trạng thái
```

### Chapter CRUD

Form:

```text
Truyện
Số chương
Tên chương
Nội dung
Ngày publish
```

---

## 20. Bulk import chapter

Đây là chức năng admin quan trọng.

Input có thể là:

```text
001.txt
002.txt
003.txt
```

hoặc một file lớn:

```text
story.txt
```

Format:

```text
Chương 1: Khởi đầu

Nội dung...


Chương 2: Trở về

Nội dung...
```

Flow:

```text
Upload
  ↓
Parse
  ↓
Detect chapters
  ↓
Preview
  ↓
Confirm
  ↓
Insert database
```

Không insert trực tiếp trước khi admin preview.

---

## 21. API / Server logic

Vì đây là Next.js fullstack, Server Components có thể query database trực tiếp.

Ưu tiên:

```text
Server Component
      ↓
Drizzle
      ↓
PostgreSQL
```

Không cần vòng:

```text
Server Component
      ↓ HTTP
/api/...
      ↓
PostgreSQL
```

Route Handlers/API dùng cho những thao tác từ client như:

```text
Search autocomplete
History
Follow
Admin mutations
Auth
```

Ví dụ:

```text
GET  /api/search?q=
POST /api/history

POST /api/admin/stories
PATCH /api/admin/stories/:id

POST /api/admin/chapters
PATCH /api/admin/chapters/:id
```

---

## 22. Supabase

Supabase được sử dụng cho:

```text
PostgreSQL
Auth
Storage
```

Environment:

```env
DATABASE_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Secret/private credentials không được commit lên Git.

`.env.local` nằm trong `.gitignore`.

---

## 23. Database migration

Schema được quản lý bằng Drizzle.

Flow khi thay schema:

```text
src/db/schema.ts
       ↓
db:generate
       ↓
migration file
       ↓
db:migrate
       ↓
Supabase PostgreSQL
```

Không sửa production schema thủ công nếu có thể tránh.

---

## 24. SEO

SEO là yêu cầu quan trọng của dự án.

Mỗi story có URL:

```text
/truyen/[slug]
```

Mỗi chapter:

```text
/truyen/[slug]/chuong-[chapter]
```

Trang story cần:

```text
title
description
canonical
OpenGraph
structured data
```

Trang chapter:

```text
Story Name - Chương X
```

Cần sitemap:

```text
/sitemap.xml
```

Khi số lượng chapter lớn sẽ chia:

```text
/sitemap-stories.xml
/sitemap-genres.xml
/sitemap-chapters-1.xml
/sitemap-chapters-2.xml
```

---

## 25. Performance

Các nguyên tắc:

- Dùng Server Components khi hợp lý.
- Không fetch API nội bộ nếu có thể query DB trực tiếp.
- Pagination danh sách chương.
- Không render hàng nghìn chapter trong một page.
- Cache các listing ít thay đổi.
- Optimize cover image.
- Hạn chế JavaScript trên trang reader.

Reader cần tải nhanh và ít distraction.

---

## 26. Mobile-first

Web Mộc Thư dự kiến có lượng mobile lớn.

Ưu tiên:

```text
responsive
tap target đủ lớn
font dễ đọc
dark mode
reader toolbar đơn giản
```

Mobile navigation có thể dùng:

```text
Home
Search
History
Following
Account
```

---

## 27. Security cơ bản

Cần đảm bảo:

```text
Validate input bằng Zod
Sanitize chapter content
Không expose private Supabase keys
Admin authorization
Rate limit login/search nếu cần
Upload validation
SQL query parameterized qua ORM
```

Admin route phải được bảo vệ khi Auth được triển khai.

---

## 28. Các thứ chưa làm ở giai đoạn hiện tại

Không triển khai sớm:

```text
Microservices
NestJS backend riêng
Redis
Queue
Elasticsearch
Recommendation AI
Realtime comment
Complex analytics
```

Nguyên tắc:

> Chỉ thêm infrastructure khi hệ thống hiện tại thực sự gặp giới hạn.

---

## 29. Lộ trình triển khai

### Phase 1 — Foundation

```text
Next.js skeleton
Tailwind
Supabase
Drizzle
Database schema
```

**Trạng thái: đang triển khai.**

---

### Phase 2 — Story Core

```text
Homepage
Story listing
Genre
Story detail
Chapter list
```

---

### Phase 3 — Reader

```text
Chapter page
Previous / Next
Reader settings
Guest reading history
```

Sau phase này core reading flow phải hoàn chỉnh.

---

### Phase 4 — Admin

```text
Story CRUD
Chapter CRUD
Genre CRUD
Author CRUD
Bulk chapter import
Cover upload
```

---

### Phase 5 — Discovery

```text
Search
Autocomplete
Latest updated
New stories
Hot
Completed
Ranking
```

---

### Phase 6 — SEO & Production

```text
Metadata
Canonical
Structured data
Sitemap
Performance check
Deploy Vercel
Cloudflare/domain
```

Sau Phase 6 có thể public MVP.

---

### Phase 7 — User Features

```text
Supabase Auth
Follow
Server reading history
Bookmark
Rating
Comment
Profile
```

---

## 30. Tiêu chí hoàn thành MVP

MVP được coi là usable khi user có thể:

```text
Mở website
   ↓
Tìm thấy truyện
   ↓
Xem thông tin truyện
   ↓
Chọn chương
   ↓
Đọc thoải mái trên mobile/desktop
   ↓
Chuyển chương trước/sau
   ↓
Thoát website
   ↓
Quay lại và tiếp tục chương đang đọc
```

Admin phải có thể:

```text
Tạo truyện
Tạo / sửa chương
Import nhiều chương
Quản lý thể loại
Quản lý tác giả
Upload cover
```

---

## 31. Nguyên tắc phát triển

1. **Reader trước social features.**
2. **SEO trước các tính năng trang trí.**
3. **Server Components trước client-side fetch khi phù hợp.**
4. **PostgreSQL trước search engine riêng.**
5. **Monolith trước microservices.**
6. **Free tier trước hạ tầng trả phí.**
7. **Đơn giản trước tối ưu sớm.**
8. Mọi thay đổi database đi qua migration.
9. Không commit secrets.
10. Mỗi feature phải hoạt động tốt trên mobile.

---

## 32. Trạng thái hiện tại

Đã định hướng / chuẩn bị:

```text
✓ Next.js architecture
✓ TypeScript
✓ Tailwind
✓ Supabase project
✓ PostgreSQL
✓ Drizzle ORM
✓ Initial database entities
```

Bước đang làm:

```text
Kết nối Supabase
       ↓
Generate migration
       ↓
Migrate database
       ↓
Xác nhận tables
```

Sau đó:

```text
Seed dữ liệu mẫu
       ↓
Homepage
       ↓
Story detail
       ↓
Reader
```

---

## 33. Tóm tắt một dòng

```text
Next.js fullstack + Supabase PostgreSQL + Drizzle
→ xây web Mộc Thư chữ tối ưu Reader + SEO
→ chạy free-tier trước
→ chỉ tách backend / thêm cache khi traffic thực sự yêu cầu.
```
