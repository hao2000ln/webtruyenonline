import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pathname: string;
  params?: Record<string, string>;
  alwaysShow?: boolean;
};

export function Pagination({ currentPage, totalPages, pathname, params = {}, alwaysShow = false }: PaginationProps) {
  if (totalPages <= 1 && !alwaysShow) return null;

  const getHref = (page: number) => {
    const searchParams = new URLSearchParams(params);
    if (page > 1) searchParams.set("page", String(page));
    else searchParams.delete("page");
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Phân trang">
      {currentPage > 1 ? (
        <Link href={getHref(currentPage - 1)} className="button-secondary">
          ← Trang trước
        </Link>
      ) : <span className="text-sm text-content-muted">← Trang trước</span>}
      <span className="text-sm font-semibold text-content-secondary">Trang {currentPage} / {totalPages}</span>
      {currentPage < totalPages ? (
        <Link href={getHref(currentPage + 1)} className="button-primary">
          Trang sau →
        </Link>
      ) : <span className="text-sm text-content-muted">Trang sau →</span>}
    </nav>
  );
}
