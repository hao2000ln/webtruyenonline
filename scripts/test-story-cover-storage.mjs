import assert from "node:assert/strict";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, ssl: "require" });

try {
  const [bucket] = await sql`
    select id, public, file_size_limit, allowed_mime_types
    from storage.buckets
    where id = 'story-covers'
  `;
  assert.equal(bucket?.id, "story-covers");
  assert.equal(bucket.public, true);
  assert.equal(Number(bucket.file_size_limit), 1024 * 1024);
  assert.deepEqual(bucket.allowed_mime_types, ["image/webp"]);

  const policies = await sql`
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname like 'story_covers_admin_%'
    order by policyname
  `;
  assert.deepEqual(policies.map((policy) => policy.policyname), [
    "story_covers_admin_delete",
    "story_covers_admin_insert",
    "story_covers_admin_update",
  ]);
  console.log("Story cover bucket and admin RLS policies verified");
} finally {
  await sql.end({ timeout: 2 });
}
