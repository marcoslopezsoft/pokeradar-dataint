"use client";

import React from "react";
import { BIOMES } from "@/lib/biomes";
import { BiomeRegion } from "@/types/pokemon";
import { Compass, Search, Filter, Radio } from "lucide-react";
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
  return (
    <header className="fixed top-3 left-3 right-3 z-30 flex flex-col gap-2.5 max-w-7xl mx-auto pointer-events-none">
      {/* Top Navbar Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-cyan-950/40 pointer-events-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold font-mono tracking-wider text-white">
                POKÉRADAR <span className="text-cyan-400">GEO</span>
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                DATAINT
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {totalSpotted} especímenes detectados en radar
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

        {/* Search & Type filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar Pokémon..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-36 sm:w-48 pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer capitalize"
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
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
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
                  ? "bg-cyan-500 text-slate-950 font-bold border border-cyan-300 shadow-md shadow-cyan-500/20 scale-105"
                  : "bg-slate-950/75 hover:bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-slate-700"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
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
