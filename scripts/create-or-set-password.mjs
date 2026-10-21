import postgres from "postgres";

const email = process.argv[2] || "user.admin@mocthu.vn";
const newPassword = process.argv[3] || "Admin123456!";

const baseUrl = process.env.NEON_AUTH_BASE_URL;
if (!baseUrl) {
  console.error("Thiếu NEON_AUTH_BASE_URL");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

try {
  console.log(`Đang thiết lập tài khoản cho ${email}...`);

  // Xóa user rác/chưa có mật khẩu nếu có để tạo lại hoàn chỉnh qua Neon Auth API
  await sql`
    DELETE FROM neon_auth.account WHERE "userId" IN (SELECT id FROM neon_auth.user WHERE email = ${email})
  `;
  await sql`
    DELETE FROM neon_auth.user WHERE email = ${email}
  `;

  // Gọi API sign-up/email của Neon Auth
  const res = await fetch(`${baseUrl}/sign-up/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "http://localhost:3003",
    },
    body: JSON.stringify({
      email,
      password: newPassword,
      name: "Admin",
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("Lỗi từ Neon Auth API:", res.status, data);
    process.exit(1);
  }

  // Cấp role admin
  await sql`
    UPDATE neon_auth.user
    SET role = 'admin'
    WHERE email = ${email}
  `;

  // Đồng bộ vào profiles nếu chưa có
  const [createdUser] = await sql`SELECT id FROM neon_auth.user WHERE email = ${email}`;
  if (createdUser) {
    await sql`
      INSERT INTO profiles (id, display_name)
      VALUES (${createdUser.id}, ${email.split("@")[0]})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  console.log(`✅ Thành công! Đã tạo và cấp quyền Admin cho: ${email}`);
  console.log(`🔑 Mật khẩu: ${newPassword}`);
} catch (err) {
  console.error("Lỗi:", err);
} finally {
  await sql.end();
}
