import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export async function requireUser() {
  const { data: session } = await auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect("/dang-nhap");
  }

  return user;
}
