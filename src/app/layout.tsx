import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stoneridge Proposal Agent",
  description: "AI proposal drafting workflow for Stoneridge Outdoor Living"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
