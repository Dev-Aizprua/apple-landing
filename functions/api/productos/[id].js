// functions/api/productos/[id].js
// GET    /api/productos/:id             → detalle público
// PUT    /api/productos/:id?token=XXX   → actualizar
// DELETE /api/productos/:id?token=XXX   → eliminar

async function validarToken(token, env) {
  if (!token) return false;
  const { results } = await env.DB.prepare(
    "SELECT token FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')"
  ).bind(token).all();
  return results.length > 0;
}

export async function onRequestGet({ params, env }) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM productos WHERE id = ? AND disponible = 1'
    ).bind(params.id).all();

    if (!results.length)
      return Response.json({ ok: false, error: 'Producto no encontrado' }, { status: 404 });

    return Response.json({ ok: true, producto: results[0] });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function onRequestPut({ request, params, env }) {
  try {
    const url   = new URL(request.url);
    const token = url.searchParams.get('token');
    if (!await validarToken(token, env))
      return Response.json({ ok: false, error: 'No autorizado' }, { status: 401 });

    const body = await request.json();
    const fields = [];
    const values = [];

    const allowed = ['nombre','descripcion','precio','categoria','imagen_url','imagen_public_id','disponible','destacado'];
    for (const key of allowed) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }
    if (!fields.length)
      return Response.json({ ok: false, error: 'Nada que actualizar' }, { status: 400 });

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(params.id);

    await env.DB.prepare(
      `UPDATE productos SET ${fields.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function onRequestDelete({ request, params, env }) {
  try {
    const url   = new URL(request.url);
    const token = url.searchParams.get('token');
    if (!await validarToken(token, env))
      return Response.json({ ok: false, error: 'No autorizado' }, { status: 401 });

    await env.DB.prepare('DELETE FROM productos WHERE id = ?').bind(params.id).run();
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}