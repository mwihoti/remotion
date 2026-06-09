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

type AiProvider = "ollama" | "openrouter" | "local";

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

const systemPrompt =
  "You are a concise short-form video strategist. Return only JSON matching the schema. Use the provided image filenames exactly. Create punchy captions, a strong hook, a clear CTA, practical voiceover lines, and keep the selected format unchanged.";

const envValue = (name: string) => process.env[name]?.trim();

const getOpenRouterApiKey = () => {
  const apiKey = envValue("OPENROUTER_API_KEY");

  if (!apiKey) {
    return undefined;
  }

  if (!apiKey.startsWith("sk-or-")) {
    throw new Error("OPENROUTER_API_KEY is set but does not look like an OpenRouter secret key. It should start with sk-or-.");
  }

  return apiKey;
};

const envNumber = (name: string, fallback: number) => {
  const value = envValue(name);
  const parsed = value ? Number(value) : Number.NaN;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const jsonHeaders = {
  "Content-Type": "application/json",
};

const inferCaption = (image: string) =>
  image.startsWith("data:")
    ? "Uploaded Image"
    : image
    .split("/")
    .pop()!
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+-/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const promptScenes = (description: string, current: VideoPlan) => {
  const topic = description.trim() || "your idea";

  return [
    {
      image: "",
      caption: "Hook",
      voiceover: `Open with the clearest reason people should care about ${topic}.`,
      duration: 90,
      position: "center" as const,
    },
    {
      image: "",
      caption: "The problem",
      voiceover: `Show the pain point or missed opportunity behind ${topic}.`,
      duration: 90,
      position: "center" as const,
    },
    {
      image: "",
      caption: "The solution",
      voiceover: `Explain how ${current.title === "Untitled Video" ? "this idea" : current.title} solves it in simple words.`,
      duration: 90,
      position: "center" as const,
    },
    {
      image: "",
      caption: "Why it works",
      voiceover: "Add one proof point, benefit, or concrete detail that makes the claim believable.",
      duration: 90,
      position: "center" as const,
    },
    {
      image: "",
      caption: current.cta || "Take action",
      voiceover: "Close with one direct next step for the viewer.",
      duration: 90,
      position: "center" as const,
    },
  ];
};

const fallbackPlan = (body: GeneratePlanRequest) => {
  const current = normalizeVideoPlan(body.plan ?? defaultVideoPlan);
  const images = body.images?.length
    ? body.images
    : current.slides.map((slide) => slide.image).filter(Boolean);
  const currentSlideByImage = new Map(current.slides.map((slide) => [slide.image, slide]));

  if (images.length === 0) {
    return normalizeVideoPlan({
      ...current,
      title: current.title === "Untitled Video" && body.description ? "Prompt Video" : current.title,
      subtitle: body.description || current.subtitle,
      hook: body.description ? `Make people care about: ${body.description}` : current.hook,
      slides: promptScenes(body.description ?? "", current),
    });
  }

  return normalizeVideoPlan({
    ...current,
    hook: body.description ? `Turn this into a habit people can see: ${current.title}` : current.hook,
    slides: images.map((image, index) => {
      const existing = currentSlideByImage.get(image);
      const caption = existing?.caption || (index === 0 ? current.cta : inferCaption(image));

      return {
        image,
        caption,
        voiceover:
          existing?.voiceover ||
          `${caption} shows why ${current.title} matters and what the viewer should do next.`,
        duration: existing?.duration ?? 90,
        position: existing?.position ?? "center",
      };
    }),
  });
};

const mimeForImage = (image: string) => {
  if (image.endsWith(".png")) return "image/png";
  if (image.endsWith(".webp")) return "image/webp";
  if (image.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
};

const readImageAsDataUrl = async (image: string) => {
  if (image.startsWith("data:") || image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const fullPath = path.join(process.cwd(), "public", image);
  const data = await readFile(fullPath);
  return `data:${mimeForImage(image)};base64,${data.toString("base64")}`;
};

const dataUrlToBase64 = (dataUrl: string) => dataUrl.replace(/^data:[^;]+;base64,/, "");

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

const createUserPrompt = ({
  body,
  current,
  images,
}: {
  body: GeneratePlanRequest;
  current: VideoPlan;
  images: string[];
}) =>
  JSON.stringify({
    productDescription: body.description,
    currentPlan: current,
    imageFilenames: images,
    instructions: [
      "If no images are provided, create text-only scenes with image set to an empty string.",
      "If images are provided, use the provided image values exactly.",
      "Preserve currentPlan.format exactly.",
      "Return valid JSON only.",
    ],
  });

const generateWithOllama = async ({
  body,
  current,
  images,
}: {
  body: GeneratePlanRequest;
  current: VideoPlan;
  images: string[];
}) => {
  const baseUrl = (envValue("OLLAMA_BASE_URL") ?? "http://127.0.0.1:11434").replace(/\/$/, "");
  const model = envValue("OLLAMA_MODEL") ?? "kimi-k2.5";
  const apiKey = envValue("OLLAMA_API_KEY");
  const imageDataUrls = await Promise.all(images.slice(0, 10).map(readImageAsDataUrl));

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      ...jsonHeaders,
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      stream: false,
      format: schema,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: createUserPrompt({ body, current, images }),
          images: imageDataUrls.map(dataUrlToBase64),
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Ollama request failed: ${detail}`);
  }

  const data = (await response.json()) as { message?: { content?: string } };
  const content = data.message?.content;

  if (!content) {
    throw new Error("Ollama returned no content");
  }

  return parseModelJson(content);
};

const generateWithOpenRouter = async ({
  body,
  current,
  images,
  apiKey,
}: {
  body: GeneratePlanRequest;
  current: VideoPlan;
  images: string[];
  apiKey: string;
}) => {
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
      ...jsonHeaders,
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": envValue("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
      "X-Title": "Image Video Studio",
    },
    body: JSON.stringify({
      model: envValue("OPENROUTER_MODEL") ?? "moonshotai/kimi-k2.5",
      max_tokens: envNumber("OPENROUTER_MAX_TOKENS", 900),
      reasoning: {
        max_tokens: envNumber("OPENROUTER_REASONING_MAX_TOKENS", 128),
        exclude: true,
      },
      temperature: 0.4,
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
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: createUserPrompt({ body, current, images }),
            },
            ...imageParts,
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenRouter request failed: ${detail}`);
  }

  const data = (await response.json()) as {
    choices?: {
      finish_reason?: string;
      message?: {
        content?: string;
        reasoning?: string;
      };
    }[];
    usage?: {
      completion_tokens?: number;
      completion_tokens_details?: {
        reasoning_tokens?: number;
      };
    };
  };
  const choice = data.choices?.[0];
  const content = choice?.message?.content;

  if (!content) {
    throw new Error(
      `OpenRouter returned no content. finish_reason=${choice?.finish_reason ?? "unknown"}, completion_tokens=${data.usage?.completion_tokens ?? "unknown"}, reasoning_tokens=${data.usage?.completion_tokens_details?.reasoning_tokens ?? "unknown"}, reasoning_length=${choice?.message?.reasoning?.length ?? 0}`,
    );
  }

  return parseModelJson(content);
};

export async function POST(request: Request) {
  const body = (await request.json()) as GeneratePlanRequest;
  const current = normalizeVideoPlan(body.plan ?? defaultVideoPlan);
  const images = body.images?.length
    ? body.images
    : current.slides.map((slide) => slide.image).filter(Boolean);

  let generatedPlan: Partial<VideoPlan>;
  let provider: AiProvider = "local";

  try {
    const openRouterApiKey = getOpenRouterApiKey();

    if (envValue("AI_PROVIDER") === "ollama" || envValue("OLLAMA_MODEL") || envValue("OLLAMA_BASE_URL")) {
      generatedPlan = await generateWithOllama({ body, current, images });
      provider = "ollama";
    } else if (openRouterApiKey) {
      generatedPlan = await generateWithOpenRouter({
        body,
        current,
        images,
        apiKey: openRouterApiKey,
      });
      provider = "openrouter";
    } else {
      generatedPlan = fallbackPlan(body);
      provider = "local";
    }
  } catch (error) {
    return NextResponse.json({
      warning: "Model generation failed; used local fallback",
      detail: error instanceof Error ? error.message : "Unknown model error",
      plan: fallbackPlan(body),
      provider: "local" satisfies AiProvider,
      usedAi: false,
    });
  }

  return NextResponse.json({
    plan: normalizeVideoPlan({
      ...generatedPlan,
      format: generatedPlan.format ?? current.format,
    }),
    provider,
    usedAi: provider !== "local",
  });
}
