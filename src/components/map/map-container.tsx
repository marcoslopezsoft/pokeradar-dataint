"use client";

import dynamic from "next/dynamic";
import { Radio } from "lucide-react";
import { PokemonRadarEntity, BiomeRegion } from "@/types/pokemon";

interface MapContainerProps {
  pokemonList: PokemonRadarEntity[];
  activeBiome: BiomeRegion;
  selectedPokemon: PokemonRadarEntity | null;
  onSelectPokemon: (pokemon: PokemonRadarEntity) => void;
  onSelectBiome?: (biome: BiomeRegion) => void;
}

const DynamicMapView = dynamic(
  () => import("./map-view").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 gap-4">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-200">
          <Radio className="w-8 h-8 text-red-500 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-red-400/40 animate-ping" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-sans text-sm font-bold tracking-wider text-red-600">
            SINTONIZANDO SEÑAL GEOESPACIAL...
          </p>
          <p className="font-sans text-xs text-slate-400">
            Cargando motor de tiles MapLibre GL
          </p>
        </div>
      </div>
    ),
  }
);

export function MapContainer(props: MapContainerProps) {
  return <DynamicMapView {...props} />;
}
