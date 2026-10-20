import postgres from "postgres";

const email = process.argv[2];

if (!email) {
  console.error("Vui lòng truyền email: npm run set-admin <email>");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL chưa được cấu hình");
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1, prepare: false, ssl: "require" });

try {
  const result = await sql`
    UPDATE neon_auth.user
    SET role = 'admin'
    WHERE email = ${email}
    RETURNING id, email, role;
  `;

  if (result.length === 0) {
    console.error(`Không tìm thấy user với email: ${email} trong neon_auth.user`);
    process.exit(1);
  }

  await sql`
    INSERT INTO profiles (id, display_name)
    VALUES (${result[0].id}, ${result[0].email.split("@")[0]})
    ON CONFLICT (id) DO NOTHING;
  `;

  console.log(`✅ Cấp quyền Admin thành công cho: ${result[0].email}`);
  console.log(`Role: ${result[0].role}`);
} catch (error) {
  console.error("Lỗi khi cấp quyền admin:", error.message);
  process.exit(1);
} finally {
  await sql.end();
}
