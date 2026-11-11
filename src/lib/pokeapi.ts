import {
  BiomeRegion,
  PokemonRadarEntity,
  RawPokeApiResponse,
  WeatherData,
} from "@/types/pokemon";

const POKEMON_CACHE = new Map<number, RawPokeApiResponse>();
const DESCRIPTION_CACHE = new Map<number, string>();
const ABILITY_CACHE = new Map<string, string>();

export async function fetchAbilitySpanishName(nameOrSlug: string): Promise<string> {
  const normalized = nameOrSlug.toLowerCase().trim();
  if (ABILITY_CACHE.has(normalized)) {
    return ABILITY_CACHE.get(normalized)!;
  }

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/ability/${normalized}`, {
      next: { revalidate: 86400 * 7 },
    });
    if (!res.ok) throw new Error("Ability fetch failed");
    const data = await res.json();
    const esName = data.names?.find(
      (n: { language: { name: string }; name: string }) => n.language?.name === "es"
    )?.name;

    if (esName) {
      ABILITY_CACHE.set(normalized, esName);
      return esName;
    }
  } catch {
    // Fallback to formatted slug
  }

  return "";
}

export async function fetchPokemonDescription(id: number): Promise<string> {
  if (DESCRIPTION_CACHE.has(id)) {
    return DESCRIPTION_CACHE.get(id)!;
  }

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error("Description fetch failed");
    const data = await res.json();
    const esEntry = data.flavor_text_entries?.find(
      (entry: { language: { name: string }; flavor_text: string }) =>
        entry.language.name === "es"
    );

    const description = esEntry
      ? esEntry.flavor_text.replace(/[\n\f\r]/g, " ")
      : data.flavor_text_entries?.[0]?.flavor_text?.replace(/[\n\f\r]/g, " ") ||
        "Registro de especie catalogado en el radar de expedición.";

    DESCRIPTION_CACHE.set(id, description);
    return description;
  } catch {
    return "Especie detectada y catalogada por los sensores satelitales del radar de expedición.";
  }
}

export async function fetchPokemonData(id: number): Promise<RawPokeApiResponse | null> {
  if (POKEMON_CACHE.has(id)) {
    return POKEMON_CACHE.get(id)!;
  }

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
      next: { revalidate: 86400 }, // 24 hours
    });

    if (!res.ok) {
      console.error(`Failed to fetch pokemon #${id}: HTTP ${res.status}`);
      return null;
    }

    const data: RawPokeApiResponse = await res.json();
    POKEMON_CACHE.set(id, data);
    return data;
  } catch (error) {
    console.error(`Error requesting PokéAPI for ID ${id}:`, error);
    return null;
  }
}

export function getWeatherBoostConfig(weatherCode: number): {
  reason: string;
  shortLabel: string;
  boostedTypes: string[];
} {
  if (weatherCode >= 95) {
    return {
      reason: "Tormenta eléctrica activa: atrae tipos Eléctrico, Dragón y Volador",
      shortLabel: "+Eléc/Dragón",
      boostedTypes: ["electric", "dragon", "flying"],
    };
  }
  if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) {
    return {
      reason: "Clima gélido/nieve: favorece tipos Hielo, Acero y Agua",
      shortLabel: "+Hielo/Acero",
      boostedTypes: ["ice", "steel", "water"],
    };
  }
  if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    return {
      reason: "Precipitaciones en curso: atrae tipos Agua, Eléctrico y Planta",
      shortLabel: "+Agua/Eléc",
      boostedTypes: ["water", "electric", "grass"],
    };
  }
  if (weatherCode === 0 || weatherCode === 1) {
    return {
      reason: "Cielo despejado: potencia tipos Fuego, Planta, Tierra y Volador",
      shortLabel: "+Fuego/Planta",
      boostedTypes: ["fire", "grass", "ground", "rock", "flying"],
    };
  }
  return {
    reason: "Cielo cubierto: favorece tipos Psíquico, Siniestro, Normal y Bicho",
    shortLabel: "+Psíq/Siniestro",
    boostedTypes: ["normal", "psychic", "ghost", "dark", "bug"],
  };
}

export function getStableOffset(id: number, seed: number): [number, number] {
  const angle = ((id * 47 + seed * 83) % 360) * (Math.PI / 180);
  const radius = 0.015 + (((id * 31 + seed * 17) % 100) / 100) * 0.04;
  const deltaLng = radius * Math.cos(angle);
  const deltaLat = radius * Math.sin(angle) * 0.85;
  return [deltaLng, deltaLat];
}

