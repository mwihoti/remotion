export const TikTokConfig = {
  appName: "Daily Habit Hub",
  url: "daily-habit-hub.vercel.app",
  colors: {
    black: "#000000",
    orange: "#FF6B2B",
    green: "#39FF14", // Neon green
    white: "#FFFFFF",
  },
  scenes: [
    {
      id: "hook",
      duration: 4 * 30, // 4s
      text: "What if your gym streak made you money?",
      spoken: "What if every time you worked out… you actually got paid?",
    },
    {
      id: "problem",
      duration: 6 * 30, // 6s
      text: "Most fitness apps give you NOTHING for showing up.",
      spoken: "You grind every day — run, lift, sweat — and your reward is… a digital badge nobody cares about.",
    },
    {
      id: "reveal",
      duration: 8 * 30, // 8s
      text: ["Daily Habit Hub", "Check in daily", "Earn $HABIT tokens", "On Avalanche blockchain"],
      spoken: "We built Daily Habit Hub. You check in, you work out, and the blockchain mints you real crypto — automatically, zero gas fees, no MetaMask, nothing. Just tap and earn.",
    },
    {
      id: "proof",
      duration: 10 * 30, // 10s
      text: ["NFT badges that PROVE your consistency", "Forever on-chain", "Can't fake it"],
      spoken: "Hit a 7-day streak? You get a soulbound NFT. 30 days? Another one. These aren't screenshots — they live on the Avalanche blockchain forever. Your fitness record, verified on-chain.",
    },
    {
      id: "community",
      duration: 7 * 30, // 7s
      text: ["Top Community", "Real people. Real streaks.", "Nairobi to the world 🌍"],
      spoken: "There's a leaderboard. There's a community. There are certified trainers you can book directly in the app. This isn't just a fitness tracker — it's a Web3 ecosystem.",
    },
    {
      id: "wallet",
      duration: 7 * 30, // 7s
      text: ["No crypto experience needed", "1 tap = your wallet", "Gasless. Forever."],
      spoken: "No crypto experience needed. One tap creates your wallet inside the app. We pay the gas. You just work out.",
    },
    {
      id: "cta",
      duration: 10 * 30, // 10s
      text: ["🔥 FREE to join", "daily-habit-hub.vercel.app", "Link in bio"],
      spoken: "It's free. It's live right now. Every workout you skip from today is $HABIT you're leaving on the table. Link in bio — go build your streak.",
    },
  ]
};
