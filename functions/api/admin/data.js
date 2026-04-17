// functions/api/admin/data.js
// GET /api/admin/data?token=XXX  → todos los datos del dashboard

async function validarToken(token, env) {
  if (!token) return false;
  const { results } = await env.DB.prepare(
    "SELECT token FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')"
  ).bind(token).all();
  return results.length > 0;
}

export async function onRequestGet({ request, env }) {
  try {
    const url    = new URL(request.url);
    const token  = url.searchParams.get('token');

    if (!await validarToken(token, env)) {
      return Response.json({ ok: false, error: 'No autorizado' }, { status: 401 });
    }

    // KPIs
    const [wl, ct, cl] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as n FROM waitlist').all(),
      env.DB.prepare('SELECT COUNT(*) as n FROM contacto').all(),
      env.DB.prepare('SELECT COUNT(*) as n FROM button_clicks').all(),
    ]);

    // Clics por sección (para gráfica de barras)
    const { results: clicksPorSeccion } = await env.DB.prepare(`
      SELECT seccion, COUNT(*) as total
      FROM button_clicks
      GROUP BY seccion ORDER BY total DESC LIMIT 10
    `).all();

    // Últimos 7 días de actividad (para gráfica de línea)
    const { results: actividadDiaria } = await env.DB.prepare(`
      SELECT DATE(created_at) as dia, COUNT(*) as total
      FROM button_clicks
      WHERE created_at >= DATE('now', '-7 days')
      GROUP BY dia ORDER BY dia ASC
    `).all();

    // Mensajes de contacto (buzón)
    const { results: mensajes } = await env.DB.prepare(`
      SELECT id, nombre, email, mensaje, leido, created_at
      FROM contacto ORDER BY created_at DESC LIMIT 50
    `).all();

    // Lista de espera
    const { results: listaEspera } = await env.DB.prepare(`
      SELECT id, email, producto, created_at FROM waitlist ORDER BY created_at DESC
    `).all();

    // Inteligencia de ventas: clientes identificados con sus clics
    const { results: inteligencia } = await env.DB.prepare(`
      SELECT
        email,
        COUNT(*) as total_clics,
        GROUP_CONCAT(seccion || ':' || accion, ' | ') as actividad,
        MAX(created_at) as ultima_visita,
        MIN(created_at) as primera_visita
      FROM button_clicks
      WHERE email IS NOT NULL AND email != ''
      GROUP BY email
      ORDER BY total_clics DESC
      LIMIT 100
    `).all();

    // Top productos más vistos por clientes identificados
    const { results: topProductos } = await env.DB.prepare(`
      SELECT seccion, COUNT(*) as clics, COUNT(DISTINCT email) as clientes_unicos
      FROM button_clicks
      WHERE email IS NOT NULL
      GROUP BY seccion ORDER BY clics DESC LIMIT 8
    `).all();

    return Response.json({
      ok: true,
      kpis: {
        waitlist:  wl.results[0].n,
        contactos: ct.results[0].n,
        clics:     cl.results[0].n,
      },
      clicksPorSeccion,
      actividadDiaria,
      mensajes,
      listaEspera,
      inteligencia,
      topProductos,
    });
  } catch (e) { return Response.json({ ok: false, error: e.message }, { status: 500 }); }
}

// PATCH /api/admin/data  { id, leido: 1 }  → marcar mensaje como leído
export async function onRequestPatch({ request, env }) {
  try {
    const url   = new URL(request.url);
    const token = url.searchParams.get('token');
    if (!await validarToken(token, env))
      return Response.json({ ok: false, error: 'No autorizado' }, { status: 401 });

    const { id, leido } = await request.json();
    await env.DB.prepare('UPDATE contacto SET leido = ? WHERE id = ?').bind(leido, id).run();
    return Response.json({ ok: true });
  } catch (e) { return Response.json({ ok: false, error: e.message }, { status: 500 }); }
}