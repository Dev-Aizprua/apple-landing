// functions/api/cloudinary-sign.js
// FIX: validación de sesión con timezone correcto

async function validarToken(token, env) {
  if (!token) return { valido: false, razon: 'Token vacío' };
  try {
    // Buscar el token sin filtro de fecha primero (para diagnóstico)
    const { results } = await env.DB.prepare(
      "SELECT token, expires_at FROM admin_sessions WHERE token = ?"
    ).bind(token).all();

    if (results.length === 0) {
      return { valido: false, razon: 'Token no encontrado en BD' };
    }

    const sesion = results[0];
    const expiresAt = new Date(sesion.expires_at);
    const ahora = new Date();

    // Comparar como objetos Date (maneja timezones correctamente)
    if (ahora > expiresAt) {
      return { 
        valido: false, 
        razon: `Sesión expirada. Expiró: ${sesion.expires_at}, Ahora UTC: ${ahora.toISOString()}` 
      };
    }

    return { valido: true };
  } catch (err) {
    return { valido: false, razon: 'Error BD: ' + err.message };
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const url   = new URL(request.url);
    const token = url.searchParams.get('token');

    // Validar sesión con diagnóstico mejorado
    const validacion = await validarToken(token, env);

    if (!validacion.valido) {
      console.error('Sesión inválida:', validacion.razon);
      return Response.json(
        { ok: false, error: 'Sesión no válida', detalle: validacion.razon },
        { status: 401 }
      );
    }

    // Leer el cuerpo UNA SOLA VEZ
    const formData = await request.formData();
    const file     = formData.get('file');

    if (!file) {
      return Response.json({ ok: false, error: 'No se encontró la imagen' }, { status: 400 });
    }

    // Configuración desde variables de entorno
    const cloudName = env.CLOUDINARY_CLOUD  || 'doaqu6s6c';
    const folder    = env.CLOUDINARY_CARPETA || 'minegocio';
    const preset    = env.CLOUDINARY_PRESET  || 'tienda';

    // Subida unsigned a Cloudinary
    const uploadData = new FormData();
    uploadData.append('file',          file);
    uploadData.append('upload_preset', preset);
    uploadData.append('folder',        folder);

    const res  = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: uploadData }
    );

    const data = await res.json();

    if (!res.ok) {
      return Response.json(
        { ok: false, error: data.error?.message || 'Error Cloudinary' },
        { status: 500 }
      );
    }

    return Response.json({
      ok:        true,
      url:       data.secure_url,
      public_id: data.public_id,
    });

  } catch (e) {
    return Response.json(
      { ok: false, error: 'Error técnico: ' + e.message },
      { status: 500 }
    );
  }
}