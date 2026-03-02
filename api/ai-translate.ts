import type { VercelRequest, VercelResponse } from "@vercel/node";

const COACH_PWD = "29051980";
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || "sk-b892e099b1dd4ba98c0cfefa5ca8fae0";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");

  if (req.method === "OPTIONS") return res.status(200).end();

  const pwd = (req.headers["x-coach-pwd"] as string) || "";
  if (pwd !== COACH_PWD) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { type: tp, name, ingredients } = req.body || {};

    let prompt = "";

    if (tp === "ingredient") {
      prompt = `Переведи продукт "${name}" на 4 языка и сгенерируй ключ. Ответь СТРОГО JSON: {"key":"snake_case","en":"English","de":"Deutsch","uk":"Українська","es":"Español"}`;
    } else if (tp === "recipe") {
      prompt = `Рецепт: "${name}"${ingredients ? ". Ингредиенты: " + ingredients : ""}. Ответь СТРОГО JSON: {"names":{"en":"","de":"","ru":"","uk":"","es":""},"steps":[{"en":"","de":"","ru":"","uk":"","es":""}]} names=название 5 языков, steps=3-6 шагов на 5 языках`;
    } else if (tp === "ingredient_edit") {
      prompt = `Переведи продукт "${name}" на 4 языка. JSON: {"en":"","de":"","uk":"","es":""}`;
    } else {
      return res.status(400).json({ error: "Unknown type" });
    }

    const aiRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + DEEPSEEK_KEY
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "Отвечай ТОЛЬКО валидным JSON. Без markdown, без ```." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return res.status(502).json({ error: "DeepSeek " + aiRes.status, details: errText.substring(0, 200) });
    }

    const aiData: any = await aiRes.json();
    const content: string = aiData.choices?.[0]?.message?.content || "";

    let parsed: any = null;
    try {
      const clean = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const m = clean.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    } catch {
      try { parsed = JSON.parse(content); } catch { /* ignore */ }
    }

    if (!parsed) {
      return res.status(500).json({ error: "Invalid AI response", raw: content.substring(0, 300) });
    }

    return res.status(200).json({ ok: true, data: parsed });

  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
