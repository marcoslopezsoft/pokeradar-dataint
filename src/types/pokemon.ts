export interface PokemonTypeRef {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStatRef {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonSpritesRef {
  front_default: string | null;
  other?: {
    "official-artwork"?: {
      front_default: string | null;
    };
    showdown?: {
      front_default: string | null;
    };
  };
  versions?: {
    "generation-v"?: {
      "black-white"?: {
        animated?: {
          front_default: string | null;
        };
      };
    };
  };
}

export interface PokemonCriesRef {
  latest: string | null;
  legacy: string | null;
}

export interface RawPokeApiResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: PokemonTypeRef[];
  stats: PokemonStatRef[];
  sprites: PokemonSpritesRef;
  cries?: PokemonCriesRef;
}

export interface PokemonRadarEntity {
  id: number;
  name: string;
  displayName: string;
  height: number;
  weight: number;
  types: string[];
  stats: Record<string, number>;
  sprite: string;
  animatedSprite: string;
  cryUrl: string | null;
  coordinates: [number, number]; // [lng, lat] for MapLibre
  biomeId: string;
  biomeName: string;
  level: number;
}

export interface BiomeRegion {
  id: string;
  name: string;
  country: string;
  description: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  dominantTypes: string[];
  ambientWeatherCode?: number;
  accentColor: string;
  pokemonPool: number[]; // Pokedex IDs
}

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  isDay: boolean;
  conditionDescription: string;
}
