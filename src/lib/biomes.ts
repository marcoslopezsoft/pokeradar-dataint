import { BiomeRegion } from "@/types/pokemon";
import type { StyleSpecification } from "maplibre-gl";

export const BIOMES: BiomeRegion[] = [
  {
    id: "iguazu-rainforest",
    name: "Cataratas del Iguazú",
    country: "Misiones, Argentina",
    description: "Selva subtropical húmeda con estruendosas caídas de agua y biodiversidad exuberante.",
    center: [-54.4489, -25.6953],
    zoom: 12.5,
    dominantTypes: ["water", "grass", "bug"],
    accentColor: "#10b981", // Emerald
    pokemonPool: [1, 2, 3, 7, 8, 9, 54, 55, 60, 61, 123, 130, 252, 258, 270, 382]
  },
  {
    id: "perito-moreno-glacier",
    name: "Glaciar Perito Moreno",
    country: "Santa Cruz, Argentina",
    description: "Campos de hielo patagónicos milenarios, cavernas gélidas y viento polar constante.",
    center: [-73.0498, -50.4704],
    zoom: 12,
    dominantTypes: ["ice", "water", "steel"],
    accentColor: "#38bdf8", // Sky blue
    pokemonPool: [86, 87, 91, 131, 144, 215, 220, 221, 361, 362, 363, 459, 460]
  },
  {
    id: "humahuaca-canyon",
    name: "Quebrada de Humahuaca & Puna",
    country: "Jujuy, Argentina",
    description: "Tierras altas andinas con cerros de siete colores, cañones rocosos y clima árido solar.",
    center: [-65.3504, -23.2057],
    zoom: 12,
    dominantTypes: ["rock", "ground", "fire"],
    accentColor: "#f59e0b", // Amber
    pokemonPool: [4, 5, 6, 74, 75, 76, 95, 104, 105, 111, 112, 246, 247, 248]
  },
  {
    id: "buenos-aires-metropolis",
    name: "Metrópolis Puerto Madero & Obelisco",
    country: "Buenos Aires, Argentina",
    description: "Centro financiero y costanero hiperconectado, fuentes de energía y tecnología urbana.",
    center: [-58.3772, -34.6037],
    zoom: 13,
    dominantTypes: ["electric", "normal", "psychic", "steel"],
    accentColor: "#eab308", // Yellow
    pokemonPool: [25, 26, 81, 82, 100, 101, 125, 133, 137, 479, 63, 64, 65]
  },
  {
    id: "aconcagua-summit",
    name: "Cumbre Cerro Aconcagua",
    country: "Mendoza, Argentina",
    description: "El pico más alto de América (6.961 m), vientos huracanados y cumbres míticas.",
    center: [-70.0109, -32.6532],
    zoom: 11.5,
    dominantTypes: ["flying", "dragon", "fighting"],
    accentColor: "#8b5cf6", // Violet
    pokemonPool: [16, 17, 18, 56, 57, 66, 67, 68, 142, 149, 227, 330, 443, 444, 445]
  },
  {
    id: "valdes-peninsula",
    name: "Península Valdés & Mar Argentino",
    country: "Chubut, Argentina",
    description: "Santuario marino atlántico, costas vírgenes frecuentadas por ballenas y fauna oceánica.",
    center: [-63.6333, -42.5],
    zoom: 10,
    dominantTypes: ["water", "fairy", "dark"],
    accentColor: "#06b6d4", // Cyan
    pokemonPool: [129, 130, 134, 138, 139, 140, 141, 318, 319, 320, 321, 369]
  }
];

// Ultra-fast 60 FPS Light Raster style: Clean white aesthetic, zero CPU vector parsing, zero watermarks
export const HIGH_PERF_LIGHT_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    "osm-raster-tiles": {
      type: "raster",
      tiles: [
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  },
  layers: [
    {
      id: "background-base",
      type: "background",
      paint: {
        "background-color": "#ffffff"
      }
    },
    {
      id: "osm-light-base",
      type: "raster",
      source: "osm-raster-tiles",
      minzoom: 0,
      maxzoom: 19,
      paint: {
        "raster-saturation": -0.1,
        "raster-contrast": 0.05,
        "raster-brightness-min": 0.08,
        "raster-fade-duration": 0
      }
    }
  ]
};

export const INITIAL_MAP_CONFIG = {
  center: [-64.0, -38.4161] as [number, number],
  zoom: 4.2,
  minZoom: 3,
  maxZoom: 18,
  style: HIGH_PERF_LIGHT_STYLE
};
