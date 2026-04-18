export async function onRequestPost({ request, env }) {
  try {
    const { email, producto = 'MacBook Neo' } = await request.json();

    if (!email || !email.includes('@')) {
      return Response.json({ ok: false, error: 'Email inválido' }, { status: 400 });
    }

    await env.DB.prepare(
      'INSERT OR IGNORE INTO waitlist (email, producto) VALUES (?, ?)'
    ).bind(email.toLowerCase().trim(), producto).run();

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}