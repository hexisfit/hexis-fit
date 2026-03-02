const COACH_PWD = "29051980";
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || "sk-b892e099b1dd4ba98c0cfefa5ca8fae0";
const H = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "*" };

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") return new Response(null, { headers: H });

  const pwd = req.headers.get("x-coach-pwd") || "";
  if (pwd !== COACH_PWD) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: H });

  if (req.method !== "POST") return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: H });

  try {
    const body = await req.json();
    const { type, name, ingredients } = body;

    let prompt = "";

    if (type === "ingredient") {
      prompt = `Ты помощник для фитнес-приложения. Переведи название продукта питания "${name}" на 4 языка и сгенерируй ключ.
Ответь СТРОГО JSON без пояснений, без markdown:
{"key":"snake_case_latin_key","en":"English name","de":"Deutscher Name","uk":"Назва українською","es":"Nombre en español"}
key — латиницей в snake_case, кратко описывает продукт.`;
    } else if (type === "recipe") {
      const ingText = ingredients ? `\nИнгредиенты: ${ingredients}` : "";
      prompt = `Ты помощник для фитнес-приложения. Рецепт блюда: "${name}"${ingText}

Заполни данные. Ответь СТРОГО JSON без markdown, без пояснений:
{
  "names":{"en":"English name","de":"Deutscher Name","ru":"Русское название","uk":"Назва українською","es":"Nombre en español"},
  "steps":[
    {"en":"Step 1","de":"Schritt 1","ru":"Шаг 1","uk":"Крок 1","es":"Paso 1"},
    {"en":"Step 2","de":"Schritt 2","ru":"Шаг 2","uk":"Крок 2","es":"Paso 2"}
  ]
}
names — название блюда на 5 языках.
steps — 3-6 коротких шагов приготовления, каждый на 5 языках. Простые и понятные инструкции.`;
    } else if (type === "ingredient_edit") {
      prompt = `Переведи название продукта питания "${name}" на 4 языка.
Ответь СТРОГО JSON без markdown:
{"en":"English","de":"Deutsch","uk":"Українська","es":"Español"}`;
    } else {
      return new Response(JSON.stringify({ error: "Unknown type" }), { status: 400, headers: H });
    }

    const aiRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "Ты помощник-переводчик для фитнес-приложения. Отвечаешь ТОЛЬКО валидным JSON. Без markdown, без ```json, без пояснений." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return new Response(JSON.stringify({ error: "DeepSeek API error: " + aiRes.status, details: errText }), { status: 502, headers: H });
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Try to extract JSON from response
    let parsed = null;
    try {
      // Remove possible markdown fences
      const clean = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      // Try direct parse
      try { parsed = JSON.parse(content); } catch {}
    }

    if (!parsed) {
      return new Response(JSON.stringify({ error: "AI returned invalid JSON", raw: content.substring(0, 500) }), { status: 500, headers: H });
    }

    return new Response(JSON.stringify({ ok: true, data: parsed }), { headers: H });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: H });
  }
}

export const config = { runtime: "edge" };
