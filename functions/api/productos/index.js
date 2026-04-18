// functions/api/productos/index.js
// GET  /api/productos          → lista pública (solo disponibles)
// GET  /api/productos?all=1    → lista completa (requiere token admin)
// POST /api/productos          → crear producto (requiere token admin)

async function validarToken(token, env) {
  if (!token) return false;
  const { results } = await env.DB.prepare(
    "SELECT token FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')"
  ).bind(token).all();
  return results.length > 0;
}

export async function onRequestGet({ request, env }) {
  try {
    const url      = new URL(request.url);
    const all      = url.searchParams.get('all');
    const categoria = url.searchParams.get('categoria');
    const token    = url.searchParams.get('token');

    let query = 'SELECT * FROM productos';
    const params = [];

    if (all === '1' && await validarToken(token, env)) {
      // Admin: todos los productos
      if (categoria) { query += ' WHERE categoria = ?'; params.push(categoria); }
      query += ' ORDER BY created_at DESC';
    } else {
      // Público: solo disponibles
      query += ' WHERE disponible = 1';
      if (categoria) { query += ' AND categoria = ?'; params.push(categoria); }
      query += ' ORDER BY destacado DESC, created_at DESC';
    }

    const stmt = params.length
      ? env.DB.prepare(query).bind(...params)
      : env.DB.prepare(query);

    const { results } = await stmt.all();
    return Response.json({ ok: true, productos: results });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const url   = new URL(request.url);
    const token = url.searchParams.get('token');
    if (!await validarToken(token, env))
      return Response.json({ ok: false, error: 'No autorizado' }, { status: 401 });

    const { nombre, descripcion, precio, categoria, imagen_url, imagen_public_id, disponible = 1, destacado = 0 } = await request.json();

    if (!nombre || !precio || !categoria)
      return Response.json({ ok: false, error: 'Nombre, precio y categoría son requeridos' }, { status: 400 });

    const result = await env.DB.prepare(`
      INSERT INTO productos (nombre, descripcion, precio, categoria, imagen_url, imagen_public_id, disponible, destacado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(nombre.trim(), descripcion || '', precio.trim(), categoria, imagen_url || null, imagen_public_id || null, disponible, destacado).run();

    return Response.json({ ok: true, id: result.meta.last_row_id });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}