import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not configured");
  process.exit(1);
}

let sql;

try {
  sql = postgres(connectionString, {
    max: 1,
    prepare: false,
    ssl: "require",
    connect_timeout: 10,
  });

  // Keep these sequential. Postgres.js query pipelining is not compatible with
  // Supabase's transaction pooler.
  const ping = await sql`select 1 as connected`;
  const tables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
    order by table_name
  `;
  const enums = await sql`
    select type.typname as enum_name
    from pg_type as type
    inner join pg_namespace as namespace on namespace.oid = type.typnamespace
    where namespace.nspname = 'public'
      and type.typtype = 'e'
    order by type.typname
  `;
  const migrationHistory = await sql`
    select exists (
      select 1
      from information_schema.tables
      where table_schema = 'drizzle'
        and table_name = '__drizzle_migrations'
    ) as exists
  `;
  const security = await sql`
    select
      class.relname as table_name,
      class.relrowsecurity as rls_enabled,
      has_table_privilege('anon', class.oid, 'SELECT') as anon_select,
      has_table_privilege('anon', class.oid, 'INSERT') as anon_insert,
      has_table_privilege('anon', class.oid, 'UPDATE') as anon_update,
      has_table_privilege('anon', class.oid, 'DELETE') as anon_delete
    from pg_class as class
    inner join pg_namespace as namespace on namespace.oid = class.relnamespace
    where namespace.nspname = 'public'
      and class.relkind = 'r'
    order by class.relname
  `;

  const tablesWithoutRls = security
    .filter((row) => !row.rls_enabled)
    .map((row) => row.table_name);
  const anonymousWritableTables = security
    .filter((row) => row.anon_insert || row.anon_update || row.anon_delete)
    .map((row) => row.table_name);

  console.log(`Database connected: ${ping[0]?.connected === 1 ? "yes" : "no"}`);
  console.log(`Public tables: ${tables.map((row) => row.table_name).join(", ") || "none"}`);
  console.log(`Public enums: ${enums.map((row) => row.enum_name).join(", ") || "none"}`);
  console.log(`Drizzle migration history: ${migrationHistory[0]?.exists ? "found" : "missing"}`);
  console.log(`Tables without RLS: ${tablesWithoutRls.join(", ") || "none"}`);
  console.log(`Anonymous writable tables: ${anonymousWritableTables.join(", ") || "none"}`);
} catch (error) {
  console.error("Database verification failed");
  console.error(`Error code: ${error?.code ?? "UNKNOWN"}`);
  process.exitCode = 1;
} finally {
  if (sql) {
    await sql.end({ timeout: 2 });
  }
}
