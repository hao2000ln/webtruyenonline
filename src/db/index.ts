import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const globalForDb = globalThis as unknown as {
  dbClient: postgres.Sql | undefined;
  db: PostgresJsDatabase<typeof schema> | undefined;
};

export const dbClient =
  globalForDb.dbClient ??
  postgres(connectionString, {
    max: process.env.NODE_ENV === "production" ? 1 : 3,
    prepare: false,
    ssl: "require",
    idle_timeout: 5,
    connect_timeout: 10,
  });

export const db =
  globalForDb.db ??
  drizzle(dbClient, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbClient = dbClient;
  globalForDb.db = db;
}
