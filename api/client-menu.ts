import { put, list } from "@vercel/blob";

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

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") return new Response(null, { headers: H });

  const pwd = req.headers.get("x-coach-pwd") || "";
  if (pwd !== COACH_PWD) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: H });

  // Extract alias from URL: /api/clients/ALIAS/menu
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  // parts = ['api','clients','ALIAS','menu']
  const alias = parts[2] || "";
  
  if (!alias) {
    return new Response(JSON.stringify({ error: "No alias provided" }), { status: 400, headers: H });
  }

  const blobKey = `client-menu/${alias}`;

  if (req.method === "POST") {
    try {
      const data = await req.json();
      await put(blobKey + ".json", JSON.stringify(data), { 
        access: "public", 
        addRandomSuffix: false, 
        token: process.env.BLOB_READ_WRITE_TOKEN 
      });
      return new Response(JSON.stringify({ ok: true, alias, slots: (data.menu || []).length }), { headers: H });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: H });
    }
  }

  // GET
  const data = await blobGet(blobKey);
  if (!data) {
    return new Response(JSON.stringify({ menu: [] }), { headers: H });
  }
  return new Response(JSON.stringify(data), { headers: H });
}

export const config = { runtime: "edge" };
