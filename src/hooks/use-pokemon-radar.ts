"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { BIOMES } from "@/lib/biomes";
import { fetchRadarEntitiesForBiomes } from "@/lib/pokeapi";
import { PokemonRadarEntity, BiomeRegion, WeatherData } from "@/types/pokemon";
import { sfx } from "@/lib/sound-effects";

interface UsePokemonRadarOptions {
  initialEntities?: PokemonRadarEntity[];
  initialWeatherByBiome?: Record<string, WeatherData | null>;
}

export function usePokemonRadar(options: UsePokemonRadarOptions = {}) {
  const { initialEntities = [], initialWeatherByBiome = {} } = options;
  const hasInitialData = initialEntities.length > 0;

  const [activeBiome, setActiveBiome] = useState<BiomeRegion>(BIOMES[0]);
  const [entities, setEntities] = useState<PokemonRadarEntity[]>(initialEntities);
  const [weatherByBiome, setWeatherByBiome] = useState<Record<string, WeatherData | null>>(
    initialWeatherByBiome
  );
  const [loading, setLoading] = useState(!hasInitialData);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonRadarEntity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Fallback client load when server prefetch returned empty, or on manual retry
  useEffect(() => {
    if (hasInitialData && reloadNonce === 0) return;
    let isCancelled = false;

    async function loadAllBiomeEntities() {
      try {
        const result = await fetchRadarEntitiesForBiomes(BIOMES);

        if (!isCancelled) {
          setEntities(result.entities);
          setWeatherByBiome(result.weatherByBiome);
          if (result.entities.length === 0) {
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
  }, [hasInitialData, reloadNonce]);

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
    // Sync the active biome so navbar weather and climatic affinity reflect the selected Pokémon's zone.
    const pokemonBiome = BIOMES.find((b) => b.id === pokemon.biomeId);
    if (pokemonBiome) {
      setActiveBiome((prev) =>
        prev.id === pokemonBiome.id ? prev : pokemonBiome
      );
    }
    // Shallow copy ensures MapView's selectedPokemon flyTo (zoom 15.5) always runs after any biome effect.
    setSelectedPokemon({ ...pokemon });
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
    weatherByBiome,
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
