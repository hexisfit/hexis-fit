import type { VercelRequest, VercelResponse } from "@vercel/node";
import { list } from "@vercel/blob";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN!;
const BACKUP_SECRET = process.env.BACKUP_SECRET || process.env.COACH_PWD || "";

async function blobGet(key: string): Promise<any> {
  try {
    const r = await list({ prefix: key + ".json", token: TOKEN });
    if (!r.blobs.length) return null;
    const resp = await fetch(r.blobs[0].url);
    if (!resp.ok) return null;
    return await resp.json();
  } catch { return null; }
}

async function getAllClients(): Promise<Record<string, any>> {
  const clients: Record<string, any> = {};
  try {
    let cursor: string | undefined;
    do {
      const r = await list({ prefix: "clients/", token: TOKEN, cursor });
      for (const blob of r.blobs) {
        const alias = blob.pathname.replace("clients/", "").replace(".json", "");
        if (!alias) continue;
        try {
          const resp = await fetch(blob.url);
          if (resp.ok) clients[alias] = await resp.json();
        } catch {}
      }
      cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor);
  } catch {}
  return clients;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth check
  const secret = (req.headers["x-backup-secret"] as string) || 
                 (req.query.secret as string) || "";
  if (!BACKUP_SECRET || secret !== BACKUP_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const [recipes, clients] = await Promise.all([
      blobGet("recipes/database"),
      getAllClients()
    ]);

    const backup = {
      version: 1,
      timestamp: new Date().toISOString(),
      recipes: recipes || { recipes: {}, ingredientNames: {}, menu28: [], meta: {} },
      clients: clients,
      stats: {
        recipeCount: recipes ? Object.keys(recipes.recipes || {}).length : 0,
        clientCount: Object.keys(clients).length,
        menuEntries: recipes ? (recipes.menu28 || []).length : 0
      }
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", 
      `attachment; filename="hexis-backup-${new Date().toISOString().slice(0,10)}.json"`);
    return res.status(200).json(backup);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Backup failed" });
  }
}

export const config = { maxDuration: 30 };
