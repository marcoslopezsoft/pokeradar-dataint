"use client";

import React from "react";
import confetti from "canvas-confetti";
import { PokemonRadarEntity } from "@/types/pokemon";
import { Sparkles, Trash2, ShieldAlert } from "lucide-react";
import Image from "next/image";

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
  const maxPartySize = 6;
  const slots = Array.from({ length: maxPartySize }, (_, i) => party[i] || null);

  const handleConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.9 },
      colors: ["#38bdf8", "#f59e0b", "#10b981", "#ec4899"],
    });
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-full px-4">
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-cyan-950/50">
        <div className="hidden sm:flex flex-col items-center justify-center px-3 border-r border-slate-800 text-[10px] font-mono text-cyan-400">
          <Sparkles className="w-4 h-4 mb-0.5 text-cyan-400 animate-pulse" />
          <span className="font-bold">EQUIPO</span>
          <span className="text-slate-400">
            {party.length}/{maxPartySize}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {slots.map((pokemon, idx) => {
            if (!pokemon) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="w-12 h-12 rounded-xl border border-dashed border-slate-700/60 bg-slate-900/30 flex items-center justify-center text-slate-600 text-xs font-mono transition-colors"
                  title={`Ranura ${idx + 1} Vacía`}
                >
                  #{idx + 1}
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
                      ? "bg-cyan-500/20 border-2 border-cyan-400 shadow-md shadow-cyan-500/30 scale-105"
                      : "bg-slate-900/80 border border-slate-700/80 hover:border-slate-500 hover:scale-105"
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
                    <span className="text-xs font-mono text-slate-400">
                      #{pokemon.id}
                    </span>
                  )}

                  <span className="absolute -top-1 -right-1 bg-cyan-900 border border-cyan-400/50 text-[9px] font-mono font-bold text-cyan-200 px-1 rounded-full">
                    {pokemon.level}
                  </span>
                </button>

                {/* Release button on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
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
  );
}
