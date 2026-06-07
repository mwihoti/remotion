import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  title: "Video Creator",
  description: "Create AI-assisted image videos with Remotion.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
