"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Sparkles,
  MapPin,
  Ruler,
  Weight,
  ShieldCheck,
  Volume2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { PokemonRadarEntity } from "@/types/pokemon";
import { StatsBars } from "./stats-bars";
import { CryPlayer } from "./cry-player";
import { sfx } from "@/lib/sound-effects";

interface DetailDrawerProps {
  pokemon: PokemonRadarEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToParty: (pokemon: PokemonRadarEntity) => void;
  isInParty: boolean;
  isPartyFull: boolean;
}

const TYPE_THEMES: Record<
  string,
  { bgGradient: string; badgeBg: string; accentColor: string }
> = {
  grass: {
    bgGradient: "from-[#48d0b0] to-[#38b293]",
    badgeBg: "bg-white/25",
    accentColor: "#48d0b0",
  },
  fire: {
    bgGradient: "from-[#fb6c6c] to-[#e64a4a]",
    badgeBg: "bg-white/25",
    accentColor: "#fb6c6c",
  },
  water: {
    bgGradient: "from-[#77befe] to-[#58a0e8]",
    badgeBg: "bg-white/25",
    accentColor: "#77befe",
  },
  electric: {
    bgGradient: "from-[#ffd86f] to-[#e6be48]",
    badgeBg: "bg-white/25",
    accentColor: "#ffd86f",
  },
  bug: {
    bgGradient: "from-[#a8b820] to-[#8d9a1b]",
    badgeBg: "bg-white/25",
    accentColor: "#a8b820",
  },
  normal: {
    bgGradient: "from-[#a8a878] to-[#8a8a60]",
    badgeBg: "bg-white/25",
    accentColor: "#a8a878",
  },
  poison: {
    bgGradient: "from-[#a040a0] to-[#803380]",
    badgeBg: "bg-white/25",
    accentColor: "#a040a0",
  },
  ground: {
    bgGradient: "from-[#e0c068] to-[#cbb050]",
    badgeBg: "bg-white/25",
    accentColor: "#e0c068",
  },
  fairy: {
    bgGradient: "from-[#ee99ac] to-[#d87c91]",
    badgeBg: "bg-white/25",
    accentColor: "#ee99ac",
  },
  fighting: {
    bgGradient: "from-[#c03028] to-[#9f2720]",
    badgeBg: "bg-white/25",
    accentColor: "#c03028",
  },
  psychic: {
    bgGradient: "from-[#f85888] to-[#d43a6a]",
    badgeBg: "bg-white/25",
    accentColor: "#f85888",
  },
  rock: {
    bgGradient: "from-[#b8a038] to-[#968228]",
    badgeBg: "bg-white/25",
    accentColor: "#b8a038",
  },
  ghost: {
    bgGradient: "from-[#705898] to-[#564278]",
    badgeBg: "bg-white/25",
    accentColor: "#705898",
  },
  ice: {
    bgGradient: "from-[#98d8d8] to-[#74bcbc]",
    badgeBg: "bg-white/25",
    accentColor: "#98d8d8",
  },
  dragon: {
    bgGradient: "from-[#7038f8] to-[#5324c4]",
    badgeBg: "bg-white/25",
    accentColor: "#7038f8",
  },
  steel: {
    bgGradient: "from-[#b8b8d0] to-[#9999b4]",
    badgeBg: "bg-white/25",
    accentColor: "#b8b8d0",
  },
  dark: {
    bgGradient: "from-[#705848] to-[#503f34]",
    badgeBg: "bg-white/25",
    accentColor: "#705848",
  },
};

