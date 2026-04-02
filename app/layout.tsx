import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalClickEffects from "./components/GlobalClickEffects";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Planty — Bring Nature Home",
  description: "Discover and buy beautiful plants — bonsai, flowering, water plants, succulents, indoor greens and herbs. Delivered to your door.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div className="app-fixed-bg" aria-hidden="true" />
        <GlobalClickEffects />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
