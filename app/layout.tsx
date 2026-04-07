import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthSessionSync from "./components/AuthSessionSync";
import GlobalBackground from "./components/GlobalBackground";
import GlobalClickEffects from "./components/GlobalClickEffects";
import PageTransition from "./components/PageTransition";

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
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <GlobalBackground />
        <GlobalClickEffects />
        <AuthSessionSync />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
