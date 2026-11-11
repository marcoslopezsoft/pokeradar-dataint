"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { BIOMES } from "@/lib/biomes";
import { fetchPokemonData, transformToRadarEntity } from "@/lib/pokeapi";
import { PokemonRadarEntity, BiomeRegion } from "@/types/pokemon";
import { sfx } from "@/lib/sound-effects";

// Pseudo-random deterministic offset based on ID so markers stay stable
function getStableOffset(id: number, seed: number): [number, number] {
  const angle = ((id * 47 + seed * 83) % 360) * (Math.PI / 180);
  const radius = 0.015 + (((id * 31 + seed * 17) % 100) / 100) * 0.04;
  const deltaLng = radius * Math.cos(angle);
  const deltaLat = radius * Math.sin(angle) * 0.85;
  return [deltaLng, deltaLat];
}

export function usePokemonRadar() {
  const [activeBiome, setActiveBiome] = useState<BiomeRegion>(BIOMES[0]);
  const [entities, setEntities] = useState<PokemonRadarEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonRadarEntity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Load Pokemon for all biomes in parallel on initial mount or retry
  useEffect(() => {
    let isCancelled = false;

    async function loadAllBiomeEntities() {
      try {
        const requests = BIOMES.flatMap((biome) =>
          biome.pokemonPool.slice(0, 8).map(async (id, i) => {
            const raw = await fetchPokemonData(id);
            if (!raw) return null;
            const [dLng, dLat] = getStableOffset(id, i);
            const coords: [number, number] = [
              biome.center[0] + dLng,
              biome.center[1] + dLat,
            ];
            return transformToRadarEntity(raw, coords, biome.id, biome.name);
          })
        );

        const settled = await Promise.all(requests);
        const allSpawned = settled.filter(
          (item): item is PokemonRadarEntity => item !== null
        );

        if (!isCancelled) {
          setEntities(allSpawned);
          if (allSpawned.length === 0) {
            setError(
              "No pudimos conectar con PokéAPI para detectar criaturas. Verificá tu conexión e intentá nuevamente."
            );
          } else {
            setError(null);
          }
          setLoading(false);
        }
      } catch {
        if (!isCancelled) {
          setError(
            "Error al sincronizar el radar con PokéAPI. Reintentá en unos segundos."
          );
          setLoading(false);
        }
      }
    }

    loadAllBiomeEntities();

    return () => {
      isCancelled = true;
    };
  }, [reloadNonce]);

  const retryLoad = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadNonce((n) => n + 1);
  }, []);

  // Filter entities according to search and type (all biomes always visible across the map)
  const filteredEntities = useMemo(() => {
    return entities.filter((pokemon) => {
      const matchesSearch =
        !searchTerm ||
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pokemon.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(pokemon.id) === searchTerm.trim();

      const matchesType =
        selectedType === "all" ||
        pokemon.types.includes(selectedType.toLowerCase());

      return matchesSearch && matchesType;
    });
  }, [entities, searchTerm, selectedType]);

  const selectPokemon = useCallback((pokemon: PokemonRadarEntity) => {
    setSelectedPokemon(pokemon);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const selectBiome = useCallback((biome: BiomeRegion) => {
    setActiveBiome(biome);
  }, []);

  const scanCurrentBiome = useCallback(() => {
    if (isScanning) return;
    setIsScanning(true);
    sfx.playRadarPing();
    setScanMessage(`Sonar emitido: ${activeBiome.name} sincronizado.`);

    setTimeout(() => {
      setIsScanning(false);
    }, 2000);

    setTimeout(() => {
      setScanMessage(null);
    }, 4500);
  }, [activeBiome, isScanning]);

  return {
    activeBiome,
    selectBiome,
    entities: filteredEntities,
    totalSpotted: entities.length,
    loading,
    error,
    retryLoad,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    selectedPokemon,
    selectPokemon,
    isDrawerOpen,
    closeDrawer,
    isScanning,
    scanMessage,
    scanCurrentBiome,
  };
}
