"use client";

import React, { useState } from "react";
import { PokemonRadarEntity } from "@/types/pokemon";
import { Users, Trash2 } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { TeamAnalysisModal } from "./team-analysis-modal";

interface PartyDockProps {
  party: PokemonRadarEntity[];
  onSelectPokemon: (pokemon: PokemonRadarEntity) => void;
  onReleasePokemon: (id: number) => void;
  selectedId?: number | null;
}

export function PartyDock({
  party,
  onSelectPokemon,
  onReleasePokemon,
  selectedId,
}: PartyDockProps) {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const maxPartySize = 6;
  const slots = Array.from({ length: maxPartySize }, (_, i) => party[i] || null);

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-full px-4">
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-slate-300/50">
          <button
            onClick={() => setIsAnalysisOpen(true)}
            className="hidden sm:flex flex-col items-center justify-center px-3 border-r border-slate-200 text-[10px] font-medium text-slate-700 hover:text-red-600 transition-colors cursor-pointer group"
            title="Abrir diagnóstico táctico del equipo"
          >
            <Users className="w-4 h-4 mb-0.5 text-red-600 group-hover:scale-115 transition-transform" />
            <span className="font-bold tracking-wide">EQUIPO</span>
            <span className="text-slate-400 font-medium">
              {party.length}/{maxPartySize}
            </span>
          </button>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {slots.map((pokemon, idx) => {
              if (!pokemon) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="w-12 h-12 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 flex items-center justify-center text-slate-400 text-xs font-semibold transition-colors"
                    title={`Ranura ${idx + 1} Vacía`}
                  >
                    {idx + 1}
                  </div>
                );
              }

              const isSelected = selectedId === pokemon.id;

              return (
                <div
                  key={`party-${pokemon.id}-${idx}`}
                  className="group relative"
                >
                  <button
                    onClick={() => onSelectPokemon(pokemon)}
                    className={`relative w-12 h-12 rounded-xl p-1 flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-red-50 border-2 border-red-500 shadow-md shadow-red-500/20 scale-105"
                        : "bg-white border border-slate-200 hover:border-red-400 hover:shadow-xs hover:scale-105"
                    }`}
                    title={`${pokemon.displayName} (Nv. ${pokemon.level})`}
                  >
                    {pokemon.animatedSprite ? (
                      <img
                        src={pokemon.animatedSprite}
                        alt={pokemon.displayName}
                        className="w-10 h-10 object-contain pixelated"
                      />
                    ) : pokemon.sprite ? (
                      <img
                        src={pokemon.sprite}
                        alt={pokemon.displayName}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">
                        {pokemon.id}
                      </span>
                    )}

                    <span className="absolute -top-1 -right-1 bg-red-600 border border-white text-[9px] font-bold text-white px-1.5 rounded-full shadow-xs">
                      {pokemon.level}
                    </span>
                  </button>

                  {/* Release button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sfx.playRelease();
                      onReleasePokemon(pokemon.id);
                    }}
                    className="absolute -bottom-1 -right-1 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-red-600/90 text-white hover:bg-red-500 transition-all shadow-md cursor-pointer"
                    title="Liberar del equipo"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <TeamAnalysisModal
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        party={party}
      />
    </>
  );
}
