// Aula Raíz — puente a la Meta Model API (Muse Spark)
// La llave vive SOLO como secreto del Worker (META_API_KEY). El navegador nunca la ve.
// Si la API falla, responde error y la app usa sus bancos locales de respaldo.

const SYSTEM = "Eres el motor de lecciones de Aula Raíz, una app que convierte temas escolares en reels cortos que los estudiantes sí recuerdan. Escribes en español mexicano natural y cálido, sin calcos del inglés. Tu salida debe ser SOLO un objeto JSON válido, sin texto antes ni después, sin bloques de código.";
const USER_TPL = "Crea la lección en formato reel para el tema \"{tema}\", nivel {nivel} (primaria = niños de 6 a 12 años; secundaria = jóvenes de 12 a 15), lengua de los estudiantes: {idioma}.\n\nDevuelve EXACTAMENTE este JSON:\n{\n  \"titulo\": \"título corto y atractivo del tema\",\n  \"gancho\": \"una frase inicial que enganche en los primeros 7 segundos, conectando el tema con la vida diaria del estudiante\",\n  \"escenas\": [\n    {\"titulo\": \"El gancho\", \"tiempo\": \"0:00 – 0:07\", \"texto\": \"el gancho, listo para narrarse en voz alta\", \"visual\": \"qué se ve en pantalla, en una frase\"},\n    {\"titulo\": \"El desarrollo\", \"tiempo\": \"0:07 – 0:35\", \"texto\": \"la explicación central en pasos claros, con un ejemplo concreto de la vida diaria, lista para narrarse (90 a 120 palabras)\", \"visual\": \"qué se ve en pantalla, en una frase\"},\n    {\"titulo\": \"Cierre y pregunta de repaso\", \"tiempo\": \"0:35 – 0:45\", \"texto\": \"cierre memorable que amarre la idea central, listo para narrarse. NO incluyas aquí la pregunta de repaso: va solo en su campo y la app la agrega al final\", \"visual\": \"qué se ve en pantalla, en una frase\"}\n  ],\n  \"repaso\": [\"punto clave 1, una frase\", \"punto clave 2, una frase\", \"punto clave 3, una frase\"],\n  \"pregunta\": \"una pregunta de repaso que se pueda responder con lo explicado en el desarrollo\",\n  \"saludo\": \"un saludo breve y una frase de ánimo EN la lengua indicada ({idioma}), con su traducción al español entre paréntesis. Si la lengua es Español, un saludo cálido en español sin traducción.\"\n}\n\nReglas: contenido apropiado para menores, datos correctos, nada de relleno.";
const IDIOMAS = ["Español", "Náhuatl", "Maya", "Huichol (Wixárika)", "Zapoteco", "Mixteco", "Otomí", "Purépecha", "Totonaco"];
const ORIGIN = "https://estudio.compizmx.com";

function cors(extra) {
  const h = { "Access-Control-Allow-Origin": ORIGIN, "Vary": "Origin" };
  if (extra) for (const k in extra) h[k] = extra[k];
  return h;
}
function json(obj, status) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: cors({ "Content-Type": "application/json; charset=utf-8" }) });
}
function buildUser(tema, nivel, idioma) {
  return USER_TPL.split("{tema}").join(tema).split("{nivel}").join(nivel).split("{idioma}").join(idioma);
}
function validaLeccion(j) {
  if (!j || typeof j !== "object") return false;
  if (!j.titulo || !j.gancho || !j.pregunta || !j.saludo) return false;
  if (!Array.isArray(j.escenas) || j.escenas.length !== 3) return false;
  for (const e of j.escenas) { if (!e || !e.texto || !e.visual) return false; }
  if (!Array.isArray(j.repaso) || j.repaso.length < 3) return false;
  return true;
}
async function genera(env, tema, nivel, idioma) {
  const r = await fetch("https://api.meta.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.META_API_KEY },
    body: JSON.stringify({
      model: "muse-spark-1.3",
      max_tokens: 4000,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildUser(tema, nivel, idioma) }
      ]
    })
  });
  if (!r.ok) throw new Error("meta api " + r.status);
  const data = await r.json();
  const txt = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!txt) throw new Error("sin contenido");
  let j;
  try { j = JSON.parse(txt); } catch (e) { throw new Error("json invalido"); }
  if (!validaLeccion(j)) throw new Error("forma invalida");
  j.fuente = "muse-spark-1.3";
  return j;
}

async function generaArte(env, tema, visual) {
  const detalle = (visual || tema).replace(/["\n]/g, " ").slice(0, 300);
  const prompt = "Aztec codex-inspired flat illustration, warm gold and jade green palette, decorative geometric border, no text, no letters, no words. Scene: " + detalle + " (lesson topic: " + tema + ")";
  const r = await fetch("https://api.meta.ai/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.META_API_KEY },
    body: JSON.stringify({ model: "muse-image-1.0", prompt: prompt })
  });
  if (!r.ok) throw new Error("meta image " + r.status);
  const data = await r.json();
  const b64 = data && data.data && data.data[0] && data.data[0].b64_json;
  if (!b64) throw new Error("sin imagen");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors({ "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" }) });
    }
    if (url.pathname === "/" && req.method === "GET") {
      return new Response("aula-api · Aula Raíz — puente a la Meta Model API (Muse Spark). Las lecciones se piden con POST /leccion y el arte con GET /imagen?tema=...", { headers: cors({ "Content-Type": "text/plain; charset=utf-8" }) });
    }
    if (url.pathname === "/imagen" && req.method === "GET") {
      const temaI = (url.searchParams.get("tema") || "").replace(/\s+/g, " ").trim().slice(0, 120);
      const visualI = (url.searchParams.get("visual") || "").slice(0, 300);
      if (temaI.length < 3) return json({ error: "tema muy corto" }, 400);
      try {
        const bytes = await generaArte(env, temaI, visualI);
        return new Response(bytes, { status: 200, headers: cors({ "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" }) });
      } catch (e) {
        return json({ error: "arte no disponible" }, 502);
      }
    }
    if (url.pathname !== "/leccion" || req.method !== "POST") return json({ error: "ruta no valida" }, 404);
    let body;
    try { body = await req.json(); } catch (e) { return json({ error: "json requerido" }, 400); }
    const tema = String(body.tema || "").replace(/\s+/g, " ").trim().slice(0, 120);
    const nivel = body.nivel === "secundaria" ? "secundaria" : "primaria";
    const idioma = IDIOMAS.indexOf(body.idioma) >= 0 ? body.idioma : "Español";
    if (tema.length < 3) return json({ error: "tema muy corto" }, 400);
    try {
      return json(await genera(env, tema, nivel, idioma));
    } catch (e1) {
      try { return json(await genera(env, tema, nivel, idioma)); }
      catch (e2) { return json({ error: "generacion no disponible" }, 502); }
    }
  }
};
