export interface VideoPlanSlide {
  image: string;
  caption: string;
  voiceover?: string;
  duration: number;
  position?: "center" | "top" | "bottom";
}

export interface VideoPlan {
  title: string;
  subtitle: string;
  hook: string;
  cta: string;
  url: string;
  colors: {
    background: string;
    surface: string;
    accent: string;
    orange: string;
    text: string;
  };
  slides: VideoPlanSlide[];
}

export const defaultVideoPlan: VideoPlan = {
  title: "Daily Habit Hub",
  subtitle: "Build habits. Earn rewards. Own the proof.",
  hook: "What if your gym streak made you money?",
  cta: "Start your streak",
  url: "daily-habit-hub.vercel.app",
  colors: {
    background: "#05070a",
    surface: "#101820",
    accent: "#39FF14",
    orange: "#FF6B2B",
    text: "#FFFFFF",
  },
  slides: [
    {
      image: "app_home.png",
      caption: "Start your streak",
      voiceover: "Open the app and begin a habit streak that compounds every day.",
      duration: 90,
    },
    {
      image: "app_checkin.png",
      caption: "Check in daily",
      voiceover: "Log each workout with one tap and keep your momentum visible.",
      duration: 90,
    },
    {
      image: "app_progress.png",
      caption: "Track every milestone",
      voiceover: "See progress, streaks, and consistency patterns at a glance.",
      duration: 90,
    },
    {
      image: "app_achievements.png",
      caption: "Unlock achievement NFTs",
      voiceover: "Earn permanent badges for the habits you actually build.",
      duration: 90,
    },
    {
      image: "app_community.png",
      caption: "Climb with your community",
      voiceover: "Stay accountable with a community that moves with you.",
      duration: 90,
    },
    {
      image: "app_badge.png",
      caption: "Own the proof forever",
      voiceover: "Your consistency becomes proof you can keep.",
      duration: 90,
    },
  ],
};

export const normalizeVideoPlan = (plan: Partial<VideoPlan>): VideoPlan => ({
  ...defaultVideoPlan,
  ...plan,
  colors: {
    ...defaultVideoPlan.colors,
    ...plan.colors,
  },
  slides:
    plan.slides?.map((slide) => ({
      ...slide,
      duration: Math.max(60, slide.duration ?? 90),
      caption: slide.caption || "Untitled scene",
      image: slide.image || defaultVideoPlan.slides[0].image,
    })) ?? defaultVideoPlan.slides,
});

export const getVideoPlanDuration = (plan: VideoPlan) =>
  plan.slides.reduce((total, slide) => total + slide.duration, 0) + 120;
