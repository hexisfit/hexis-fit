import { getStore } from "@netlify/blobs";
import type { Context, Config } from "@netlify/functions";
import { TEMPLATE_B64 } from "./template-data.mjs";

function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escJs(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function rr(id: string, val: string, html: string): string {
  const re = new RegExp('(<[^>]*id="' + id + '"[^>]*>)[^<]*');
  return html.replace(re, "$1" + val);
}

function rv(id: string, val: string, html: string): string {
  const re = new RegExp('(<input[^>]*id="' + id + '"[^>]*value=")[^"]*');
  return html.replace(re, "$1" + val);
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
      '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>404</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#f0f4fa;color:#1f2a3a;text-align:center}h1{font-size:4rem;margin-bottom:8px}p{color:#64748b;font-size:1.1rem}</style></head><body><div><h1>404</h1><p>Not found</p></div></body></html>',
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const bin = Uint8Array.from(atob(TEMPLATE_B64), (c) => c.charCodeAt(0));
  const ds = new DecompressionStream("gzip");
  const writer = ds.writable.getWriter();
  writer.write(bin);
  writer.close();
  let html = await new Response(ds.readable).text();

  const d = clientData;

  html = html.replace(
    /let clientSettings\s*=\s*\{[^}]+\}/,
    "let clientSettings = {name:'" + escJs(d.name) + "',city:'" + escJs(d.city) + "',timezone:'" + d.timezone + "',kcal:'" + escJs(d.kcal) + "',heightImp:'" + escJs(d.heightImp) + "',weightImp:'" + escJs(d.weightImp) + "',heightMet:'" + escJs(d.heightMet) + "',weightMet:'" + escJs(d.weightMet) + "',whatsapp:'" + d.whatsapp + "'}"
  );

  html = rr("clientName", escHtml(d.name), html);
  html = rr("statsImp", escHtml(d.heightImp + " \u00b7 " + d.weightImp), html);
  html = rr("statsMet", escHtml(d.heightMet + " \u00b7 " + d.weightMet), html);
  html = rr("kcalBadge", "\ud83d\udd25 " + escHtml(d.kcal) + " kcal", html);
  html = rv("setName", escHtml(d.name), html);
  html = rv("setCity", escHtml(d.city), html);
  html = rv("setKcal", escHtml(d.kcal), html);
  html = rv("setHeightImp", escHtml(d.heightImp), html);
  html = rv("setWeightImp", escHtml(d.weightImp), html);
  html = rv("setHeightMet", escHtml(d.heightMet), html);
  html = rv("setWeightMet", escHtml(d.weightMet), html);
  html = rv("setWhatsApp", escHtml(d.whatsapp), html);
  html = html.replace(/<title>[^<]*<\/title>/, "<title>\ud83c\udf31 " + escHtml(d.name) + " \u00b7 Wellness \u00b7 hexis.fit</title>");

  const lang = d.lang || "en";
  html = html.replace(
    "document.body.className='en';currentLang='en';",
    "document.body.className='" + lang + "';currentLang='" + lang + "';"
  );
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
