// functions/api/clicks.js
// POST /api/clicks → registra un clic
// GET  /api/clicks → devuelve resumen por sección

export async function onRequestPost({ request, env }) {
  try {
    const { seccion, accion } = await request.json();

    if (!seccion || !accion) {
      return Response.json({ ok: false, error: 'Faltan campos' }, { status: 400 });
    }

    await env.DB.prepare(
      'INSERT INTO button_clicks (seccion, accion) VALUES (?, ?)'
    ).bind(seccion, accion).run();

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