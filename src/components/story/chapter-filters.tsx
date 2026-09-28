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
    <form
      ref={formRef}
      action={pathname}
      method="get"
      className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
          🔍
        </span>
        <label htmlFor="chapter-query" className="sr-only">
          Tìm theo số chương hoặc tiêu đề
        </label>
        <input
          id="chapter-query"
          name="q"
          type="search"
          defaultValue={query}
          maxLength={100}
          placeholder="Nhập số chương hoặc tiêu đề..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/15"
        />
      </div>

      <div className="w-full sm:w-48">
        <label htmlFor="chapter-sort" className="sr-only">
          Sắp xếp chương
        </label>
        <select
          id="chapter-sort"
          name="sort"
          defaultValue={sort}
          onChange={() => formRef.current?.requestSubmit()}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/15"
        >
          <option value="newest">Chương mới nhất</option>
          <option value="oldest">Chương cũ nhất</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#0f766e] px-6 text-sm font-bold text-white shadow-xs transition hover:bg-[#115e59] active:scale-98"
        >
          <span>▼</span>
          <span>Tìm chương</span>
        </button>
        {query ? (
          <Link
            href={resetHref}
            className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Xóa lọc
          </Link>
        ) : null}
      </div>
    </form>
  );
}
