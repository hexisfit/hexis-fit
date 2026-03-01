import { getStore } from "@netlify/blobs";
import type { Context, Config } from "@netlify/functions";
import { TEMPLATE_B64 } from "./template-data.mjs";

function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escJs(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const alias = url.pathname.replace("/c/", "").replace(/\.html$/, "").toLowerCase();

  if (!alias) {
    return new Response("Not found", { status: 404 });
  }

  const store = getStore({ name: "clients", consistency: "strong" });
  const clientData: any = await store.get(alias, { type: "json" });

  if (!clientData) {
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>404</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#f0f4fa;color:#1f2a3a;text-align:center}h1{font-size:4rem;margin-bottom:8px}p{color:#64748b;font-size:1.1rem}</style></head><body><div><h1>404</h1><p>Страница не найдена 😕</p><p style="margin-top:12px"><a href="/" style="color:#2563eb">← На главную</a></p></div></body></html>`,
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // Decompress template
  const bin = Uint8Array.from(atob(TEMPLATE_B64), (c) => c.charCodeAt(0));
  const ds = new DecompressionStream("gzip");
  const writer = ds.writable.getWriter();
  writer.write(bin);
  writer.close();
  let html = await new Response(ds.readable).text();

  const d = clientData;

  // Replace clientSettings JS object
  html = html.replace(
    /let clientSettings\s*=\s*\{[^}]+\}/,
    `let clientSettings = {name:'${escJs(d.name)}',city:'${escJs(d.city)}',timezone:'${d.timezone}',kcal:'${escJs(d.kcal)}',heightImp:'${escJs(d.heightImp)}',weightImp:'${escJs(d.weightImp)}',heightMet:'${escJs(d.heightMet)}',weightMet:'${escJs(d.weightMet)}',whatsapp:'${d.whatsapp}'}`
  );

  // Replace displayed values
  html = html.replace(/(<div class="hero-name" id="clientName">)[^<]*/, "$1" + escHtml(d.name));
  html = html.replace(/(<span class="stats-imperial" id="statsImp">)[^<]*/, "$1" + escHtml(d.heightImp + " · " + d.weightImp));
  html = html.replace(/(<span class="stats-metric" id="statsMet")[^>]*>)[^<]*/, "$1" + escHtml(d.heightMet + " · " + d.weightMet));
  html = html.replace(/(<div class="hero-kcal" id="kcalBadge">)[^<]*/, "$1🔥 " + escHtml(d.kcal) + " kcal");
  html = html.replace(/(<input type="text" id="setName" value=")[^"]*/, "$1" + escHtml(d.name));
  html = html.replace(/(<input type="text" id="setCity" value=")[^"]*/, "$1" + escHtml(d.city));
  html = html.replace(/(<input type="text" id="setKcal" value=")[^"]*/, "$1" + escHtml(d.kcal));
  html = html.replace(/(<input type="text" id="setHeightImp" value=")[^"]*/, "$1" + escHtml(d.heightImp));
  html = html.replace(/(<input type="text" id="setWeightImp" value=")[^"]*/, "$1" + escHtml(d.weightImp));
  html = html.replace(/(<input type="text" id="setHeightMet" value=")[^"]*/, "$1" + escHtml(d.heightMet));
  html = html.replace(/(<input type="text" id="setWeightMet" value=")[^"]*/, "$1" + escHtml(d.weightMet));
  html = html.replace(/(<input type="text" id="setWhatsApp" value=")[^"]*/, "$1" + escHtml(d.whatsapp));
  html = html.replace(/<title>[^<]*<\/title>/, "<title>🌱 " + escHtml(d.name) + " · Wellness · hexis.fit</title>");

  // Set default language
  const lang = d.lang || "en";
  html = html.replace(
    "document.body.className='en';currentLang='en';",
    "document.body.className='" + lang + "';currentLang='" + lang + "';"
  );
  // Set active lang button
  html = html.replace(
    new RegExp('<button class="lang-btn active" onclick="setLang\\(\'en\''),
    '<button class="lang-btn" onclick="setLang(\'en\''
  );
  html = html.replace(
    new RegExp('<button class="lang-btn" onclick="setLang\\(\'' + lang + '\''),
    '<button class="lang-btn active" onclick="setLang(\'' + lang + '\''
  );

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};

export const config: Config = {
  path: "/c/*",
};
