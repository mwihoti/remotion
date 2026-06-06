export interface ImageVideoSlide {
  image: string;
  caption: string;
  duration: number;
  position?: "center" | "top" | "bottom";
}

export const ImageVideoConfig = {
  title: "Daily Habit Hub",
  subtitle: "Build habits. Earn rewards. Own the proof.",
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
      duration: 90,
    },
    {
      image: "app_checkin.png",
      caption: "Check in daily",
      duration: 90,
    },
    {
      image: "app_progress.png",
      caption: "Track every milestone",
      duration: 90,
    },
    {
      image: "app_achievements.png",
      caption: "Unlock achievement NFTs",
      duration: 90,
    },
    {
      image: "app_community.png",
      caption: "Climb with your community",
      duration: 90,
    },
    {
      image: "app_badge.png",
      caption: "Own the proof forever",
      duration: 90,
    },
  ] satisfies ImageVideoSlide[],
};
