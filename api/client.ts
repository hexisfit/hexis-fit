import { put, list } from "@vercel/blob";

const COACH_PWD = "29051980";
const H: Record<string, string> = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "*",
};

async function blobGet(key: string): Promise<any> {
  try {
    const r = await list({
      prefix: key + ".json",
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });
    if (!r.blobs.length) return null;
    const resp = await fetch(r.blobs[0].url);
    return resp.ok ? await resp.json() : null;
  } catch {
    return null;
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: H });
  }

  const pwd = req.headers.get("x-coach-pwd") || "";
  if (pwd !== COACH_PWD) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: H,
    });
  }

  const url = new URL(req.url);

  // GET /api/recipes/stats
  if (url.pathname.endsWith("/stats")) {
    const db: any = await blobGet("recipes/database");
    if (!db) {
      return new Response(JSON.stringify({ uploaded: false }), { headers: H });
    }
    return new Response(
      JSON.stringify({
        uploaded: true,
        totalRecipes: Object.keys(db.recipes).length,
        totalIngredients: Object.keys(db.ingredientNames).length,
        menuDays: db.meta?.menuDays || 28,
      }),
      { headers: H }
    );
  }

  // POST /api/recipes
  if (req.method === "POST") {
    try {
      const data = await req.json();
      if (!data.recipes || !data.ingredientNames || !data.menu28) {
        return new Response(
          JSON.stringify({ error: "Invalid database format" }),
          { status: 400, headers: H }
        );
      }
      await put("recipes/database.json", JSON.stringify(data), {
        access: "public",
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN!,
      });
      return new Response(
        JSON.stringify({
          ok: true,
          recipes: Object.keys(data.recipes).length,
          menu: data.menu28.length,
        }),
        { headers: H }
      );
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: H,
      });
    }
  }

  // GET /api/recipes
  const db = await blobGet("recipes/database");
  if (!db) {
    return new Response(
      JSON.stringify({ error: "No recipe database uploaded" }),
      { status: 404, headers: H }
    );
  }
  return new Response(JSON.stringify(db), { headers: H });
}
export const config = { runtime: "nodejs20.x" };
