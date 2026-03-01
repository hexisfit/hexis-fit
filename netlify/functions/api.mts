import { getStore } from "@netlify/blobs";
import type { Context, Config } from "@netlify/functions";

const COACH_PWD = "29051980";

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const path = url.pathname.replace("/api", "");

  // Auth check (password in header)
  const pwd = req.headers.get("x-coach-pwd");
  if (pwd !== COACH_PWD) return unauthorized();

  const store = getStore({ name: "clients", consistency: "strong" });

  // POST /api/clients — create client
  if (req.method === "POST" && path === "/clients") {
    try {
      const data = await req.json();
      if (!data.alias || !data.name) {
        return json({ error: "alias and name required" }, 400);
      }
      // Sanitize alias
      const alias = data.alias.toLowerCase().replace(/[^a-z0-9_-]/g, "");
      if (!alias) return json({ error: "Invalid alias" }, 400);

      const clientData = {
        name: data.name,
        alias,
        heightMet: data.heightMet || "165 cm",
        weightMet: data.weightMet || "60 kg",
        heightImp: data.heightImp || "5'5\"",
        weightImp: data.weightImp || "132 lbs",
        kcal: data.kcal || "1500-1600",
        city: data.city || "Kleve, Germany",
        timezone: data.timezone || "Europe/Berlin",
        whatsapp: data.whatsapp || "380505827191",
        created: new Date().toISOString(),
      };

      await store.setJSON(alias, clientData);
      return json({ ok: true, alias, url: `/c/${alias}` });
    } catch (e: any) {
      return json({ error: e.message }, 500);
    }
  }

  // GET /api/clients — list all
  if (req.method === "GET" && path === "/clients") {
    const { blobs } = await store.list();
    const clients = [];
    for (const blob of blobs) {
      const data = await store.get(blob.key, { type: "json" });
      if (data) clients.push(data);
    }
    // Sort by created desc
    clients.sort((a: any, b: any) => (b.created || "").localeCompare(a.created || ""));
    return json({ clients });
  }

  // DELETE /api/clients/:alias
  if (req.method === "DELETE" && path.startsWith("/clients/")) {
    const alias = path.replace("/clients/", "");
    if (!alias) return json({ error: "alias required" }, 400);
    await store.delete(alias);
    return json({ ok: true });
  }

  return json({ error: "Not found" }, 404);
};

export const config: Config = {
  path: "/api/*",
};
