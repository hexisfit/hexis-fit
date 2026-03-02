import { put, list, del } from "@vercel/blob";

const COACH_PWD = "29051980";
const H = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "*" };

async function blobGet(key: string): Promise<any> {
  try {
    const r = await list({ prefix: key + ".json", token: process.env.BLOB_READ_WRITE_TOKEN });
    if (!r.blobs.length) return null;
    const resp = await fetch(r.blobs[0].url);
    return resp.ok ? await resp.json() : null;
  } catch { return null; }
}

async function blobSet(key: string, data: any) {
  await put(key + ".json", JSON.stringify(data), { access: "public", addRandomSuffix: false, token: process.env.BLOB_READ_WRITE_TOKEN });
}

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") return new Response(null, { headers: H });

  const pwd = req.headers.get("x-coach-pwd") || "";
  if (pwd !== COACH_PWD) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: H });

  const url = new URL(req.url);

  // DELETE /api/clients?alias=xxx
  if (req.method === "DELETE") {
    const alias = url.searchParams.get("alias") || url.pathname.split("/").pop() || "";
    if (!alias || alias === "clients") return new Response(JSON.stringify({ error: "alias required" }), { status: 400, headers: H });
    try {
      const r = await list({ prefix: "clients/" + alias + ".json", token: process.env.BLOB_READ_WRITE_TOKEN });
      for (const b of r.blobs) await del(b.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    } catch {}
    return new Response(JSON.stringify({ ok: true }), { headers: H });
  }

  // POST /api/clients
  if (req.method === "POST") {
    try {
      const data = await req.json();
      if (!data.alias || !data.name) return new Response(JSON.stringify({ error: "alias and name required" }), { status: 400, headers: H });
      const alias = data.alias.toLowerCase().replace(/[^a-z0-9_-]/g, "");
      if (!alias) return new Response(JSON.stringify({ error: "Invalid alias" }), { status: 400, headers: H });

      const clientData = {
        name: data.name, alias,
        heightMet: data.heightMet || "165 cm",
        weightMet: data.weightMet || "60 kg",
        kcal: data.kcal || "1500-1600",
        city: data.city || "Kleve, Germany",
        timezone: data.timezone || "Europe/Berlin",
        whatsapp: data.whatsapp || "380505827191",
        lang: data.lang || "en",
        courseWeeks: data.courseWeeks || "4",
        courseStart: data.courseStart || "",
        filterVegan: data.filterVegan || false,
        filterHalal: data.filterHalal || false,
        filterLF: data.filterLF || false,
        filterSpeed: data.filterSpeed || "",
        created: new Date().toISOString(),
      };

      await blobSet("clients/" + alias, clientData);
      return new Response(JSON.stringify({ ok: true, alias, url: "/c/" + alias }), { headers: H });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: H });
    }
  }

  // GET /api/clients
  const r = await list({ prefix: "clients/", token: process.env.BLOB_READ_WRITE_TOKEN });
  const clients = [];
  for (const b of r.blobs) {
    try {
      const resp = await fetch(b.url);
      if (resp.ok) clients.push(await resp.json());
    } catch {}
  }
  clients.sort((a: any, b: any) => (b.created || "").localeCompare(a.created || ""));
  return new Response(JSON.stringify({ clients }), { headers: H });
}

export const config = { runtime: "edge" };
