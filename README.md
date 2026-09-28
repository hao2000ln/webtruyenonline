# Story Web

MVP web đọc truyện chữ dùng Next.js + Supabase PostgreSQL + Drizzle.

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
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
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

Mở http://localhost:3000

## Routes ban đầu

- `/`
- `/truyen/[slug]`
- `/truyen/[slug]/chuong-[chapter]`
- `/the-loai`
- `/tim-kiem`
- `/admin`
