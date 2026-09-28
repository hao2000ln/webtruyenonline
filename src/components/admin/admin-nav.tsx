"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Dashboard", icon: "D" },
  { href: "/admin/stories", label: "Truyện", icon: "T" },
  { href: "/admin/chapters", label: "Chương", icon: "C" },
  { href: "/admin/authors", label: "Tác giả", icon: "A" },
  { href: "/admin/genres", label: "Thể loại", icon: "G" },
  { href: "/admin/import", label: "Bulk Import", icon: "I" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function AdminNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={mobile ? "flex min-w-max gap-2 px-4 py-3" : "space-y-1"}
      aria-label="Điều hướng quản trị"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg text-sm font-semibold transition ${
              mobile ? "px-3 py-2" : "px-3 py-2.5"
            } ${
              active
                ? "bg-teal-50 text-teal-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                active ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"
              }`}
              aria-hidden="true"
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
