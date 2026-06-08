import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Greenscape Proposal Agent",
  description: "AI proposal drafting workflow for Greenscape Pro"
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

