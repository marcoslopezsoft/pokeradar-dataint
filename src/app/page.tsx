import { PokeRadarClient } from "@/components/map/pokeradar-client";
import { getInitialRadarData } from "@/lib/server-radar";

/**
 * Root Server Component: pre-fetches cached PokéAPI entities and live Open-Meteo
 * weather on the server before hydrating the interactive client shell.
 */
export default async function HomePage() {
  const { entities, weatherByBiome } = await getInitialRadarData();

  return (
    <PokeRadarClient
      initialEntities={entities}
      initialWeatherByBiome={weatherByBiome}
    />
  );
}
