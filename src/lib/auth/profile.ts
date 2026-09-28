import type { User } from "@supabase/supabase-js";
import { db } from "@/db";
import { profiles } from "@/db/schema";

export async function ensureProfile(user: User) {
  const displayName = typeof user.user_metadata?.display_name === "string"
    ? user.user_metadata.display_name
    : user.email?.split("@")[0] ?? null;

  await db
    .insert(profiles)
    .values({ id: user.id, displayName })
    .onConflictDoNothing({ target: profiles.id });
}
