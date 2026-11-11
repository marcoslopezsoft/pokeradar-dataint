import { cacheLife } from "next/cache";
import { BIOMES } from "@/lib/biomes";
import { fetchRadarEntitiesForBiomes } from "@/lib/pokeapi";
import { PokemonRadarEntity, WeatherData } from "@/types/pokemon";

export interface InitialRadarPayload {
  entities: PokemonRadarEntity[];
  weatherByBiome: Record<string, WeatherData | null>;
}

/**
 * Server-side cached loader powered by Next.js 16 Cache Components.
 * Pre-fetches live Open-Meteo weather and PokéAPI species in parallel
 * so the Server Component delivers hydrated radar data immediately.
 */
export async function getInitialRadarData(): Promise<InitialRadarPayload> {
  "use cache";
  cacheLife("minutes");

  try {
    return await fetchRadarEntitiesForBiomes(BIOMES);
  } catch (error) {
    console.warn("Server prefetch failed, falling back to client load:", error);
    return { entities: [], weatherByBiome: {} };
  }
}
