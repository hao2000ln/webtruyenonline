import postgres from "postgres";

const email = process.argv[2];

if (!email) {
  console.error("Vui lòng truyền email: node --env-file=.env.local scripts/grant-admin.mjs <email>");
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
    UPDATE auth.users
    SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
    WHERE email = ${email}
    RETURNING id, email, raw_app_meta_data;
  `;

  if (result.length === 0) {
    console.error(`Không tìm thấy user với email: ${email}`);
    process.exit(1);
  }

  console.log(`✅ Cấp quyền Admin thành công cho: ${result[0].email}`);
  console.log("Thông tin app_metadata:", result[0].raw_app_meta_data);
} catch (error) {
  console.error("Lỗi khi cấp quyền admin:", error.message);
  process.exit(1);
} finally {
  await sql.end();
}
