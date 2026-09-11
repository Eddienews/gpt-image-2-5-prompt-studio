import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GPT Image 2.5 Prompt Studio",
  description: "Build precise GPT Image 2.5 prompts for generation, editing, reconstruction, reference remixing, and repair.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
