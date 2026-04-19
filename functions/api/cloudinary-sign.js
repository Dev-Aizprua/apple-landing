// functions/api/cloudinary-sign.js
// Modo proxy: recibe el archivo del frontend, lo sube a Cloudinary con preset unsigned
// FIX: validación de sesión con Date JS (no SQLite string compare)

async function validarToken(token, env) {
  if (!token) return { valido: false, razon: 'Token vacío' };
  try {
    const { results } = await env.DB.prepare(
      "SELECT token, expires_at FROM admin_sessions WHERE token = ?"
    ).bind(token).all();

    if (!results.length) return { valido: false, razon: 'Token no encontrado' };

    if (new Date() > new Date(results[0].expires_at)) {
      return { valido: false, razon: 'Sesión expirada' };
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

    // 1. Validar sesión
    const validacion = await validarToken(token, env);
    if (!validacion.valido) {
      return Response.json(
        { ok: false, error: 'Sesión no válida', detalle: validacion.razon },
        { status: 401 }
      );
    }

    // 2. Leer el archivo desde el FormData que manda el frontend
    const formData = await request.formData();
    const file     = formData.get('file');

    if (!file) {
      return Response.json(
        { ok: false, error: 'No se encontró el archivo en el FormData' },
        { status: 400 }
      );
    }

    // 3. Subir a Cloudinary con preset unsigned (sin firma)
    const cloudName = env.CLOUDINARY_CLOUD   || 'doaqu6s6c';
    const folder    = env.CLOUDINARY_CARPETA  || 'minegocio';
    const preset    = env.CLOUDINARY_PRESET   || 'tienda';

    const upload = new FormData();
    upload.append('file',          file);
    upload.append('upload_preset', preset);
    upload.append('folder',        folder);

    const res  = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: upload }
    );
    const data = await res.json();

    if (!res.ok || data.error) {
      return Response.json(
        { ok: false, error: data.error?.message || 'Error en Cloudinary' },
        { status: 500 }
      );
    }

    // 4. Devolver URL al frontend
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