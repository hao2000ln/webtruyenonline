import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  auth: true,
  buckets: {
    "story-covers": { access: "public_read" },
  },
});
