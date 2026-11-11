"use client";

import React from "react";
import Image from "next/image";
import { PokemonRadarEntity } from "@/types/pokemon";
import { Trash2 } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { PokedexSensorCluster } from "@/components/ui/pokedex-sensors";

interface PartyDockProps {
  party: PokemonRadarEntity[];
  onSelectPokemon: (pokemon: PokemonRadarEntity) => void;
  onReleasePokemon: (id: number) => void;
  selectedId?: number | null;
  isDrawerOpen?: boolean;
}

export function PartyDock({
  party,
  onSelectPokemon,
  onReleasePokemon,
  selectedId,
  isDrawerOpen = false,
}: PartyDockProps) {
  const maxPartySize = 6;
  const slots = Array.from({ length: maxPartySize }, (_, i) => party[i] || null);

  return (
    <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-full px-2 sm:px-3 pointer-events-auto">
      {/* Authentic Pokédex Red Chassis (glides smoothly left when desktop DetailDrawer opens) */}
      <div
        className={`will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-linear-to-b from-[#dc0a2d] to-[#b00722] border-2 border-[#7f0417] shadow-2xl shadow-red-950/35 ${
          isDrawerOpen ? "md:-translate-x-56" : "translate-x-0"
        }`}
      >
        {/* Top Pokédex Sensor Bar: Blue Lens + 3 Status LEDs + Counter & Hardware Vents */}
        <div className="flex items-center justify-between px-1 pb-1.5 sm:pb-2">
          <PokedexSensorCluster size="sm" />

          <div className="flex items-center gap-2">
            <span className="text-[9px] sm:text-[10px] font-extrabold tracking-widest uppercase text-white/95 drop-shadow-xs">
              Pokédex · {party.length}/6
            </span>
            <div className="hidden min-[380px]:flex items-center gap-0.5" aria-hidden="true">
              <span className="w-2.5 h-1 rounded-full bg-[#7f0417]/75" />
              <span className="w-2.5 h-1 rounded-full bg-[#7f0417]/75" />
            </div>
          </div>
        </div>

        {/* Recessed LCD Screen Tray */}
        <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-100 border-2 border-[#7f0417]/55 shadow-inner">
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {slots.map((pokemon, idx) => {
              if (!pokemon) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="w-10.5 h-10.5 sm:w-12 sm:h-12 rounded-xl border border-dashed border-slate-300 bg-slate-200/75 flex items-center justify-center text-slate-400 font-mono text-xs font-bold select-none"
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
                    className={`relative w-10.5 h-10.5 sm:w-12 sm:h-12 rounded-xl p-1 flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-50 border-2 border-red-500 shadow-md shadow-red-500/25 -translate-y-0.5'
                        : 'bg-white border border-slate-300 hover:border-red-400 hover:shadow-xs hover:-translate-y-0.5'
                    }`}
                    title={`${pokemon.displayName} (Nv. ${pokemon.level})`}
                  >
                    {pokemon.animatedSprite ? (
                      <Image
                        src={pokemon.animatedSprite}
                        alt={pokemon.displayName}
                        width={40}
                        height={40}
                        unoptimized
                        className="w-8.5 h-8.5 sm:w-10 sm:h-10 object-contain pixelated pointer-events-none"
                      />
                    ) : pokemon.sprite ? (
                      <Image
                        src={pokemon.sprite}
                        alt={pokemon.displayName}
                        width={40}
                        height={40}
                        unoptimized
                        className="w-8.5 h-8.5 sm:w-10 sm:h-10 object-contain pointer-events-none"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">
                        {pokemon.id}
                      </span>
                    )}

                    {/* Level Badge (Nv. + level) */}
                    <span className="absolute -top-1.5 -right-2 min-w-5 h-4.5 px-1.5 flex items-center justify-center bg-red-600 border border-white text-[8px] font-bold tracking-tight text-white rounded-full shadow-xs z-10 leading-none tabular-nums whitespace-nowrap">
                      Nv. {pokemon.level}
                    </span>
                  </button>

                  {/* Release button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sfx.playRelease();
                      onReleasePokemon(pokemon.id);
                    }}
                    className="absolute -bottom-1 -right-1 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-red-600 text-white hover:bg-red-500 transition-all shadow-md cursor-pointer z-20"
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
    </div>
  );
}
