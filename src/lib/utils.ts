import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const POKEMON_TYPE_NAMES_ES: Record<string, string> = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  grass: "Planta",
  electric: "Eléctrico",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada",
};

export function translateTypeToSpanish(type: string): string {
  return POKEMON_TYPE_NAMES_ES[type.toLowerCase()] || type;
}

export const POKEMON_ABILITY_NAMES_ES: Record<string, string> = {
  overgrow: "Espesura",
  chlorophyll: "Clorofila",
  blaze: "Mar Llamas",
  "solar-power": "Poder Solar",
  torrent: "Torrente",
  "rain-dish": "Cura Lluvia",
  "shield-dust": "Polvo Escudo",
  "run-away": "Fuga",
  "shed-skin": "Mudar",
  compoundeyes: "Ojo Compuesto",
  swarm: "Enjambre",
  "keen-eye": "Vista Lince",
  "tangled-feet": "Tumbos",
  guts: "Agallas",
  intimidate: "Intimidación",
  static: "Electricidad Estática",
  "lightning-rod": "Pararrayos",
  "sand-veil": "Velo Arena",
  "sand-rush": "Ímpetu Arena",
  "poison-point": "Punto Tóxico",
  rivalry: "Rivalidad",
  "cute-charm": "Gran Encanto",
  "magic-guard": "Muro Mágico",
  "flash-fire": "Absorbe Fuego",
  drought: "Sequía",
  "inner-focus": "Foco Interno",
  synchronize: "Sincronía",
  levitate: "Levitación",
  damp: "Humedad",
  "cloud-nine": "Aclimatación",
  "swift-swim": "Nado Rápido",
  "water-absorb": "Absorbe Agua",
  "volt-absorb": "Absorbe Elec",
  pressure: "Presión",
  adaptability: "Adaptabilidad",
  "speed-boost": "Impulso",
};

export function translateAbilityToSpanish(ability: string): string {
  const normalized = ability.toLowerCase().trim();
  if (POKEMON_ABILITY_NAMES_ES[normalized]) {
    return POKEMON_ABILITY_NAMES_ES[normalized];
  }
  return ability
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
