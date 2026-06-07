export interface VideoPlanSlide {
  image: string;
  caption: string;
  voiceover?: string;
  duration: number;
  position?: "center" | "top" | "bottom";
}

export type VideoFormatId = "portrait" | "landscape" | "square" | "wide";

export interface VideoFormat {
  id: VideoFormatId;
  label: string;
  width: number;
  height: number;
}

export interface VideoPlan {
  title: string;
  subtitle: string;
  hook: string;
  cta: string;
  url: string;
  format: VideoFormat;
  colors: {
    background: string;
    surface: string;
    accent: string;
    orange: string;
    text: string;
  };
  slides: VideoPlanSlide[];
}

export const videoFormats: VideoFormat[] = [
  { id: "portrait", label: "Portrait 9:16", width: 720, height: 1280 },
  { id: "landscape", label: "Landscape 16:9", width: 1280, height: 720 },
  { id: "square", label: "Square 1:1", width: 1080, height: 1080 },
  { id: "wide", label: "Wide 21:9", width: 1920, height: 820 },
];

export const getVideoFormat = (id?: string) =>
  videoFormats.find((format) => format.id === id) ?? videoFormats[0];

export const defaultVideoPlan: VideoPlan = {
  title: "Untitled Video",
  subtitle: "Use a prompt or images to create your video.",
  hook: "Write a prompt to generate a script.",
  cta: "Create video",
  url: "",
  format: getVideoFormat("portrait"),
  colors: {
    background: "#05070a",
    surface: "#101820",
    accent: "#39FF14",
    orange: "#FF6B2B",
    text: "#FFFFFF",
  },
  slides: [],
};

export const normalizeVideoPlan = (plan: Partial<VideoPlan>): VideoPlan => ({
  ...defaultVideoPlan,
  ...plan,
  format: getVideoFormat(plan.format?.id ?? plan.format?.label ?? defaultVideoPlan.format.id),
  colors: {
    ...defaultVideoPlan.colors,
    ...plan.colors,
  },
  slides:
    plan.slides?.map((slide) => ({
      ...slide,
      duration: Math.max(60, slide.duration ?? 90),
      caption: slide.caption || "Untitled scene",
      image: slide.image ?? "",
    })) ?? defaultVideoPlan.slides,
});

export const getVideoPlanDuration = (plan: VideoPlan) =>
  plan.slides.reduce((total, slide) => total + slide.duration, 0) + 120;
