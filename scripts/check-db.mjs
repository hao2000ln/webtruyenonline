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

  // Keep these sequential. Transaction poolers do not support prepared
  // statements and pipelining consistently.
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
      exists (
        select 1
        from aclexplode(coalesce(class.relacl, acldefault('r', class.relowner))) as privilege
        where privilege.grantee = 0
          and privilege.privilege_type = 'SELECT'
      ) as public_select,
      exists (
        select 1
        from aclexplode(coalesce(class.relacl, acldefault('r', class.relowner))) as privilege
        where privilege.grantee = 0
          and privilege.privilege_type in ('INSERT', 'UPDATE', 'DELETE')
      ) as public_write
    from pg_class as class
    inner join pg_namespace as namespace on namespace.oid = class.relnamespace
    where namespace.nspname = 'public'
      and class.relkind = 'r'
    order by class.relname
  `;

  const tablesWithoutRls = security
    .filter((row) => !row.rls_enabled)
    .map((row) => row.table_name);
  const publiclyWritableTables = security
    .filter((row) => row.public_write)
    .map((row) => row.table_name);

  console.log(`Database connected: ${ping[0]?.connected === 1 ? "yes" : "no"}`);
  console.log(`Public tables: ${tables.map((row) => row.table_name).join(", ") || "none"}`);
  console.log(`Public enums: ${enums.map((row) => row.enum_name).join(", ") || "none"}`);
  console.log(`Drizzle migration history: ${migrationHistory[0]?.exists ? "found" : "missing"}`);
  console.log(`Tables without RLS: ${tablesWithoutRls.join(", ") || "none"}`);
  console.log(`Publicly writable tables: ${publiclyWritableTables.join(", ") || "none"}`);
} catch (error) {
  console.error("Database verification failed");
  console.error(`Error code: ${error?.code ?? "UNKNOWN"}`);
  process.exitCode = 1;
} finally {
  if (sql) {
    await sql.end({ timeout: 2 });
  }
}
