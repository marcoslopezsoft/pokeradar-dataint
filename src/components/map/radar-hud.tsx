"use client";

import React, { useState, useEffect, useRef } from "react";
import { BIOMES } from "@/lib/biomes";
import { BiomeRegion, PokemonRadarEntity } from "@/types/pokemon";
import { Search, Volume2, VolumeX } from "lucide-react";
import { Icon } from "@iconify/react";
import { WeatherBadge } from "../weather/weather-badge";
import { sfx } from "@/lib/sound-effects";
import { translateTypeToSpanish } from "@/lib/utils";
import { AudioSettingsModal } from "../audio/audio-settings-modal";
import { TYPE_CONFIG } from "../pokemon/type-badge";

interface RadarHudProps {
  activeBiome: BiomeRegion;
  onSelectBiome: (biome: BiomeRegion) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  totalSpotted: number;
  party?: PokemonRadarEntity[];
  onOpenTeamAnalysis?: () => void;
}

const AVAILABLE_TYPES: string[] = [
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
  party = [],
  onOpenTeamAnalysis,
}: RadarHudProps) {
  const [isMuted, setIsMuted] = useState(sfx.getIsMuted());
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribe = sfx.subscribeVolume(() => {
      setIsMuted(sfx.getIsMuted());
    });
    return unsubscribe;
  }, []);

  // Close type dropdown on click outside (supporting both desktop mouse and mobile touch)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(e.target as Node)
      ) {
        setIsTypeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="fixed top-3 left-3 right-3 z-30 flex flex-col gap-2.5 max-w-7xl mx-auto pointer-events-none">
        {/* Top Pokédex Navigation Bar: higher z-index (z-30) so dropdown always floats on top */}
        <div className="relative z-30 flex flex-wrap items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-slate-200/50 pointer-events-auto">
          {/* Brand & Pokeball Icon */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 hover:scale-110 hover:rotate-12 cursor-pointer">
              <img
                src="/pokeball-icon.webp"
                alt="PokéRadar Pokeball"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(220,10,45,0.25)]"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-bold tracking-wide text-red-600">
                  POKÉRADAR{" "}
                  <span className="text-slate-800 font-semibold">GEO</span>
                </h1>
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-500">
                {totalSpotted} especímenes en radar
              </div>
            </div>
          </div>

          {/* Live Weather Widget for active biome (Hidden on mobile) */}
          <div className="hidden lg:flex items-center">
            <WeatherBadge
              lat={activeBiome.center[1]}
              lng={activeBiome.center[0]}
              biomeName={activeBiome.name}
            />
          </div>

          {/* Controls: Team Button (if party > 0), Audio Modal, Search, Type Filter Modal */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Team analysis button in navbar, ONLY visible if user has Pokémon in party */}
            {party.length > 0 && onOpenTeamAnalysis && (
              <button
                onClick={() => {
                  sfx.playMenuOpen();
                  onOpenTeamAnalysis();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-red-500/25 transition-all cursor-pointer animate-in fade-in duration-200"
                title="Abrir diagnóstico del equipo"
                aria-label="Diagnóstico del equipo"
              >
                <Icon icon="solar:users-group-rounded-bold" width={16} height={16} />
                <span className="hidden sm:inline">EQUIPO</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
                  {party.length}/6
                </span>
              </button>
            )}

            {/* Audio Settings Icon Button */}
            <button
              onClick={() => {
                sfx.playButtonPress();
                setIsAudioModalOpen(true);
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isMuted
                  ? "bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600"
                  : "bg-red-50 border-red-200 text-red-600 shadow-xs hover:bg-red-100"
              }`}
              title="Ajustes de Sonido y Música"
              aria-label="Ajustes de Sonido"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4 animate-pulse" />
              )}
            </button>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-20 xs:w-28 sm:w-44 pl-7 sm:pl-8 pr-2 sm:pr-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 transition-all"
              />
            </div>

            {/* Custom Type Filter Dropdown with Icons */}
            <div className="relative" ref={typeDropdownRef}>
              <button
                onClick={() => {
                  sfx.playButtonPress();
                  setIsTypeDropdownOpen((prev) => !prev);
                }}
                className={`px-2 sm:px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold ${
                  selectedType !== "all"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/80"
                }`}
                title="Filtrar por Tipo"
                aria-expanded={isTypeDropdownOpen}
              >
                <Icon
                  icon={
                    selectedType === "all"
                      ? "solar:filter-bold"
                      : TYPE_CONFIG[selectedType]?.icon || "solar:filter-bold"
                  }
                  width={15}
                  height={15}
                  className={selectedType !== "all" ? "text-red-400" : "text-slate-500"}
                />
                <span className="hidden sm:inline">
                  {selectedType === "all"
                    ? "Tipos"
                    : TYPE_CONFIG[selectedType]?.label || translateTypeToSpanish(selectedType)}
                </span>
                <Icon
                  icon="solar:alt-arrow-down-linear"
                  width={13}
                  height={13}
                  className={`text-slate-400 transition-transform ${
                    isTypeDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isTypeDropdownOpen && (
                <>
                  {/* Backdrop on mobile so dropdown has high contrast and closes on tap outside */}
                  <div
                    className="fixed inset-0 z-40 sm:hidden bg-slate-900/20 backdrop-blur-xs"
                    onClick={() => setIsTypeDropdownOpen(false)}
                  />

                  <div className="absolute right-0 top-full mt-2 w-48 sm:w-52 max-h-72 overflow-y-auto no-scrollbar rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      onClick={() => {
                        sfx.playButtonPress();
                        onTypeChange("all");
                        setIsTypeDropdownOpen(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        selectedType === "all"
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon icon="solar:globus-bold" width={15} height={15} className="text-slate-500" />
                        <span>Todos los tipos</span>
                      </div>
                      {selectedType === "all" && (
                        <Icon icon="solar:check-circle-bold" width={14} height={14} className="text-emerald-400" />
                      )}
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    {AVAILABLE_TYPES.filter((t) => t !== "all").map((type) => {
                      const cfg = TYPE_CONFIG[type];
                      const isSelected = selectedType === type;
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            sfx.playButtonPress();
                            onTypeChange(type);
                            setIsTypeDropdownOpen(false);
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-slate-900 text-white"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon
                              icon={cfg?.icon || "solar:record-circle-bold"}
                              width={15}
                              height={15}
                              className={isSelected ? "text-white" : cfg?.text || "text-slate-600"}
                            />
                            <span>{cfg?.label || translateTypeToSpanish(type)}</span>
                          </div>
                          {isSelected && (
                            <Icon icon="solar:check-circle-bold" width={14} height={14} className="text-emerald-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Vertical Biomes Selector: Lower z-index (z-10) so it never sits on top of open menus */}
        <div className="relative z-10 self-start pointer-events-auto flex flex-col items-center gap-1.5 p-1.5 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-slate-200/50">
          <span className="text-[8px] font-extrabold text-slate-400 tracking-wider text-center uppercase leading-none pt-0.5">
            Biomas
          </span>

          {BIOMES.map((biome) => {
            const isActive = biome.id === activeBiome.id;

            return (
              <div key={biome.id} className="relative flex items-center group">
                <button
                  onClick={() => {
                    sfx.playSwitch();
                    onSelectBiome(biome);
                  }}
                  className={`relative w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-all flex items-center justify-center cursor-pointer p-0.5 ${
                    isActive
                      ? "scale-115 z-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
                      : "opacity-65 hover:opacity-100 hover:scale-110 drop-shadow-xs"
                  }`}
                  title={biome.name}
                  aria-label={biome.name}
                >
                  {/* Authentic compact Pokéball vector icon */}
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full transition-transform duration-200"
                  >
                    {/* Top Hemisphere dome filled with biome accent color */}
                    <path
                      d="M 50 10 c 19.9 0 36.3 14.7 39.4 34 H 66.2 C 63.6 34.6 57.4 30 50 30 s -13.6 4.6 -16.2 14 H 10.6 C 13.7 24.7 30.1 10 50 10 z"
                      fill={biome.accentColor}
                    />
                    {/* Bottom Hemisphere dome filled with white */}
                    <path
                      d="M 50 90 c -19.9 0 -36.3 -14.7 -39.4 -34 h 23.2 C 36.4 65.4 42.6 70 50 70 s 13.6 -4.6 16.2 -14 h 23.2 c -3.1 19.3 -19.5 34 -39.4 34 z"
                      fill="#ffffff"
                    />
                    {/* Center button circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="10"
                      fill="#ffffff"
                    />
                    {/* Pokéball vector stencil: rim, belt and center button ring */}
                    <path
                      d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 10c19.9 0 36.3 14.7 39.4 34H66.2C63.6 34.6 57.4 30 50 30s-13.6 4.6-16.2 14H10.6C13.7 24.7 30.1 10 50 10zm0 80c-19.9 0-36.3-14.7-39.4-34h23.2C36.4 65.4 42.6 70 50 70s13.6-4.6 16.2-14h23.2c-3.1 19.3-19.5 34-39.4 34zm0-50c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10z"
                      fill={isActive ? biome.accentColor : "#475569"}
                    />
                  </svg>
                </button>

                {/* Active Biome Name extends HORIZONTALLY to the right (hidden when type dropdown is open to prevent visual clutter) */}
                {isActive && !isTypeDropdownOpen ? (
                  <div className="absolute left-full ml-2.5 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-semibold shadow-xl border border-slate-700/60 flex items-center gap-1.5 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200 z-20 pointer-events-none">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 animate-ping"
                      style={{ backgroundColor: biome.accentColor }}
                    />
                    <span className="leading-none">{biome.name}</span>
                  </div>
                ) : (
                  /* Hover tooltip extends HORIZONTALLY to the right */
                  <div className="absolute left-full ml-2.5 px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-[10px] font-medium shadow-md hidden group-hover:flex items-center gap-1 whitespace-nowrap z-20 pointer-events-none">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: biome.accentColor }}
                    />
                    <span>{biome.name}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </header>

      {/* Audio Settings Modal */}
      <AudioSettingsModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
      />
    </>
  );
}
