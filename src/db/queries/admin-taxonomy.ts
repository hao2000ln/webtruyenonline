import { asc, count, eq, ilike, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { authors, genres, stories, storyGenres } from "@/db/schema";

export const ADMIN_TAXONOMY_PAGE_SIZE = 10;
export const ADMIN_TAXONOMY_PAGE_SIZES = [10, 20, 30, 50, 100] as const;
type TaxonomyKind = "authors" | "genres";
const tableFor = (kind: TaxonomyKind) => kind === "authors" ? authors : genres;

export async function getAdminTaxonomy(kind: TaxonomyKind, query: string, requestedPage: number, pageSize = ADMIN_TAXONOMY_PAGE_SIZE) {
  const normalizedPageSize = ADMIN_TAXONOMY_PAGE_SIZES.includes(pageSize as (typeof ADMIN_TAXONOMY_PAGE_SIZES)[number]) ? pageSize : ADMIN_TAXONOMY_PAGE_SIZE;
  const table = tableFor(kind); const normalizedQuery = query.trim().slice(0, 100); const where: SQL | undefined = normalizedQuery ? ilike(table.name, `%${normalizedQuery}%`) : undefined;
  const [totalRow] = await db.select({ value: count() }).from(table).where(where); const total = totalRow?.value ?? 0; const totalPages = Math.max(1, Math.ceil(total / normalizedPageSize)); const requested = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1; const page = Math.min(requested, totalPages);
  const rows = await db.select({ id: table.id, name: table.name, slug: table.slug, description: table.description, createdAt: table.createdAt }).from(table).where(where).orderBy(asc(table.name)).limit(normalizedPageSize).offset((page - 1) * normalizedPageSize);
  return { rows, query: normalizedQuery, page, total, totalPages, pageSize: normalizedPageSize };
}

export async function getAdminTaxonomyItem(kind: TaxonomyKind, id: string) { const table = tableFor(kind); const [row] = await db.select().from(table).where(eq(table.id, id)).limit(1); return row ?? null; }
export async function isTaxonomySlugTaken(kind: TaxonomyKind, slug: string, exceptId?: string) { const table = tableFor(kind); const [row] = await db.select({ id: table.id }).from(table).where(exceptId ? eq(table.slug, slug) : eq(table.slug, slug)).limit(1); return Boolean(row && row.id !== exceptId); }
export async function getStoryCountForTaxonomy(kind: TaxonomyKind, id: string) { if (kind === "authors") { const [row] = await db.select({ value: count() }).from(stories).where(eq(stories.authorId, id)); return row?.value ?? 0; } const [row] = await db.select({ value: count() }).from(storyGenres).where(eq(storyGenres.genreId, id)); return row?.value ?? 0; }
