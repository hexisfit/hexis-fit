import type { VercelRequest, VercelResponse } from "@vercel/node";
import { put, list, del } from "@vercel/blob";

const COACH_PWD = "29051980";

function cors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
}

async function blobGet(key: string): Promise<any> {
  try {
    const r = await list({ prefix: key + ".json", token: process.env.BLOB_READ_WRITE_TOKEN! });
    if (!r.blobs.length) return null;
    const resp = await fetch(r.blobs[0].url);
    return resp.ok ? await resp.json() : null;
  } catch { return null; }
}

async function blobSet(key: string, data: any): Promise<void> {
  await put(key + ".json", JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
    token: process.env.BLOB_READ_WRITE_TOKEN!,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const pwd = (req.headers["x-coach-pwd"] as string) || "";
  if (pwd !== COACH_PWD) return res.status(401).json({ error: "Unauthorized" });

  const url = new URL(req.url!, `https://${req.headers.host}`);

  // DELETE
  if (req.method === "DELETE") {
    const alias = url.searchParams.get("alias") || url.pathname.split("/").pop() || "";
    if (!alias || alias === "clients") return res.status(400).json({ error: "alias required" });
    try {
      const r = await list({ prefix: "clients/" + alias + ".json", token: process.env.BLOB_READ_WRITE_TOKEN! });
      for (const b of r.blobs) await del(b.url, { token: process.env.BLOB_READ_WRITE_TOKEN! });
    } catch {}
    return res.json({ ok: true });
  }

  // POST
  if (req.method === "POST") {
    try {
      const data = req.body;
      if (!data.alias || !data.name) return res.status(400).json({ error: "alias and name required" });
      const alias = data.alias.toLowerCase().replace(/[^a-z0-9_-]/g, "");
      if (!alias) return res.status(400).json({ error: "Invalid alias" });

      const clientData = {
        name: data.name, alias,
        heightMet: data.heightMet || "165 cm",
        weightMet: data.weightMet || "60 kg",
        heightImp: data.heightImp || "5'5\"",
        weightImp: data.weightImp || "132 lbs",
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
      return res.json({ ok: true, alias, url: "/c/" + alias });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // GET
  const r = await list({ prefix: "clients/", token: process.env.BLOB_READ_WRITE_TOKEN! });
  const clients: any[] = [];
  for (const b of r.blobs) {
    try {
      const resp = await fetch(b.url);
      if (resp.ok) clients.push(await resp.json());
    } catch {}
  }
  clients.sort((a: any, b: any) => (b.created || "").localeCompare(a.created || ""));
  return res.json({ clients });
}