export function transformToRadarEntity(
  raw: RawPokeApiResponse,
  coordinates: [number, number],
  biomeId: string,
  biomeName: string,
  weather?: WeatherData | null
): PokemonRadarEntity {
  const statsRecord: Record<string, number> = {};
  for (const s of raw.stats) {
    statsRecord[s.stat.name] = s.base_stat;
  }

  const types = raw.types.map((t) => t.type.name);

  // Animated showdown sprite with fallback to Generation V animated, direct showdown GIF or static
  const animatedSprite =
    raw.sprites.other?.showdown?.front_default ||
    raw.sprites.versions?.["generation-v"]?.["black-white"]?.animated?.front_default ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${raw.id}.gif` ||
    raw.sprites.other?.["official-artwork"]?.front_default ||
    raw.sprites.front_default ||
    "";

  const staticSprite =
    raw.sprites.other?.["official-artwork"]?.front_default ||
    raw.sprites.front_default ||
    "";

  // Audio cry (.ogg)
  const cryUrl = raw.cries?.latest || raw.cries?.legacy || null;

  const boostConfig = weather ? getWeatherBoostConfig(weather.weatherCode) : null;
  const weatherBoosted = boostConfig
    ? types.some((t) => boostConfig.boostedTypes.includes(t.toLowerCase()))
    : false;

  // Deterministic expedition level so Server and Client renders stay 100% pure
  const deterministicLevel = 10 + ((raw.id * 17 + biomeId.length * 7) % 50);

  return {
    id: raw.id,
    name: raw.name,
    displayName: raw.name.charAt(0).toUpperCase() + raw.name.slice(1),
    height: raw.height / 10, // decimetres to meters
    weight: raw.weight / 10, // hectograms to kilograms
    types,
    stats: statsRecord,
    sprite: staticSprite,
    animatedSprite,
    cryUrl,
    coordinates,
    biomeId,
    biomeName,
    level: deterministicLevel,
    abilities: raw.abilities?.map((a) => a.ability?.name || "").filter(Boolean) || [],
    weatherBoosted,
    weatherBoostReason: weatherBoosted ? boostConfig?.reason : undefined,
  };
}

export async function fetchBiomeWeather(lat: number, lng: number): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m,is_day&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;

    const data = await res.json();
    const current = data.current;

    const weatherCode = current.weather_code ?? 0;
    const conditionDescription = decodeWmoCode(weatherCode);

    return {
      temperature: Math.round(current.temperature_2m ?? 20),
      weatherCode,
      windSpeed: Math.round(current.wind_speed_10m ?? 5),
      isDay: Boolean(current.is_day ?? 1),
      conditionDescription,
    };
  } catch (error) {
    console.error("Failed to fetch weather from Open-Meteo:", error);
    return null;
  }
}

export async function fetchRadarEntitiesForBiomes(biomes: BiomeRegion[]): Promise<{
  entities: PokemonRadarEntity[];
  weatherByBiome: Record<string, WeatherData | null>;
}> {
  const weatherEntries = await Promise.all(
    biomes.map(async (biome) => {
      const weather = await fetchBiomeWeather(biome.center[1], biome.center[0]);
      return [biome.id, weather] as const;
    })
  );
  const weatherByBiome: Record<string, WeatherData | null> = Object.fromEntries(weatherEntries);

  const biomeEntityArrays = await Promise.all(
    biomes.map(async (biome) => {
      const weather = weatherByBiome[biome.id];
      const boostConfig = weather ? getWeatherBoostConfig(weather.weatherCode) : null;

      // Fetch up to 12 pool candidates in parallel so live weather picks the active 8 spawns
      const poolResults = await Promise.all(
        biome.pokemonPool.slice(0, 12).map((id) => fetchPokemonData(id))
      );
      const validPool = poolResults.filter(
        (raw): raw is RawPokeApiResponse => raw !== null
      );

      const prioritizedPool = boostConfig
        ? [...validPool].sort((a, b) => {
            const aMatch = a.types.some((t) =>
              boostConfig.boostedTypes.includes(t.type.name.toLowerCase())
            )
              ? 1
              : 0;
            const bMatch = b.types.some((t) =>
              boostConfig.boostedTypes.includes(t.type.name.toLowerCase())
            )
              ? 1
              : 0;
            return bMatch - aMatch;
          })
        : validPool;

      return prioritizedPool.slice(0, 8).map((raw, i) => {
        const [dLng, dLat] = getStableOffset(raw.id, i);
        const coords: [number, number] = [
          biome.center[0] + dLng,
          biome.center[1] + dLat,
        ];
        return transformToRadarEntity(raw, coords, biome.id, biome.name, weather);
      });
    })
  );

  return {
    entities: biomeEntityArrays.flat(),
    weatherByBiome,
  };
}

function decodeWmoCode(code: number): string {
  if (code === 0) return "Cielo Despejado";
  if (code === 1 || code === 2) return "Parcialmente Nublado";
  if (code === 3) return "Nublado";
  if (code >= 45 && code <= 48) return "Niebla / Escarcha";
  if (code >= 51 && code <= 55) return "Llovizna";
  if (code >= 61 && code <= 65) return "Lluvia";
  if (code >= 71 && code <= 77) return "Nieve";
  if (code >= 80 && code <= 82) return "Chubascos";
  if (code >= 95) return "Tormenta Eléctrica";
  return "Variable";
}
