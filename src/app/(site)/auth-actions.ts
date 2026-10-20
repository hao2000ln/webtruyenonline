"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/auth/profile";

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

  try {
    const { data, error } = await auth.signIn.email({
      email: credentials.data.email,
      password: credentials.data.password,
    });

    if (error || !data?.user) {
      redirect(`/dang-nhap?error=invalid-credentials&next=${encodeURIComponent(next)}`);
    }

    await ensureProfile(data.user);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
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

  try {
    const { data, error } = await auth.signUp.email({
      email: credentials.data.email,
      password: credentials.data.password,
      name: credentials.data.email.split("@")[0],
    });

    if (error || !data?.user) {
      redirect("/dang-ky?error=signup-failed");
    }

    await ensureProfile(data.user);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    redirect("/dang-ky?error=signup-failed");
  }

  revalidatePath("/", "layout");
  redirect("/tai-khoan");
}

export async function logoutUser() {
  await auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
