# Mộc Thư

Website đọc truyện chữ full-stack sử dụng Next.js, Neon PostgreSQL, Neon Auth,
Neon Object Storage và Drizzle ORM.

Tài liệu tiếp cận dự án đầy đủ nằm tại [AGENTS.md](./AGENTS.md).

## Yêu cầu

- Node.js `>=24 <25`
- npm `>=11`
- Neon project ở region hỗ trợ Object Storage

## Cấu hình môi trường

Sao chép `.env.example` thành `.env.local` và cấu hình:

```text
DATABASE_URL
DATABASE_URL_UNPOOLED
NEON_AUTH_BASE_URL
NEON_AUTH_COOKIE_SECRET
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_ENDPOINT_URL_S3
AWS_REGION
NEXT_PUBLIC_APP_URL
```

`DATABASE_URL` dùng pooled endpoint cho website. `DATABASE_URL_UNPOOLED` dùng
direct endpoint cho migration và backup. Toàn bộ biến `AWS_*` là credential
server-only của Neon Object Storage, tuyệt đối không đưa xuống client.

Khai báo backend nằm trong `neon.ts`. Sau khi link đúng project/branch:

```bash
neon config plan
neon deploy
```

Lệnh `neon deploy` tạo bucket `story-covers` và kéo biến môi trường của branch.

## Chạy local

```bash
npm install
npm run dev
```

Mở `http://localhost:3003`.

## Kiểm tra

```bash
npm run lint
npm exec tsc -- --noEmit
npm run build
npm run test:routes
npm run test:story-cover-storage
```

Các integration test còn lại được liệt kê trong `package.json` và `AGENTS.md`.

## Admin

Tạo hoặc đăng ký user bằng Neon Auth, sau đó cấp quyền Admin ở server:

```bash
npm run set-admin -- admin@example.com
```

Mọi mutation Admin đều phải gọi `requireAdmin()` trên server. Không cấp quyền
Admin hoặc thao tác Object Storage trực tiếp từ browser.
