import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { isAdminUser } from "@/lib/auth/roles";

export async function requireAdmin() {
  const { data: session } = await auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdminUser(user)) {
    redirect("/");
  }

  return user;
}
