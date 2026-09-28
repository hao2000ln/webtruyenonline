# Story Web

MVP web Mộc Thư dùng Next.js + Supabase PostgreSQL + Drizzle.

## 1. Yêu cầu môi trường

- Node.js 24 LTS
- npm 11 trở lên
- Một Supabase project dùng PostgreSQL, Auth và Storage

Kiểm tra phiên bản:

```bash
node --version
npm --version
```

Nếu dùng NVM trên macOS/Linux, chạy `nvm use` để sử dụng phiên bản trong `.nvmrc`. Với nvm-windows, chạy `nvm use 24`.

## 2. Cài dependencies

```bash
npm install
```

Trên Windows PowerShell, nếu `npm.ps1` bị chặn bởi execution policy, dùng:

```powershell
npm.cmd install
```

## 3. Environment

```bash
cp .env.example .env.local
```

Điền các biến bắt buộc:

```env
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3003
```

`SUPABASE_SERVICE_ROLE_KEY` chỉ dùng ở server khi có nghiệp vụ cần quyền quản trị. Không đưa key này vào client hoặc đặt tiền tố `NEXT_PUBLIC_`.

Không commit `.env.local` hoặc bất kỳ secret thật nào. `.env.example` chỉ chứa placeholder.

## 4. Generate migration

```bash
npm run db:generate
npm run db:migrate
```

## 5. Chạy local

```bash
npm run dev
```

Mở http://localhost:3003

## 6. Tạo tài khoản Admin

Tạo user email/password trong Supabase Auth, sau đó gán role vào `app_metadata`
bằng SQL Editor (thay email mẫu bằng email quản trị thật):

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where email = 'admin@example.com';
```

Đăng nhập tại `http://localhost:3003/admin/login`. Ứng dụng chỉ đọc role từ
`app_metadata`, không dùng `user_metadata` để phân quyền và không đưa
`SUPABASE_SERVICE_ROLE_KEY` xuống client.

## 7. Xác nhận email cho tài khoản độc giả

Trong Supabase Dashboard, đặt **Site URL** đúng với `NEXT_PUBLIC_APP_URL` và
đổi template **Confirm signup** sang đường dẫn SSR:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
  Xác nhận email
</a>
```

Migration `0003_user_self_service_policies.sql` tạo profile khi user đăng ký và
giới hạn `profiles`, `reading_history`, `follows` theo `auth.uid()`.

## Cấu trúc ứng dụng

Public/User App dùng layout header + content + footer:

- `/`
- `/truyen/[slug]`
- `/truyen/[slug]/chuong-[chapter]`
- `/the-loai`
- `/tim-kiem`
- `/lich-su`
- `/dang-nhap`
- `/dang-ky`
- `/tai-khoan`
- `/theo-doi`

Admin App dùng layout sidebar + topbar riêng:

- `/admin`
- `/admin/login`
- `/admin/stories`
- `/admin/chapters`
- `/admin/authors`
- `/admin/genres`
- `/admin/import`

Mọi Server Action hoặc Route Handler thay đổi dữ liệu Admin phải gọi
`requireAdmin()` trước khi thực hiện mutation. Không dựa riêng vào Proxy hoặc
trạng thái ẩn/hiện của giao diện.

Stories CRUD hiện có tại `/admin/stories`, gồm tìm kiếm, lọc trạng thái, phân
trang, tạo, sửa và xóa. Chạy integration test bằng:

```bash
npm run test:admin-stories
```
