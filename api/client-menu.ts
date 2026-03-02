import type { VercelRequest, VercelResponse } from "@vercel/node";
import { put, list } from "@vercel/blob";

const COACH_PWD = "29051980";

async function blobGet(key: string): Promise<any> {
  try {
    const r = await list({ prefix: key + ".json", token: process.env.BLOB_READ_WRITE_TOKEN });
    if (!r.blobs.length) return null;
    const resp = await fetch(r.blobs[0].url);
    return resp.ok ? await resp.json() : null;
  } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");

  if (req.method === "OPTIONS") return res.status(200).end();

  const pwd = (req.headers["x-coach-pwd"] as string) || "";
  if (pwd !== COACH_PWD) return res.status(401).json({ error: "Unauthorized" });

  // Extract alias from URL: /api/clients/ALIAS/menu
  const parts = (req.url || "").split("/").filter(Boolean);
  // parts like ['api','clients','ALIAS','menu']
  const aliasIdx = parts.indexOf("clients");
  const alias = aliasIdx >= 0 ? parts[aliasIdx + 1] || "" : "";

  if (!alias) {
    return res.status(400).json({ error: "No alias provided" });
  }

  const blobKey = `client-menu/${alias}`;

  if (req.method === "POST") {
    try {
      const data = req.body;
      await put(blobKey + ".json", JSON.stringify(data), {
        access: "public",
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      return res.status(200).json({ ok: true, alias, slots: (data.menu || []).length });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // GET
  const data = await blobGet(blobKey);
  if (!data) {
    return res.status(200).json({ menu: [] });
  }
  return res.status(200).json(data);
}
