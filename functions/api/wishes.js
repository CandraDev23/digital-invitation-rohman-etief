import { createClient } from "@libsql/client/web";

function getDB(env) {
  return createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });
}

export async function onRequestGet(context) {
  const db = getDB(context.env);
  try {
    // Ambil data dari database, urutkan dari yang terbaru
    const result = await db.execute("SELECT name, attendance, wish FROM wishes ORDER BY created_at DESC");
    return new Response(JSON.stringify(result.rows), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const db = getDB(context.env);
  try {
    const body = await context.request.json();
    const { name, attendance, wish } = body;

    // Simpan data ke database
    await db.execute({
      sql: "INSERT INTO wishes (name, attendance, wish) VALUES (?, ?, ?)",
      args: [name, attendance, wish],
    });

    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}