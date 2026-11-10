"use client";

import React, { useState } from "react";
import { BIOMES } from "@/lib/biomes";
import { BiomeRegion } from "@/types/pokemon";
import { Search, Volume2, VolumeX } from "lucide-react";
import { Icon } from "@iconify/react";
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

const BIOME_ICONS: Record<string, string> = {
  "iguazu-rainforest": "solar:waterdrop-bold",
  "perito-moreno-glacier": "solar:snowflake-bold",
  "humahuaca-canyon": "tabler:mountain",
  "buenos-aires-metropolis": "solar:buildings-bold",
  "aconcagua-summit": "tabler:feather",
  "valdes-peninsula": "solar:waves-bold",
};

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
  const [isBgmPlaying, setIsBgmPlaying] = useState(sfx.getIsBgmPlaying());

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sfx.setMuted(nextMuted);
    if (!nextMuted) {
      sfx.playButtonPress();
    }
  };

  const toggleBgm = () => {
    const playing = sfx.toggleBgm();
    setIsBgmPlaying(playing);
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
                POKÉRADAR{" "}
                <span className="text-slate-800 font-semibold">GEO</span>
              </h1>
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

        {/* Audio, Search, Type filter Controls */}
        <div className="flex items-center gap-2">
          {/* Pokémon Red Title Screen Theme Music Toggle */}
          <button
            onClick={toggleBgm}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              isBgmPlaying
                ? "bg-red-600 border-red-700 text-white shadow-sm shadow-red-500/30 scale-105"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
            title={
              isBgmPlaying
                ? "Pausar música de Pokémon Rojo"
                : "Reproducir tema oficial de Pokémon Rojo"
            }
          >
            <Icon
              icon={isBgmPlaying ? "solar:music-note-bold" : "solar:music-note-linear"}
              width={16}
              height={16}
              className={isBgmPlaying ? "animate-pulse" : ""}
            />
            <span className="hidden xl:inline text-[11px] font-bold">
              {isBgmPlaying ? "MÚSICA ON" : "MÚSICA"}
            </span>
          </button>

          {/* Mute/Unmute sound effects toggle */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? "bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600"
                : "bg-red-50 border-red-200 text-red-600 shadow-xs"
            }`}
            title={
              isMuted ? "Activar efectos sonoros" : "Silenciar efectos sonoros"
            }
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4 animate-pulse" />
            )}
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
              onChange={(e) => {
                sfx.playButtonPress();
                onTypeChange(e.target.value);
              }}
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

      {/* Biome Icons Selector with Hover Tooltip */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md shadow-slate-200/50 pointer-events-auto self-start">
        <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-500 tracking-wide">
          <Icon icon="solar:compass-bold" width={14} height={14} className="text-red-500" />
          <span>BIOMAS:</span>
        </span>

        {BIOMES.map((biome) => {
          const isActive = biome.id === activeBiome.id;
          const iconName = BIOME_ICONS[biome.id] || "solar:map-point-bold";

          return (
            <div key={biome.id} className="relative group">
              <button
                onClick={() => {
                  sfx.playSwitch();
                  onSelectBiome(biome);
                }}
                className={`relative p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md scale-105"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:scale-105"
                }`}
                style={{
                  borderBottom: isActive ? `2px solid ${biome.accentColor}` : undefined,
                }}
                title={biome.name}
                aria-label={biome.name}
              >
                <Icon
                  icon={iconName}
                  width={18}
                  height={18}
                  style={{ color: isActive ? "#ffffff" : biome.accentColor }}
                />
              </button>

              {/* Tooltip on hover */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
                <div className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-semibold shadow-xl border border-slate-700/50 flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: biome.accentColor }}
                  />
                  <span>{biome.name}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Active biome name displayed next to icons */}
        <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-800 border-l border-slate-200">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: activeBiome.accentColor }}
          />
          <span className="truncate max-w-[180px] sm:max-w-none">{activeBiome.name}</span>
        </div>
      </div>
    </header>
  );
}
