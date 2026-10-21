import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

try {
  const users = await sql`
    SELECT u.id, u.email, u.role, u.name, a."providerId", (a.password IS NOT NULL) as has_password
    FROM neon_auth.user u
    LEFT JOIN neon_auth.account a ON u.id = a."userId";
  `;
  console.log("Danh sách User trong Neon Auth:");
  console.table(users);
} catch (err) {
  console.error("Lỗi:", err);
} finally {
  await sql.end();
}
