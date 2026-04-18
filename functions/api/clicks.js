export async function onRequestPost({ request, env }) {
  try {
    const { seccion, accion, email } = await request.json();

    if (!seccion || !accion) {
      return Response.json({ ok: false, error: 'Faltan campos' }, { status: 400 });
    }

    // Insertamos incluyendo el email (si existe)
    // created_at se genera solo en la DB
    await env.DB.prepare(
      'INSERT INTO button_clicks (seccion, accion, email) VALUES (?, ?, ?)'
    ).bind(seccion, accion, email || null).run();

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(`
      SELECT seccion, accion, COUNT(*) as total
      FROM button_clicks
      GROUP BY seccion, accion
      ORDER BY total DESC
    `).all();
    return Response.json({ clicks: results });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}