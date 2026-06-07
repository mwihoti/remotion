# Image Video Studio

Creator dashboard for generating short-form videos from prompts and images.

The app uses Next.js for the creator UI, AI models for script and scene planning, and Remotion for video preview/rendering.

## Commands

```console
npm i
npm run dev
npm run studio
npm run lint
npm run build
```

Render the default image video locally:

```console
npm run render:image
```

## AI Model Setup

Local Kimi K2.5 through Ollama:

```console
ollama pull kimi-k2.5
```

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=kimi-k2.5
```

Hosted model through OpenRouter:

```env
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=moonshotai/kimi-k2.5
```

If no model is configured, the app still generates a basic local script fallback.

## Creator Flow

1. Choose a format: portrait, landscape, square, or wide.
2. Enter a video prompt.
3. Add optional images.
4. Generate a script.
5. Edit scenes, captions, and voiceover.
6. Preview with the Remotion Player.

MP4 export works locally through Remotion. Hosted Vercel export needs a persistent renderer such as Remotion Lambda or a separate worker service.
