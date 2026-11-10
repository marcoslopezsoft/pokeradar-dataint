"use client";

import React, { useState } from "react";
import { BIOMES } from "@/lib/biomes";
import { BiomeRegion } from "@/types/pokemon";
import { Compass, Search, Volume2, VolumeX } from "lucide-react";
import { WeatherBadge } from "../weather/weather-badge";
import { sfx } from "@/lib/sound-effects";
import { translateTypeToSpanish } from "@/lib/utils";

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
  "normal",
  "fighting",
  "poison",
  "psychic",
  "bug",
  "ghost",
  "steel",
  "fairy",
  "dark",
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
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-slate-200/50 pointer-events-auto">
        {/* Brand & Pokeball Icon */}
        <div className="flex items-center gap-2.5">
          {/* Authentic Pokeball Icon */}
          <div className="relative flex items-center justify-center w-8 h-8 transition-transform duration-300 hover:scale-110 hover:rotate-12 cursor-pointer">
            <img
              src="/pokeball-icon.webp"
              alt="PokéRadar Pokeball"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(220,10,45,0.25)]"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wide text-red-600">
                POKÉRADAR <span className="text-slate-800 font-semibold">GEO</span>
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-600 text-white shadow-sm shadow-red-600/30">
                DATAINT
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-500">
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
                ? "bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600"
                : "bg-red-50 border-red-200 text-red-600 shadow-xs"
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
              className="w-32 sm:w-44 pl-8 pr-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white cursor-pointer"
            >
              <option value="all">Tipos (Todos)</option>
              {AVAILABLE_TYPES.filter((t) => t !== "all").map((type) => (
                <option key={type} value={type}>
                  {translateTypeToSpanish(type)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Biome Nav Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pointer-events-auto no-scrollbar">
        <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/90 border border-slate-200 text-[11px] font-medium text-slate-600 shadow-xs">
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold border border-yellow-400 shadow-md shadow-red-600/30 scale-105"
                  : "bg-white/90 hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 hover:border-slate-300 shadow-xs"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full ring-1 ring-slate-300"
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
