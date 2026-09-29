import { and, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { follows, stories } from "@/db/schema";
import { ensureProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ slug: string }> };

async function getRequestUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function getPublishedStory(slug: string) {
  const [story] = await db
    .select({ id: stories.id })
    .from(stories)
    .where(and(eq(stories.slug, slug), eq(stories.isPublished, true)))
    .limit(1);
  return story ?? null;
}

export async function GET(_request: NextRequest, { params }: Context) {
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ followed: false, guest: true });

  const { slug } = await params;
  const story = await getPublishedStory(slug);
  if (!story) return NextResponse.json({ error: "not-found" }, { status: 404 });

  const [follow] = await db
    .select({ storyId: follows.storyId })
    .from(follows)
    .where(and(eq(follows.userId, user.id), eq(follows.storyId, story.id)))
    .limit(1);

  return NextResponse.json({ followed: Boolean(follow) });
}

export async function POST(_request: NextRequest, { params }: Context) {
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { slug } = await params;
  const story = await getPublishedStory(slug);
  if (!story) return NextResponse.json({ error: "not-found" }, { status: 404 });

  await ensureProfile(user);
  await db
    .insert(follows)
    .values({ userId: user.id, storyId: story.id })
    .onConflictDoNothing({ target: [follows.userId, follows.storyId] });

  return NextResponse.json({ followed: true });
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { slug } = await params;
  const story = await getPublishedStory(slug);
  if (!story) return NextResponse.json({ error: "not-found" }, { status: 404 });

  await db
    .delete(follows)
    .where(and(eq(follows.userId, user.id), eq(follows.storyId, story.id)));

  return NextResponse.json({ followed: false });
}
