import type { VercelRequest, VercelResponse } from "@vercel/node";
import { put } from "@vercel/blob";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const pwd = req.headers["x-coach-pwd"] as string || "";
  if (pwd !== process.env.COACH_PWD) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { recipeId, base64, contentType } = req.body;

    if (!recipeId || !base64) {
      return res.status(400).json({ error: "recipeId and base64 required" });
    }

    // Decode base64 - handle both raw base64 and data URI
    let rawBase64 = base64;
    let mime = contentType || "image/jpeg";
    if (base64.startsWith("data:")) {
      const match = base64.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mime = match[1];
        rawBase64 = match[2];
      }
    }

    const buffer = Buffer.from(rawBase64, "base64");

    // Max 2MB
    if (buffer.length > 2 * 1024 * 1024) {
      return res.status(400).json({ error: "Image too large (max 2MB)" });
    }

    const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
    const filename = `photos/${recipeId}.${ext}`;

    const blob = await put(filename, buffer, {
      access: "public",
      contentType: mime,
      token: process.env.BLOB_READ_WRITE_TOKEN!,
      addRandomSuffix: false,
    });

    return res.status(200).json({ url: blob.url });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};
