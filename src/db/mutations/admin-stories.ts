import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { stories, storyGenres } from "@/db/schema";
import { getAdminStoryForEdit, isStorySlugTaken } from "@/db/queries/admin-stories";
import type { AdminStoryInput } from "@/lib/validation/admin-story";

export class StorySlugConflictError extends Error {
  constructor() {
    super("Story slug already exists");
    this.name = "StorySlugConflictError";
  }
}

function isUniqueViolation(error: unknown) {
  let current: unknown = error;
  while (typeof current === "object" && current !== null) {
    if ("code" in current && current.code === "23505") return true;
    current = "cause" in current ? current.cause : null;
  }
  return false;
}

export async function createAdminStory(input: AdminStoryInput) {
  if (await isStorySlugTaken(input.slug)) throw new StorySlugConflictError();

  try {
    return await db.transaction(async (transaction) => {
      const [story] = await transaction
        .insert(stories)
        .values({
          title: input.title,
          slug: input.slug,
          originalTitle: input.originalTitle || null,
          description: input.description || null,
          coverUrl: input.coverUrl || null,
          authorId: input.authorId || null,
          status: input.status,
          isPublished: input.isPublished,
          publishedAt: input.isPublished ? new Date() : null,
        })
        .returning({ id: stories.id, slug: stories.slug });

      if (input.genreIds.length > 0) {
        await transaction.insert(storyGenres).values(
          input.genreIds.map((genreId) => ({ storyId: story.id, genreId })),
        );
      }
      return story;
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new StorySlugConflictError();
    throw error;
  }
}

export async function updateAdminStory(id: string, input: AdminStoryInput) {
  const existing = await getAdminStoryForEdit(id);
  if (!existing) return null;
  if (await isStorySlugTaken(input.slug, id)) throw new StorySlugConflictError();

  try {
    await db.transaction(async (transaction) => {
      await transaction
        .update(stories)
        .set({
          title: input.title,
          slug: input.slug,
          originalTitle: input.originalTitle || null,
          description: input.description || null,
          coverUrl: input.coverUrl || null,
          authorId: input.authorId || null,
          status: input.status,
          isPublished: input.isPublished,
          publishedAt: input.isPublished ? sql`coalesce(${stories.publishedAt}, now())` : null,
          updatedAt: new Date(),
        })
        .where(eq(stories.id, id));

      await transaction.delete(storyGenres).where(eq(storyGenres.storyId, id));
      if (input.genreIds.length > 0) {
        await transaction.insert(storyGenres).values(
          input.genreIds.map((genreId) => ({ storyId: id, genreId })),
        );
      }
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new StorySlugConflictError();
    throw error;
  }

  return { id, oldSlug: existing.slug, slug: input.slug };
}

export async function deleteAdminStory(id: string) {
  const existing = await getAdminStoryForEdit(id);
  if (!existing) return null;
  await db.delete(stories).where(eq(stories.id, id));
  return { id, slug: existing.slug, coverUrl: existing.coverUrl };
}

export async function setAdminStoryCover(id: string, coverUrl: string | null) {
  const [story] = await db
    .update(stories)
    .set({ coverUrl, updatedAt: new Date() })
    .where(eq(stories.id, id))
    .returning({ id: stories.id });
  return story ?? null;
}
