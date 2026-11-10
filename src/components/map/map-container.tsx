"use client";

import dynamic from "next/dynamic";
import { Radio } from "lucide-react";
import { PokemonRadarEntity, BiomeRegion } from "@/types/pokemon";

interface MapContainerProps {
  pokemonList: PokemonRadarEntity[];
  activeBiome: BiomeRegion;
  selectedPokemon: PokemonRadarEntity | null;
  onSelectPokemon: (pokemon: PokemonRadarEntity) => void;
}

const DynamicMapView = dynamic(
  () => import("./map-view").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-4">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-cyan-950/40 border border-cyan-500/30">
          <Radio className="w-8 h-8 text-cyan-400 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-mono text-sm font-semibold tracking-wider text-cyan-300">
            SINTONIZANDO SEÑAL GEOESPACIAL...
          </p>
          <p className="font-mono text-xs text-slate-500">
            Cargando motor de tiles vectoriales MapLibre GL
          </p>
        </div>
      </div>
    ),
  }
);

export function MapContainer(props: MapContainerProps) {
  return <DynamicMapView {...props} />;
}
