"use client";

import React, { useState } from "react";
import { BIOMES } from "@/lib/biomes";
import { BiomeRegion } from "@/types/pokemon";
import { Compass, Search, Volume2, VolumeX, Sparkles } from "lucide-react";
import { WeatherBadge } from "../weather/weather-badge";
import { sfx } from "@/lib/sound-effects";

interface RadarHudProps {
  activeBiome: BiomeRegion;
  onSelectBiome: (biome: BiomeRegion) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  totalSpotted: number;
}

const AVAILABLE_TYPES = [
  "all",
  "water",
  "fire",
  "grass",
  "electric",
  "ice",
  "rock",
  "ground",
  "flying",
  "dragon",
];

export function RadarHud({
  activeBiome,
  onSelectBiome,
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  totalSpotted,
}: RadarHudProps) {
  const [isMuted, setIsMuted] = useState(sfx.getIsMuted());

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sfx.setMuted(nextMuted);
    if (!nextMuted) {
      sfx.playRadarPing();
    }
  };

  return (
    <header className="fixed top-3 left-3 right-3 z-30 flex flex-col gap-2.5 max-w-7xl mx-auto pointer-events-none">
      {/* Top Pokédex Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0f1420]/90 backdrop-blur-xl border border-red-500/30 shadow-2xl shadow-red-950/40 pointer-events-auto">
        {/* Brand & Pokédex Sensor Lights */}
        <div className="flex items-center gap-3">
          {/* Main Blue Sensor + 3 LEDs (Classic Pokédex) */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-300 border-2 border-white/80 shadow-md animate-pokedex-sensor">
              <div className="w-2.5 h-2.5 rounded-full bg-white/70 transform -translate-x-1 -translate-y-1" />
            </div>
            <div className="flex items-center gap-1.5 pl-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-1 ring-red-400 shadow-[0_0_8px_#ef4444]" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 ring-1 ring-yellow-300 shadow-[0_0_8px_#eab308]" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-1 ring-emerald-300 shadow-[0_0_8px_#10b981]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold font-mono tracking-wider text-[#ffcb05] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                POKÉRADAR <span className="text-white font-normal">GEO</span>
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-600 text-white shadow-sm shadow-red-600/50">
                DATAINT
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {totalSpotted} especímenes en radar
            </div>
          </div>
        </div>

        {/* Live Weather Widget for active biome */}
        <div className="hidden md:flex items-center">
          <WeatherBadge
            lat={activeBiome.center[1]}
            lng={activeBiome.center[0]}
            biomeName={activeBiome.name}
          />
        </div>

        {/* Search, Type filter & Sound Mute Toggle */}
        <div className="flex items-center gap-2">
          {/* Mute/Unmute sound toggle */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? "bg-slate-900/80 border-slate-700 text-slate-500"
                : "bg-red-950/40 border-red-500/40 text-yellow-400 shadow-sm shadow-red-900/30"
            }`}
            title={isMuted ? "Activar efectos sonoros" : "Silenciar efectos sonoros"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
          </button>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar Pokémon..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-32 sm:w-44 pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer capitalize"
            >
              <option value="all">Tipos (Todos)</option>
              {AVAILABLE_TYPES.filter((t) => t !== "all").map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Biome Nav Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pointer-events-auto no-scrollbar">
        <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Compass className="w-3.5 h-3.5 text-red-500" />
          <span>Biomas:</span>
        </span>
        {BIOMES.map((biome) => {
          const isActive = biome.id === activeBiome.id;
          return (
            <button
              key={biome.id}
              onClick={() => {
                sfx.playRadarPing();
                onSelectBiome(biome);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold border border-yellow-400 shadow-md shadow-red-600/40 scale-105"
                  : "bg-slate-950/80 hover:bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full ring-1 ring-white/50"
                style={{ backgroundColor: biome.accentColor }}
              />
              <span>{biome.name}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
