// ─── EDIT THIS FILE TO CUSTOMIZE FOR EACH PROJECT ───────────────────────────

export const config = {
  // App identity
  appName: "NetPulse",
  tagline: "Monitor your network. In real time.",
  accentColor: "#00f5a0",       // primary brand color
  bgColor: "#0a0a0f",           // background
  textColor: "#ffffff",

  // Hero scene
  heroSubtitle: "Fast. Reliable. Developer-first.",
  ctaText: "Get Started Free",

  // Feature scenes — add/remove as needed
  features: [
    {
      title: "Real-time Monitoring",
      description: "Watch your network metrics live with sub-second updates.",
      icon: "📡",
    },
    {
      title: "Instant Alerts",
      description: "Get notified the moment something goes wrong.",
      icon: "🔔",
    },
    {
      title: "Beautiful Dashboards",
      description: "Visualize traffic, latency, and uptime at a glance.",
      icon: "📊",
    },
  ],

  // Closing scene
  closingLine: "Start monitoring in under 2 minutes.",
  website: "netpulse.dev",
};

export type AppConfig = typeof config;
