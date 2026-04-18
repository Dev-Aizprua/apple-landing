export async function onRequestPost({ request, env }) {
  try {
    const { nombre, email, mensaje } = await request.json();

    if (!nombre || !email || !mensaje) {
      return Response.json({ ok: false, error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    await env.DB.prepare(
      'INSERT INTO contacto (nombre, email, mensaje, leido) VALUES (?, ?, ?, 0)'
    ).bind(
      nombre.trim(), 
      email.toLowerCase().trim(), 
      mensaje.trim()
    ).run();

    return Response.json({ ok: true, mensaje: '¡Gracias! Te contactaremos pronto.' });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}