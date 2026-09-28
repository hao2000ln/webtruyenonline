"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { isAdminUser } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function login(formData: FormData) {
  const credentials = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!credentials.success) {
    redirect("/admin/login?error=invalid-input");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(credentials.data);

  if (error || !data.user) {
    redirect("/admin/login?error=invalid-credentials");
  }

  if (!isAdminUser(data.user)) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=forbidden");
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login?status=logged-out");
}
