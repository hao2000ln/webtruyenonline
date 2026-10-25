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
  confirmPassword: z.string().min(8).max(72),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

function signUpErrorCode(error: unknown) {
  if (!error || typeof error !== "object") return "service-unavailable";
  const code = "code" in error && typeof error.code === "string" ? error.code : "";
  if (code.includes("USER_ALREADY_EXISTS") || code.includes("EMAIL_ALREADY")) return "account-exists";
  if (code.includes("SIGNUP_DISABLED")) return "signup-disabled";
  return "signup-failed";
}

async function ensureProfileWithoutBlockingAuth(user: Parameters<typeof ensureProfile>[0]) {
  try {
    await ensureProfile(user);
  } catch (error) {
    console.error("Unable to ensure application profile after authentication", error);
  }
}

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

    await ensureProfileWithoutBlockingAuth(data.user);
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
    confirmPassword: formData.get("confirmPassword"),
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
      redirect(`/dang-ky?error=${signUpErrorCode(error)}`);
    }

    await ensureProfileWithoutBlockingAuth(data.user);
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
