import { Context } from "elysia";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "";
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const IMAGES_DIR = join(process.cwd(), "public", "images");

async function saveImageWebp(imageBuffer: Buffer): Promise<string> {
  await mkdir(IMAGES_DIR, { recursive: true });
  const filename = `${randomUUID()}.webp`;
  const filepath = join(IMAGES_DIR, filename);

  const webpBuffer = await sharp(imageBuffer)
    .resize(512, 512, { fit: "cover" })
    .webp({ quality: 85 })
    .toBuffer();

  await writeFile(filepath, webpBuffer);
  return `${BACKEND_URL}/public/images/${filename}`;
}

export const generateImage = async (ctx: Context) => {
  try {
    if (!CLOUDFLARE_API_TOKEN) {
      ctx.set.status = 500;
      return { message: "CLOUDFLARE_API_TOKEN not configured in .env" };
    }

    if (!CLOUDFLARE_ACCOUNT_ID) {
      ctx.set.status = 500;
      return { message: "CLOUDFLARE_ACCOUNT_ID not configured in .env" };
    }

    const body = ctx.body as any;
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      ctx.set.status = 400;
      return { message: "Prompt is required" };
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudflare AI error:", response.status, errorText);
      ctx.set.status = 502;
      return { message: "Image generation failed", error: errorText };
    }

    const cfResponse = await response.json() as any;

    if (!cfResponse.success || !cfResponse.result?.image) {
      console.error("Cloudflare AI error:", JSON.stringify(cfResponse));
      ctx.set.status = 502;
      return { message: "Image generation failed" };
    }

    // result.image is base64-encoded JPEG
    const imageBuffer = Buffer.from(cfResponse.result.image, "base64");
    const imageUrl = await saveImageWebp(imageBuffer);

    ctx.set.status = 200;
    return { imageUrl };
  } catch (error) {
    console.error("Error in generateImage:", error);
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
};

export const uploadImage = async (ctx: Context) => {
  try {
    const body = ctx.body as any;

    if (!body || !body.file) {
      ctx.set.status = 400;
      return { message: "No file provided" };
    }

    const file = body.file as File;
    const imageBuffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await saveImageWebp(imageBuffer);

    ctx.set.status = 200;
    return { imageUrl };
  } catch (error) {
    console.error("Error in uploadImage:", error);
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
};
