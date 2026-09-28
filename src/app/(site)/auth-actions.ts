"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email();

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

const signUpSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(72),
});

function safeNext(value: FormDataEntryValue | null) {
  return value === "/theo-doi" ? "/theo-doi" : "/tai-khoan";
}

export async function loginUser(formData: FormData) {
  const credentials = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const next = safeNext(formData.get("next"));

  if (!credentials.success) {
    redirect(`/dang-nhap?error=invalid-input&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials.data);

  if (error) {
    redirect(`/dang-nhap?error=invalid-credentials&next=${encodeURIComponent(next)}`);
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUpUser(formData: FormData) {
  const credentials = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!credentials.success) {
    redirect("/dang-ky?error=invalid-input");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(credentials.data);

  if (error) {
    redirect("/dang-ky?error=signup-failed");
  }

  revalidatePath("/", "layout");
  redirect(data.session ? "/tai-khoan" : "/dang-ky?status=check-email");
}

export async function logoutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
