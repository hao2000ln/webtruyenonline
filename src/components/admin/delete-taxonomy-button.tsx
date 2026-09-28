"use client";
import { deleteTaxonomyAction, type TaxonomyKind } from "@/app/admin/(dashboard)/taxonomy-actions";
export function DeleteTaxonomyButton({ kind, id, name }: { kind: TaxonomyKind; id: string; name: string }) { return <form action={deleteTaxonomyAction.bind(null, kind, id)} onSubmit={(e) => { if (!window.confirm(`Xóa “${name}”?`)) e.preventDefault(); }}><button type="submit" className="font-semibold text-red-600 hover:underline">Xóa</button></form>; }