export function DetailDrawer({
  pokemon,
  isOpen,
  onClose,
  onAddToParty,
  isInParty,
  isPartyFull,
}: DetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"about" | "stats">("about");

  if (!pokemon) return null;

  const primaryType = pokemon.types[0]?.toLowerCase() || "normal";
  const theme =
    TYPE_THEMES[primaryType] || {
      bgGradient: "from-[#3b82f6] to-[#1d4ed8]",
      badgeBg: "bg-white/25",
      accentColor: "#3b82f6",
    };

  const handleCapture = () => {
    onAddToParty(pokemon);
    sfx.playCatchSuccess();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#38bdf8", "#eab308", "#10b981", "#ef4444"],
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Behance Pokédex Sheet Drawer */}
          <motion.aside
            initial={{ x: "100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0d121d] z-50 flex flex-col shadow-2xl overflow-y-auto no-scrollbar"
          >
            {/* Top Color Card with Pokéball Watermark (Behance Layout) */}
            <div
              className={`relative p-6 pt-5 bg-gradient-to-br ${theme.bgGradient} text-white overflow-hidden pb-14`}
            >
              {/* Pokéball Background Watermark */}
              <svg
                viewBox="0 0 100 100"
                className="absolute -right-6 -bottom-6 w-56 h-56 text-white/15 pointer-events-none transform rotate-12"
                fill="currentColor"
              >
                <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 10c19.9 0 36.3 14.7 39.4 34H66.2C63.6 34.6 57.4 30 50 30s-13.6 4.6-16.2 14H10.6C13.7 24.7 30.1 10 50 10zm0 80c-19.9 0-36.3-14.7-39.4-34h23.2C36.4 65.4 42.6 70 50 70s13.6-4.6 16.2-14h23.2c-3.1 19.3-19.5 34-39.4 34zm0-50c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10z" />
              </svg>

              {/* Navigation Header */}
              <div className="relative z-10 flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
                  aria-label="Volver"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md">
                    Nv. {pokemon.level}
                  </span>
                  <button
                    onClick={handleCapture}
                    disabled={isInParty || isPartyFull}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
                    title={isInParty ? "En el equipo" : "Capturar"}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isInParty ? "fill-white text-white" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Pokemon Title & #ID */}
              <div className="relative z-10 mt-3 flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold capitalize tracking-tight font-sans">
                    {pokemon.displayName}
                  </h2>
                  {/* Type Pills */}
                  <div className="flex items-center gap-2 mt-2">
                    {pokemon.types.map((type) => (
                      <span
                        key={type}
                        className="px-3.5 py-1 rounded-full text-xs font-medium bg-white/25 backdrop-blur-md shadow-sm uppercase tracking-wide"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <span className="text-xl font-bold text-white/80 font-mono tracking-wider">
                  #{String(pokemon.id).padStart(3, "0")}
                </span>
              </div>

              {/* Overlapping Sprite Showcase */}
              <div className="relative z-20 flex justify-center -mb-24 mt-2">
                <motion.div
                  initial={{ scale: 0.8, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="relative"
                >
                  {pokemon.animatedSprite ? (
                    <img
                      src={pokemon.animatedSprite}
                      alt={pokemon.displayName}
                      className="w-44 h-44 object-contain pixelated filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
                    />
                  ) : (
                    <img
                      src={pokemon.sprite}
                      alt={pokemon.displayName}
                      className="w-44 h-44 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
                    />
                  )}
                </motion.div>
              </div>
            </div>

            {/* Bottom Sheet Card (Behance Rounded Tabs & Stats) */}
            <div className="flex-1 rounded-t-[32px] bg-[#121824] pt-14 p-6 flex flex-col justify-between space-y-6 border-t border-slate-800/80">
              {/* Tab Navigators: Acerca de / Estadísticas Base */}
              <div>
                <div className="flex items-center justify-around border-b border-slate-800 pb-3 mb-5">
                  <button
                    onClick={() => setActiveTab("about")}
                    className={`font-sans text-sm font-semibold transition-all relative pb-2 cursor-pointer ${
                      activeTab === "about"
                        ? "text-white"
                        : "text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    <span>Acerca de</span>
                    {activeTab === "about" && (
                      <motion.div
                        layoutId="active-tab-line"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full"
                      />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("stats")}
                    className={`font-sans text-sm font-semibold transition-all relative pb-2 cursor-pointer ${
                      activeTab === "stats"
                        ? "text-white"
                        : "text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    <span>Estadísticas Base</span>
                    {activeTab === "stats" && (
                      <motion.div
                        layoutId="active-tab-line"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full"
                      />
                    )}
                  </button>
                </div>

                {/* Tab Content: About */}
                {activeTab === "about" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* Physical Specs Card */}
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
                          <Ruler className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <div className="text-[11px] font-medium text-slate-400">
                            Altura
                          </div>
                          <div className="text-sm font-bold text-slate-100">
                            {pokemon.height} m
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
                          <Weight className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <div className="text-[11px] font-medium text-slate-400">
                            Peso
                          </div>
                          <div className="text-sm font-bold text-slate-100">
                            {pokemon.weight} kg
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Biome Origin Info */}
                    <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-2">
                      <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>Hábitat y Detección</span>
                      </div>
                      <div className="text-xs font-medium text-slate-200">
                        Avistado en{" "}
                        <strong className="text-white font-bold">
                          {pokemon.biomeName}
                        </strong>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Coordenadas: {pokemon.coordinates[1].toFixed(3)}° S,{" "}
                        {pokemon.coordinates[0].toFixed(3)}° O
                      </div>
                    </div>

                    {/* Audio Cry Player */}
                    <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                        <Volume2 className="w-4 h-4 text-red-400" />
                        <span>Alarido de PokéAPI</span>
                      </div>
                      <CryPlayer cryUrl={pokemon.cryUrl} name={pokemon.displayName} />
                    </div>
                  </motion.div>
                )}

                {/* Tab Content: Base Stats */}
                {activeTab === "stats" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60"
                  >
                    <StatsBars stats={pokemon.stats} />
                  </motion.div>
                )}
              </div>

              {/* Bottom Reclutar Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleCapture}
                  disabled={isInParty || isPartyFull}
                  className={`w-full py-3.5 px-4 rounded-2xl font-sans text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                    isInParty
                      ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
                      : isPartyFull
                      ? "bg-amber-950/40 border border-amber-800/50 text-amber-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white border border-yellow-400/80 shadow-red-600/40 hover:scale-[1.01]"
                  }`}
                >
                  {isInParty ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>EN TU EQUIPO DE EXPEDICIÓN</span>
                    </>
                  ) : isPartyFull ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>EQUIPO COMPLETO (6/6)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>RECLUTAR AL EQUIPO DE EXPEDICIÓN</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
