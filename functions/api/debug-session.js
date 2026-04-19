// functions/api/debug-session.js
// TEMPORAL — borrar después de diagnosticar
// Uso: /api/debug-session?token=TU_TOKEN

export async function onRequestGet({ request, env }) {
  const url   = new URL(request.url);
  const token = url.searchParams.get('token');

  try {
    // Ver todas las sesiones activas
    const { results: todas } = await env.DB.prepare(
      "SELECT token, expires_at FROM admin_sessions ORDER BY expires_at DESC LIMIT 5"
    ).all();

    // Buscar el token específico
    let especifica = null;
    if (token) {
      const { results } = await env.DB.prepare(
        "SELECT token, expires_at FROM admin_sessions WHERE token = ?"
      ).bind(token).all();
      especifica = results[0] || null;
    }

    return Response.json({
      ahora_utc:       new Date().toISOString(),
      datetime_now_sql: 'usar SQLite: SELECT datetime("now")',
      token_buscado:   token || '(no enviado)',
      sesion_encontrada: especifica,
      ultimas_5_sesiones: todas,
    });
  } catch (e) {
    return Response.json({ error: e.message });
  }
}