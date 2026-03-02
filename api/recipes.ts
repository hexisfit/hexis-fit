import type { VercelRequest, VercelResponse } from "@vercel/node";
import { put, list } from "@vercel/blob";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const pwd = (req.headers["x-coach-pwd"] as string) || "";
  if (pwd !== COACH_PWD) return res.status(401).json({ error: "Unauthorized" });

  const url = new URL(req.url!, `https://${req.headers.host}`);

  // GET /api/recipes/stats
  if (url.pathname.endsWith("/stats")) {
    const db: any = await blobGet("recipes/database");
    if (!db) return res.json({ uploaded: false });
    return res.json({
      uploaded: true,
      totalRecipes: Object.keys(db.recipes).length,
      totalIngredients: Object.keys(db.ingredientNames).length,
      menuDays: db.meta?.menuDays || 28,
    });
  }

  // POST
  if (req.method === "POST") {
    try {
      const data = req.body;
      if (!data.recipes || !data.ingredientNames || !data.menu28) {
        return res.status(400).json({ error: "Invalid database format" });
      }
      await put("recipes/database.json", JSON.stringify(data), {
        access: "public",
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN!,
      });
      return res.json({ ok: true, recipes: Object.keys(data.recipes).length, menu: data.menu28.length });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // GET
  const db = await blobGet("recipes/database");
  if (!db) return res.status(404).json({ error: "No recipe database uploaded" });
  return res.json(db);
}
