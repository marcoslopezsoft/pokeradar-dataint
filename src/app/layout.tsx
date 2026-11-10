import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PokéRadar Geoespacial · DataInt",
  description:
    "Exploración geoespacial interactiva del mundo Pokémon con biomas reales, clima en vivo y MapLibre GL.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full dark`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950"
      >
        {children}
      </body>
    </html>
  );
}
