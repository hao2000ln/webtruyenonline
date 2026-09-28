import { eq } from "drizzle-orm";
import { db } from "@/db";
import { authors, genres } from "@/db/schema";
import { isTaxonomySlugTaken } from "@/db/queries/admin-taxonomy";
import type { TaxonomyInput } from "@/lib/validation/admin-taxonomy";

export class TaxonomyConflictError extends Error {}
function isUnique(error: unknown) { let current: unknown = error; while (typeof current === "object" && current !== null) { if ("code" in current && current.code === "23505") return true; current = "cause" in current ? current.cause : null; } return false; }
const tableFor = (kind: "authors" | "genres") => kind === "authors" ? authors : genres;
export async function createTaxonomy(kind: "authors" | "genres", input: TaxonomyInput) { if (await isTaxonomySlugTaken(kind, input.slug)) throw new TaxonomyConflictError(); const table = tableFor(kind); try { const [row] = await db.insert(table).values({ name: input.name, slug: input.slug, description: input.description || null }).returning({ id: table.id }); return row; } catch (error) { if (isUnique(error)) throw new TaxonomyConflictError(); throw error; } }
export async function updateTaxonomy(kind: "authors" | "genres", id: string, input: TaxonomyInput) { if (await isTaxonomySlugTaken(kind, input.slug, id)) throw new TaxonomyConflictError(); const table = tableFor(kind); try { const [row] = await db.update(table).set({ name: input.name, slug: input.slug, description: input.description || null }).where(eq(table.id, id)).returning({ id: table.id }); return row ?? null; } catch (error) { if (isUnique(error)) throw new TaxonomyConflictError(); throw error; } }
export async function deleteTaxonomy(kind: "authors" | "genres", id: string) { const table = tableFor(kind); const [row] = await db.delete(table).where(eq(table.id, id)).returning({ id: table.id }); return row ?? null; }
