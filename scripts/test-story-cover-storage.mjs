import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

const bucket = "story-covers";
const endpoint = process.env.AWS_ENDPOINT_URL_S3;
assert.ok(endpoint, "AWS_ENDPOINT_URL_S3 is required");
assert.ok(process.env.AWS_REGION, "AWS_REGION is required");
assert.ok(process.env.AWS_ACCESS_KEY_ID, "AWS_ACCESS_KEY_ID is required");
assert.ok(process.env.AWS_SECRET_ACCESS_KEY, "AWS_SECRET_ACCESS_KEY is required");

const files = new Files({
  adapter: neon({
    bucket,
    publicBaseUrl: `${endpoint.replace(/\/$/, "")}/${bucket}`,
  }),
});
const key = `integration-tests/${randomUUID()}.webp`;

try {
  const body = new Uint8Array([82, 73, 70, 70, 4, 0, 0, 0, 87, 69, 66, 80]);
  const uploaded = await files.upload(key, body, {
    contentType: "image/webp",
    cacheControl: "public, max-age=60",
  });
  assert.equal(uploaded.key, key);
  assert.equal(await files.exists(key), true);

  const publicUrl = await files.url(key);
  const response = await fetch(publicUrl);
  assert.equal(response.ok, true);
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), body);
  console.log("Neon story cover upload, public read and delete verified");
} finally {
  await files.delete(key).catch(() => undefined);
}
