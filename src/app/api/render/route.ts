import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { normalizeVideoPlan, VideoPlan } from "../../../lib/video-plan";

export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

interface RenderRequest {
  plan?: Partial<VideoPlan>;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RenderRequest;
  const plan = normalizeVideoPlan(body.plan ?? {});
  const id = `${Date.now()}`;
  const outputDir = path.join(process.cwd(), "public", "renders");
  const propsDir = path.join(process.cwd(), ".tmp", "remotion-props");
  const outputPath = path.join(outputDir, `creator-${id}.mp4`);
  const propsPath = path.join(propsDir, `creator-${id}.json`);

  await mkdir(outputDir, { recursive: true });
  await mkdir(propsDir, { recursive: true });
  await writeFile(propsPath, JSON.stringify({ plan }, null, 2));

  try {
    await execFileAsync("npx", ["remotion", "render", "ImageVideo", outputPath, `--props=${propsPath}`], {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 20,
      env: process.env,
    });

    return NextResponse.json({ url: `/renders/creator-${id}.mp4` });
  } catch (error) {
    const detail =
      error && typeof error === "object" && "stderr" in error
        ? String((error as { stderr?: unknown }).stderr)
        : error instanceof Error
          ? error.message
          : "Unknown render error";

    return NextResponse.json({ error: "Render failed", detail }, { status: 500 });
  }
}
