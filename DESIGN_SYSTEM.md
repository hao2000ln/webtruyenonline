# DESIGN SYSTEM — WEB ĐỌC TRUYỆN CHỮ

Tài liệu này định nghĩa màu sắc, typography, spacing, kích thước component và token UI dùng xuyên suốt dự án.

## 1. Color System

```css
:root {
  --color-primary: #0f766e;
  --color-primary-hover: #115e59;
  --color-primary-soft: #ccfbf1;

  --color-accent: #d97706;
  --color-accent-soft: #fef3c7;

  --color-background: #f8fafc;
  --color-surface: #ffffff;

  --color-text: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #94a3b8;

  --color-border: #e2e8f0;

  --color-success: #16a34a;
  --color-danger: #dc2626;
}
```

Quy ước:
- Primary `#0F766E`: action chính, link active, button chính.
- Accent `#D97706`: HOT, TOP, rating, highlight.
- Background `#F8FAFC`.
- Surface `#FFFFFF`.
- Text chính `#0F172A`.
- Text phụ `#475569`.
- Text muted `#94A3B8`.
- Border `#E2E8F0`.

Tỷ lệ màu tham khảo:

```text
75% neutral / trắng
20% gray / text
5% primary + accent
```

## 2. Typography

Font toàn site:

```css
font-family: "Inter", sans-serif;
```

Body mặc định:

```css
body {
  font-size: 15px;
  line-height: 1.6;
  font-weight: 400;
}
```

| Thành phần | Font size | Weight | Line-height |
|---|---:|---:|---:|
| H1 page title | 32px | 700 | 1.25 |
| H2 section title | 24px | 700 | 1.3 |
| H3 box/card title | 18px | 600 | 1.4 |
| Story title lớn | 28px | 700 | 1.3 |
| Story card title | 16px | 600 | 1.4 |
| Chapter title | 15px | 500 | 1.5 |
| Body | 15px | 400 | 1.65 |
| Description | 14px | 400 | 1.65 |
| Metadata | 13px | 400–500 | 1.5 |
| Badge | 11–12px | 600 | 1 |
| Button | 14px | 600 | 1 |
| Navigation | 14px | 500 | 1 |

## 3. Header

```css
.site-logo {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-primary);
}

.nav-link {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.nav-link:hover,
.nav-link.active {
  color: var(--color-primary);
}

.nav-link.active {
  font-weight: 600;
}

.search-input {
  height: 40px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}
```

## 4. Section Title

```css
.section-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text);
}

.section-indicator {
  width: 4px;
  height: 20px;
  border-radius: 999px;
  background: var(--color-primary);
}

@media (max-width: 768px) {
  .section-title {
    font-size: 18px;
  }
}
```

## 5. Story Card

```css
.story-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.story-card:hover {
  border-color: #99f6e4;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
}

.story-card-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-text);

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.story-card-title:hover {
  color: var(--color-primary);
}
```

Metadata:

```css
.story-author {
  font-size: 13px;
  font-weight: 400;
  color: #64748b;
}

.story-chapter {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
}

.story-time {
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-muted);
}

.story-views {
  font-size: 12px;
  font-weight: 400;
  color: #64748b;
}
```

## 6. Cover Sizes

```css
.story-cover-grid {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 8px;
}

.story-cover-horizontal {
  width: 80px;
  height: 110px;
  object-fit: cover;
  border-radius: 8px;
}

.story-cover-detail {
  width: 220px;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 12px;
}
```

## 7. Box / Panel

```css
.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--color-text);
}

@media (max-width: 768px) {
  .panel {
    padding: 16px;
  }
}
```

## 8. Ranking

```css
.rank-number {
  font-size: 14px;
  font-weight: 700;
}

.rank-number--1 {
  color: #d97706;
}

.rank-number--top {
  color: #64748b;
}

.rank-number--normal {
  color: #94a3b8;
}

.rank-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}
```

## 9. Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  padding: 4px 7px;
  border-radius: 999px;
}

.badge--full {
  background: #dcfce7;
  color: #15803d;
}

.badge--hot {
  background: #fef3c7;
  color: #b45309;
}

.badge--ongoing {
  background: #ccfbf1;
  color: #0f766e;
}
```

## 10. Buttons

```css
.button-primary {
  height: 40px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: 14px;
  font-weight: 600;

  color: #fff;
  background: var(--color-primary);

  border-radius: 8px;
  border: 0;
}

.button-primary:hover {
  background: var(--color-primary-hover);
}

.button-lg {
  height: 44px;
  padding: 0 20px;
}

.button-secondary {
  height: 40px;
  padding: 0 16px;

  font-size: 14px;
  font-weight: 600;

  color: #334155;
  background: #fff;

  border: 1px solid #cbd5e1;
  border-radius: 8px;
}
```

## 11. Story Detail

```css
.story-detail-title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text);
}

