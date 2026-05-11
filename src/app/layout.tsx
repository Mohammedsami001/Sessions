import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sessions | The Ultimate Study OS",
  description: "Synchronized Pomodoro timers, live study rooms, lofi beats, and gamified analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
