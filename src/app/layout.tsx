import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
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
      className={`${poppins.variable} ${poppins.className} h-full`}
    >
      <body
        suppressHydrationWarning
        className={`${poppins.className} min-h-full flex flex-col bg-[#f8fafc] text-slate-800 antialiased selection:bg-[#ffcb05] selection:text-slate-900`}
      >
        {children}
      </body>
    </html>
  );
}