.story-detail-meta {
  font-size: 14px;
  font-weight: 400;
  color: #64748b;
}

.story-description {
  font-size: 15px;
  line-height: 1.75;
  color: #334155;
}

@media (max-width: 768px) {
  .story-detail-title {
    font-size: 22px;
  }
}
```

## 12. Chapter List

```css
.chapter-row {
  min-height: 46px;
  border-bottom: 1px solid #f1f5f9;
}

.chapter-row:hover {
  background: #f8fafc;
}

.chapter-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.chapter-date {
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-muted);
}
```

## 13. Reader Typography

```css
.reader-title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.35;
  text-align: center;
}

.reader-content {
  max-width: 760px;
  margin: 0 auto;

  font-size: 20px;
  font-weight: 400;
  line-height: 1.9;
}

.reader-content p {
  margin-bottom: 1.35em;
}

@media (max-width: 768px) {
  .reader-title {
    font-size: 24px;
  }
}
```

Reader settings:

```ts
export const READER_FONT_SIZES = [16, 18, 20, 22, 24, 26] as const;

export const READER_LINE_HEIGHTS = [1.5, 1.7, 1.9, 2.1] as const;

export const READER_WIDTHS = [640, 760, 880] as const;

export const READER_THEMES = [
  "light",
  "sepia",
  "dark",
  "black",
] as const;

export const DEFAULT_READER_SETTINGS = {
  fontSize: 20,
  lineHeight: 1.9,
  contentWidth: 760,
  theme: "light",
} as const;
```

## 14. Reader Themes

```css
.reader-theme-light {
  background: #ffffff;
  color: #292524;
}

.reader-theme-sepia {
  background: #f4ecd8;
  color: #463f32;
}

.reader-theme-dark {
  background: #18181b;
  color: #d4d4d8;
}

.reader-theme-black {
  background: #000000;
  color: #d4d4d4;
}
```

## 15. Spacing

Spacing scale:

```text
4
8
12
16
20
24
32
40
48
64
```

Container:

```css
.site-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

@media (max-width: 768px) {
  .site-container {
    padding-left: 16px;
    padding-right: 16px;
  }
}
```

Section gap:

```text
Desktop: 40px
Mobile:  32px
```

## 16. Border Radius

```text
Input      8px
Button     8px
Image      8px
Card       12px
Panel      12px
Modal      16px
Badge      999px
```

## 17. Tailwind CSS 4 Tokens

```css
@theme {
  --color-brand: #0f766e;
  --color-brand-hover: #115e59;
  --color-brand-soft: #ccfbf1;

  --color-accent: #d97706;
  --color-accent-soft: #fef3c7;

  --color-page: #f8fafc;
  --color-surface: #ffffff;

  --color-content: #0f172a;
  --color-content-secondary: #475569;
  --color-content-muted: #94a3b8;

  --color-ui-border: #e2e8f0;
}
```

Ví dụ:

```tsx
<h2 className="text-xl font-bold leading-snug text-slate-900">
  Mới cập nhật
</h2>
```

```tsx
<article className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-teal-200 hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)]">
  ...
</article>
```

```tsx
<h3 className="line-clamp-2 text-base font-semibold leading-[1.4] text-slate-900 hover:text-teal-700">
  {story.title}
</h3>
```

```tsx
<button className="inline-flex h-10 items-center justify-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
  Đọc truyện
</button>
```

## 18. Responsive Rules

Mobile `< 768px`:

```text
1 column
padding 16px
section title 18px
story detail title 22px
reader title 24px
```

Tablet `768–1024px`:

```text
2 columns khi phù hợp
padding 20–24px
```

Desktop `> 1024px`:

```text
main max-width: 1200px
reader width: 640–880px
```

## 19. UI Rules

Không nên:

```text
shadow quá mạnh
gradient nhiều
quá nhiều màu
border radius quá lớn
font-weight 700 cho mọi text
body text quá nhỏ
reader full viewport width
```

Nên:

```text
spacing rõ
typography hierarchy rõ
surface trắng
border nhẹ
primary teal nhất quán
accent chỉ dùng highlight
reader ưu tiên readability
```

## 20. Quick Reference

```text
PRIMARY          #0F766E
ACCENT           #D97706
BACKGROUND       #F8FAFC
SURFACE          #FFFFFF
TEXT             #0F172A
SECONDARY TEXT   #475569
MUTED            #94A3B8
BORDER           #E2E8F0
```

```text
BODY          15px / 400 / 1.65
SECTION       20px / 700
CARD TITLE    16px / 600
META          13px / 400–500
BUTTON        14px / 600

READER        20px / 400 / 1.9
READER TITLE  28px / 700
```

## 21. Design Principle

```text
Content first
Reader first
Mobile first
Neutral first
Accent sparingly
Consistency over decoration
```
