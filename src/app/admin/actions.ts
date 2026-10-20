"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth/server";

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

  try {
    const { data, error } = await auth.signIn.email({
      email: credentials.data.email,
      password: credentials.data.password,
    });

    if (error || !data?.user) {
      redirect("/admin/login?error=invalid-credentials");
    }

    if (data.user.role !== "admin") {
      await auth.signOut();
      redirect("/admin/login?error=forbidden");
    }
  } catch (err: unknown) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    redirect("/admin/login?error=invalid-credentials");
  }

  redirect("/admin");
}

export async function logout() {
  await auth.signOut();
  redirect("/admin/login?status=logged-out");
}
