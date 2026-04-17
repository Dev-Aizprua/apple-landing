// functions/api/admin/login.js
// POST /api/admin/login  { password: "..." }  → { ok, token }

export async function onRequestPost({ request, env }) {
  try {
    const { password } = await request.json();

    if (!password || password !== env.ADMIN_PASSWORD) {
      // Pequeño delay para evitar fuerza bruta
      await new Promise(r => setTimeout(r, 800));
      return Response.json({ ok: false, error: 'Credenciales incorrectas' }, { status: 401 });
    }

    // Generar token único
    const token = crypto.randomUUID() + '-' + Date.now();
    const expires = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(); // 8 horas

    // Limpiar sesiones expiradas
    await env.DB.prepare(
      "DELETE FROM admin_sessions WHERE expires_at < datetime('now')"
    ).run();

    await env.DB.prepare(
      'INSERT INTO admin_sessions (token, expires_at) VALUES (?, ?)'
    ).bind(token, expires).run();

    return Response.json({ ok: true, token });
  } catch (e) { return Response.json({ ok: false, error: e.message }, { status: 500 }); }
}