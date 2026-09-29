# Mộc Thư - Workspace Rules

## 1. Công nghệ & Stack
- **Framework**: Next.js 15 (App Router). Ưu tiên Server Components, chỉ dùng Client Components (`"use client"`) khi thực sự cần thiết (ví dụ: hooks, events).
- **Database**: PostgreSQL (qua Supabase) + Drizzle ORM.
- **Styling**: Tailwind CSS v4. Không dùng các class tiện ích tự chế nếu Tailwind đã hỗ trợ.
- **UI/UX**: 
  - Màu chủ đạo (Brand color): `#0f766e` (teal-700)
  - Font chữ: `Inter` (qua `next/font/google`, subset latin, vietnamese)
  - Icon: Chỉ dùng `lucide-react`, không dùng emoji hay thư viện icon khác.

## 2. Best Practices về Hiệu năng (Performance)
- **Truy vấn Database**: 
  - Luôn kiểm tra khả năng chạy song song (`Promise.all`) trước khi chạy tuần tự các query độc lập.
  - Sử dụng hàm `cache()` của React cho các Data Fetching Functions để tránh truy vấn thừa (Double-fetch) giữa `generateMetadata` và Page Component.
  - Giới hạn số lượng trả về (ví dụ `.limit(500)`) khi truy vấn tập dữ liệu lớn.
- **Caching & Caching Strategy**:
  - Tận dụng tối đa Incremental Static Regeneration (ISR) bằng cách export hằng số `revalidate` ở đầu trang (ví dụ `export const revalidate = 300`). 
  - Tránh dynamic rendering toàn bộ trang nếu chỉ 1 phần nhỏ thay đổi (nếu có thể).
- **Resource Loading**:
  - Prefetch các route quan trọng nếu biết người dùng sẽ click tiếp (ví dụ chapter kế tiếp).

## 3. Ngôn ngữ & Giao tiếp
- Luôn trả lời bằng **Tiếng Việt**.
- Mọi ghi chú (comments) trong code thêm mới đều phải dùng **Tiếng Việt**.
- Giải thích code ngắn gọn, tập trung vào "Tại sao lại sửa thế này" hơn là "Sửa cái gì".
