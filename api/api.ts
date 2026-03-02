import { put, list, head, del } from "@vercel/blob";

const COACH_PWD = "29051980";

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

async function blobGet(key: string): Promise<any> {
  try {
    const resp = await fetch(`${process.env.BLOB_STORE_URL || ""}/${key}.json`);
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

async function blobSet(key: string, data: any): Promise<void> {
  await put(`${key}.json`, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
    token: process.env.BLOB_READ_WRITE_TOKEN!,
  });
}

async function blobDel(key: string): Promise<void> {
  try {
    const info = await head(`${key}.json`, { token: process.env.BLOB_READ_WRITE_TOKEN! });
    if (info) await del(info.url, { token: process.env.BLOB_READ_WRITE_TOKEN! });
  } catch {}
}

async function blobList(prefix: string): Promise<string[]> {
  const result = await list({ prefix, token: process.env.BLOB_READ_WRITE_TOKEN! });
  return result.blobs.map(b => b.pathname.replace(".json", ""));
}

export default async function handler(req: Request) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
    });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace("/api", "");

  const pwd = req.headers.get("x-coach-pwd");
  if (pwd !== COACH_PWD) return unauthorized();

  // POST /api/recipes — загрузка базы рецептов
  if (req.method === "POST" && path === "/recipes") {
    try {
      const data = await req.json();
      if (!data.recipes || !data.ingredientNames || !data.menu28) {
        return json({ error: "Invalid database format" }, 400);
      }
      await blobSet("recipes/database", data);
      return json({
        ok: true,
        recipes: Object.keys(data.recipes).length,
        menu: data.menu28.length,
      });
    } catch (e: any) {
      return json({ error: e.message }, 500);
    }
  }

  // GET /api/recipes — получение полной базы
  if (req.method === "GET" && path === "/recipes") {
    const db = await blobGet("recipes/database");
    if (!db) return json({ error: "No recipe database uploaded" }, 404);
    return json(db);
  }

  // GET /api/recipes/stats — статистика
  if (req.method === "GET" && path === "/recipes/stats") {
    const db: any = await blobGet("recipes/database");
    if (!db) return json({ uploaded: false });
    return json({
      uploaded: true,
      totalRecipes: Object.keys(db.recipes).length,
      totalIngredients: Object.keys(db.ingredientNames).length,
      menuDays: db.meta?.menuDays || 28,
    });
  }

  // POST /api/clients — создание клиента
  if (req.method === "POST" && path === "/clients") {
    try {
      const data = await req.json();
      if (!data.alias || !data.name) return json({ error: "alias and name required" }, 400);

      const alias = data.alias.toLowerCase().replace(/[^a-z0-9_-]/g, "");
      if (!alias) return json({ error: "Invalid alias" }, 400);

      const clientData = {
        name: data.name,
        alias,
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
      return json({ ok: true, alias, url: "/c/" + alias });
    } catch (e: any) {
      return json({ error: e.message }, 500);
    }
  }

  // GET /api/clients — список клиентов
  if (req.method === "GET" && path === "/clients") {
    const keys = await blobList("clients/");
    const clients = [];
    for (const key of keys) {
      const data = await blobGet(key);
      if (data) clients.push(data);
    }
    clients.sort((a: any, b: any) => (b.created || "").localeCompare(a.created || ""));
    return json({ clients });
  }

  // DELETE /api/clients/:alias — удаление клиента
  if (req.method === "DELETE" && path.startsWith("/clients/")) {
    const alias = path.replace("/clients/", "");
    if (!alias) return json({ error: "alias required" }, 400);
    await blobDel("clients/" + alias);
    return json({ ok: true });
  }

  return json({ error: "Not found" }, 404);
}

export const runtime = "nodejs";
