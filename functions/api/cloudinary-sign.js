// functions/api/cloudinary-sign.js
// Upload UNSIGNED a Cloudinary — igual que Elegance (sin firma, sin secret)
// El preset "tienda" debe estar en modo UNSIGNED en tu cuenta Cloudinary

async function validarToken(token, env) {
  if (!token) return false;
  try {
    const { results } = await env.DB.prepare(
      "SELECT token, expires_at FROM admin_sessions WHERE token = ?"
    ).bind(token).all();
    if (!results.length) return false;
    if (new Date() > new Date(results[0].expires_at)) return false;
    return true;
  } catch (e) { return false; }
}

export async function onRequestPost({ request, env }) {
  try {
    const url   = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!await validarToken(token, env)) {
      return Response.json({ ok: false, error: 'Sesión no válida' }, { status: 401 });
    }

    // Recibir el archivo del panel
    const formData = await request.formData();
    const file     = formData.get('file');

    if (!file) {
      return Response.json({ ok: false, error: 'No se recibió imagen' }, { status: 400 });
    }

    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ ok: false, error: 'La imagen supera 10 MB' }, { status: 400 });
    }

    // Validar tipo
    const tiposOk = ['image/jpeg','image/jpg','image/png','image/webp'];
    if (!tiposOk.includes(file.type)) {
      return Response.json({ ok: false, error: 'Formato no permitido. Usa JPG, PNG o WEBP' }, { status: 400 });
    }

    const CLOUD_NAME = env.CLOUDINARY_CLOUD  || 'doaqu6s6c';
    const PRESET     = env.CLOUDINARY_PRESET || 'tienda';
    const FOLDER     = env.CLOUDINARY_CARPETA|| 'minegocio';

    // Subir a Cloudinary con preset UNSIGNED (igual que Elegance)
    const upload = new FormData();
    upload.append('file',          file);
    upload.append('upload_preset', PRESET);
    upload.append('folder',        FOLDER);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: upload }
    );

    const data = await res.json();

    if (data.error) {
      return Response.json({ ok: false, error: data.error.message }, { status: 500 });
    }

    return Response.json({
      ok:        true,
      url:       data.secure_url,
      public_id: data.public_id,
      width:     data.width,
      height:    data.height,
    });

  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}