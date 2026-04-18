// functions/api/cloudinary-sign.js
// POST /api/cloudinary-sign?token=XXX
// Genera una firma segura para upload directo desde el browser a Cloudinary
// Así el CLOUDINARY_SECRET nunca sale del servidor

async function validarToken(token, env) {
  if (!token) return false;
  const { results } = await env.DB.prepare(
    "SELECT token FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')"
  ).bind(token).all();
  return results.length > 0;
}

// Función HMAC-SHA1 compatible con Workers (Web Crypto API)
async function sha1(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  try {
    const url   = new URL(request.url);
    const token = url.searchParams.get('token');
    if (!await validarToken(token, env))
      return Response.json({ ok: false, error: 'No autorizado' }, { status: 401 });

    const timestamp = Math.round(Date.now() / 1000);
    const folder    = env.CLOUDINARY_CARPETA || 'minegocio';
    const preset    = env.CLOUDINARY_PRESET  || 'tienda';

    // Parámetros a firmar (orden alfabético, sin api_key ni resource_type)
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}&upload_preset=${preset}`;
    const signature    = await sha1(paramsToSign + env.CLOUDINARY_SECRET);

    return Response.json({
      ok:        true,
      signature,
      timestamp,
      cloud:     env.CLOUDINARY_CLOUD,
      api_key:   env.CLOUDINARY_KEY,
      folder,
      preset,
    });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}