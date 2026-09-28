"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { TaxonomyConflictError, createTaxonomy, deleteTaxonomy, updateTaxonomy } from "@/db/mutations/admin-taxonomy";
import { requireAdmin } from "@/lib/auth/admin";
import { parseTaxonomyForm, type TaxonomyInput } from "@/lib/validation/admin-taxonomy";
export type TaxonomyKind = "authors" | "genres";
export type TaxonomyFormState = { message?: string; fieldErrors?: Partial<Record<keyof TaxonomyInput, string[]>> };
function invalid(error: z.ZodError<TaxonomyInput>): TaxonomyFormState { return { message: "Vui lòng kiểm tra lại thông tin.", fieldErrors: error.flatten().fieldErrors }; }
function refresh() { revalidatePath("/"); revalidatePath("/the-loai"); revalidatePath("/admin/authors"); revalidatePath("/admin/genres"); revalidatePath("/truyen/[slug]", "page"); }
export async function createTaxonomyAction(kind: TaxonomyKind, _state: TaxonomyFormState, data: FormData): Promise<TaxonomyFormState> { await requireAdmin(); const parsed = parseTaxonomyForm(data); if (!parsed.success) return invalid(parsed.error); try { await createTaxonomy(kind, parsed.data); } catch (error) { if (error instanceof TaxonomyConflictError) return { message: "Slug đã được sử dụng.", fieldErrors: { slug: ["Slug đã được sử dụng."] } }; return { message: `Không thể tạo ${kind === "authors" ? "tác giả" : "thể loại"}.` }; } refresh(); redirect(`/admin/${kind}?created=1`); }
export async function updateTaxonomyAction(kind: TaxonomyKind, id: string, _state: TaxonomyFormState, data: FormData): Promise<TaxonomyFormState> { await requireAdmin(); if (!z.string().uuid().safeParse(id).success) return { message: "ID không hợp lệ." }; const parsed = parseTaxonomyForm(data); if (!parsed.success) return invalid(parsed.error); try { if (!await updateTaxonomy(kind, id, parsed.data)) return { message: "Dữ liệu không còn tồn tại." }; } catch (error) { if (error instanceof TaxonomyConflictError) return { message: "Slug đã được sử dụng.", fieldErrors: { slug: ["Slug đã được sử dụng."] } }; return { message: "Không thể cập nhật dữ liệu." }; } refresh(); redirect(`/admin/${kind}?updated=1`); }
export async function deleteTaxonomyAction(kind: TaxonomyKind, id: string) { await requireAdmin(); await deleteTaxonomy(kind, id); refresh(); redirect(`/admin/${kind}?deleted=1`); }
