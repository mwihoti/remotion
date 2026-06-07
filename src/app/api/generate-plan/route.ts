import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { defaultVideoPlan, normalizeVideoPlan, VideoPlan } from "../../../lib/video-plan";

export const runtime = "nodejs";

interface GeneratePlanRequest {
  description?: string;
  images?: string[];
  plan?: Partial<VideoPlan>;
}

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "subtitle", "hook", "cta", "url", "colors", "slides"],
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
    hook: { type: "string" },
    cta: { type: "string" },
    url: { type: "string" },
    colors: {
      type: "object",
      additionalProperties: false,
      required: ["background", "surface", "accent", "orange", "text"],
      properties: {
        background: { type: "string" },
        surface: { type: "string" },
        accent: { type: "string" },
        orange: { type: "string" },
        text: { type: "string" },
      },
    },
    slides: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["image", "caption", "voiceover", "duration", "position"],
        properties: {
          image: { type: "string" },
          caption: { type: "string" },
          voiceover: { type: "string" },
          duration: { type: "number" },
          position: { enum: ["center", "top", "bottom"] },
        },
      },
    },
  },
};

const inferCaption = (image: string) =>
  image
    .split("/")
    .pop()!
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+-/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const fallbackPlan = (body: GeneratePlanRequest) => {
  const current = normalizeVideoPlan(body.plan ?? defaultVideoPlan);
  const images = body.images?.length ? body.images : current.slides.map((slide) => slide.image);

  return normalizeVideoPlan({
    ...current,
    hook: body.description ? `Turn this into a habit people can see: ${current.title}` : current.hook,
    slides: images.map((image, index) => ({
      image,
      caption: index === 0 ? current.cta : inferCaption(image),
      voiceover: `${inferCaption(image)} helps the viewer understand the product in seconds.`,
      duration: 90,
      position: "center",
    })),
  });
};

const mimeForImage = (image: string) => {
  if (image.endsWith(".png")) return "image/png";
  if (image.endsWith(".webp")) return "image/webp";
  if (image.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
};

const readImageAsDataUrl = async (image: string) => {
  const fullPath = path.join(process.cwd(), "public", image);
  const data = await readFile(fullPath);
  return `data:${mimeForImage(image)};base64,${data.toString("base64")}`;
};

const parseModelJson = (content: string) => {
  try {
    return JSON.parse(content) as Partial<VideoPlan>;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Model did not return JSON");
    }

    return JSON.parse(match[0]) as Partial<VideoPlan>;
  }
};

export async function POST(request: Request) {
  const body = (await request.json()) as GeneratePlanRequest;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ plan: fallbackPlan(body), usedAi: false });
  }

  const current = normalizeVideoPlan(body.plan ?? defaultVideoPlan);
  const images = body.images?.length ? body.images : current.slides.map((slide) => slide.image);
  const imageParts = await Promise.all(
    images.slice(0, 10).map(async (image) => ({
      type: "image_url",
      image_url: {
        url: await readImageAsDataUrl(image),
      },
    })),
  );

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Image Video Studio",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "video_plan",
          strict: true,
          schema,
        },
      },
      messages: [
        {
          role: "system",
          content:
            "You are a concise short-form video strategist. Return only JSON matching the schema. Use the provided image filenames exactly. Create punchy captions, a strong hook, a clear CTA, and practical voiceover lines.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: JSON.stringify({
                productDescription: body.description,
                currentPlan: current,
                imageFilenames: images,
              }),
            },
            ...imageParts,
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json({ error: "OpenRouter request failed", detail }, { status: 502 });
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return NextResponse.json({ error: "OpenRouter returned no content" }, { status: 502 });
  }

  return NextResponse.json({ plan: normalizeVideoPlan(parseModelJson(content)), usedAi: true });
}
