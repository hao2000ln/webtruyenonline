export interface AuthUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  image?: string | null;
  app_metadata?: { role?: string };
}

export function isAdminUser(user: AuthUser | null | undefined): boolean {
  return user?.role === "admin" || user?.app_metadata?.role === "admin";
}
