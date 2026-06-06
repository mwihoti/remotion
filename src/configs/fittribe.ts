import { AppConfig } from "../config";

export const fitTribeConfig: AppConfig = {
  appName: "Fit Tribe",
  tagline: "Focus · Ignite · Tenacity · Transform · Resilience · Inspire · Believe · Endure",
  accentColor: "#28b85a",
  bgColor: "#141a26",
  textColor: "#f5f2ec",

  heroSubtitle: "Build habits. Earn rewards. On-chain.",
  ctaText: "Start Your Streak",

  features: [
    {
      title: "Daily Check-In",
      description:
        "Record your habit on-chain every day. Each check-in mints $HABIT tokens — your consistency becomes a real asset.",
      icon: "✅",
    },
    {
      title: "Track Your Progress",
      description:
        "Visualize streaks, consistency calendars, and milestones. Every 7, 30, and 100 days earns you a unique Achievement NFT.",
      icon: "📈",
    },
    {
      title: "Daily Tasks",
      description:
        "Break your goals into focused daily tasks. Stay on track with structured routines that build momentum.",
      icon: "🎯",
    },
    {
      title: "Set & Crush Goals",
      description:
        "Define what you're training toward. Fit Tribe keeps you accountable and celebrates every win — big or small.",
      icon: "🏆",
    },
  ],

  closingLine: "Build the habit. Own the proof.",
  website: "daily-habit-hub.vercel.app",
};
