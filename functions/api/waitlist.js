// functions/api/waitlist.js
// POST /api/waitlist  → guarda email en D1
// GET  /api/waitlist  → devuelve total de registros

export async function onRequestPost({ request, env }) {
  try {
    const { email, producto = 'MacBook Neo' } = await request.json();

    if (!email || !email.includes('@')) {
      return Response.json({ ok: false, error: 'Email inválido' }, { status: 400 });
    }

    await env.DB.prepare(
      'INSERT OR IGNORE INTO waitlist (email, producto) VALUES (?, ?)'
    ).bind(email.toLowerCase().trim(), producto).run();

    const { results } = await env.DB.prepare(
      'SELECT COUNT(*) as total FROM waitlist'
    ).all();

    return Response.json({ ok: true, total: results[0].total });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT COUNT(*) as total FROM waitlist'
    ).all();
    return Response.json({ total: results[0].total });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}