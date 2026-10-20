import { db } from "@/db";
import { profiles } from "@/db/schema";
import type { AuthUser } from "@/lib/auth/roles";

export async function ensureProfile(user: AuthUser) {
  const displayName = user.name || user.email?.split("@")[0] || null;

  await db
    .insert(profiles)
    .values({ id: user.id, displayName, avatarUrl: user.image ?? null })
    .onConflictDoNothing({ target: profiles.id });
}
