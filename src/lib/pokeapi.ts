import {
  PokemonRadarEntity,
  RawPokeApiResponse,
  WeatherData,
} from "@/types/pokemon";

const POKEMON_CACHE = new Map<number, RawPokeApiResponse>();

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

export function transformToRadarEntity(
  raw: RawPokeApiResponse,
  coordinates: [number, number],
  biomeId: string,
  biomeName: string
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
    level: Math.floor(Math.random() * 50) + 10,
  };
}

export async function fetchBiomeWeather(lat: number, lng: number): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m,is_day&timezone=auto`;
    const res = await fetch(url);
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
