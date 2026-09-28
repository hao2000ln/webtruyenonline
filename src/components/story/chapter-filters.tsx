"use client";

import Link from "next/link";
import { useRef } from "react";
import type { ChapterSort } from "@/db/queries/stories";

type ChapterFiltersProps = {
  pathname: string;
  query: string;
  sort: ChapterSort;
};

export function ChapterFilters({ pathname, query, sort }: ChapterFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const resetHref = `${pathname}?sort=${sort}`;

  return (
    <form ref={formRef} action={pathname} method="get" className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px_auto]">
      <div>
        <label htmlFor="chapter-query" className="sr-only">Tìm theo số chương hoặc tiêu đề</label>
        <input
          id="chapter-query"
          name="q"
          type="search"
          defaultValue={query}
          maxLength={100}
          placeholder="Nhập số chương hoặc tiêu đề..."
          className="h-10 w-full rounded-lg border border-ui-border bg-white px-3 text-sm outline-none transition placeholder:text-content-muted focus:border-primary focus:ring-2 focus:ring-teal-600/15"
        />
      </div>
      <div>
        <label htmlFor="chapter-sort" className="sr-only">Sắp xếp chương</label>
        <select
          id="chapter-sort"
          name="sort"
          defaultValue={sort}
          onChange={() => formRef.current?.requestSubmit()}
          className="h-10 w-full rounded-lg border border-ui-border bg-white px-3 text-sm text-content-secondary outline-none transition focus:border-primary focus:ring-2 focus:ring-teal-600/15"
        >
          <option value="newest">Chương mới nhất</option>
          <option value="oldest">Chương cũ nhất</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="button-primary flex-1 sm:flex-none">Tìm chương</button>
        {query ? <Link href={resetHref} className="button-secondary">Xóa lọc</Link> : null}
      </div>
    </form>
  );
}
