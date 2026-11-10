"use client";

import React, { useEffect, useRef } from "react";
import { Map, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import type { FeatureCollection, Point } from "geojson";
import { PokemonRadarEntity, BiomeRegion } from "@/types/pokemon";
import { INITIAL_MAP_CONFIG, BIOMES, HIGH_PERF_LIGHT_STYLE } from "@/lib/biomes";
import { sfx } from "@/lib/sound-effects";

// Configure MapLibre Web Worker URL for Next.js App Router & Turbopack
if (typeof window !== "undefined") {
  try {
    const workerUrl = new URL("/maplibre-gl-worker.mjs", window.location.href).href;
    setWorkerUrl(workerUrl);
  } catch (e) {
    console.warn("Failed to set worker URL:", e);
  }
}

interface MapViewProps {
  pokemonList: PokemonRadarEntity[];
  activeBiome: BiomeRegion;
  selectedPokemon: PokemonRadarEntity | null;
  onSelectPokemon: (pokemon: PokemonRadarEntity) => void;
  onSelectBiome?: (biome: BiomeRegion) => void;
}

export function MapView({
  pokemonList,
  activeBiome,
  selectedPokemon,
  onSelectPokemon,
  onSelectBiome,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<{ [key: string]: Marker }>({});

  // 1. Initialize MapLibre GL Map & GeoJSON Biome Layers
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new Map({
      container: mapContainerRef.current,
      style: INITIAL_MAP_CONFIG.style,
      center: activeBiome.center,
      zoom: activeBiome.zoom,
      minZoom: INITIAL_MAP_CONFIG.minZoom,
      maxZoom: INITIAL_MAP_CONFIG.maxZoom,
      pitch: 35,
      bearing: 0,
      attributionControl: false,
    });

    map.addControl(
      new NavigationControl({
        visualizePitch: true,
        showCompass: true,
        showZoom: true,
      }),
      "bottom-right"
    );

    // Suppress missing style image warnings (e.g. wood-pattern, circle-11)
    map.setMissingStyleImageResolver((id) => {
      if (!map.hasImage(id)) {
        map.addImage(id, {
          width: 1,
          height: 1,
          data: new Uint8Array([0, 0, 0, 0]),
        });
      }
    });

    // Auto-fallback if style needs reset
    map.on("error", (e) => {
      const msg = e?.error?.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("401") || msg.includes("403")) {
        console.warn("Switching to high performance light style:", msg);
        map.setStyle(HIGH_PERF_LIGHT_STYLE);
      }
    });

    map.on("load", () => {
      // GeoJSON Feature Collection for Biome Atmospheric Radii
      const biomeFeatures: FeatureCollection<Point> = {
        type: "FeatureCollection",
        features: BIOMES.map((b) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: b.center,
          },
          properties: {
            id: b.id,
            name: b.name,
            color: b.accentColor,
          },
        })),
      };

      map.addSource("biomes-source", {
        type: "geojson",
        data: biomeFeatures,
      });

      // Atmospheric glowing halo
      map.addLayer({
        id: "biomes-glow-layer",
        type: "circle",
        source: "biomes-source",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            3,
            20,
            8,
            70,
            13,
            240,
          ],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.22,
          "circle-blur": 0.85,
        },
      });

      // Biome perimeter boundary ring
      map.addLayer({
        id: "biomes-perimeter-layer",
        type: "circle",
        source: "biomes-source",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            3,
            15,
            8,
            55,
            13,
            180,
          ],
          "circle-color": "transparent",
          "circle-stroke-width": 2,
          "circle-stroke-color": ["get", "color"],
          "circle-stroke-opacity": 0.55,
        },
      });

      // Cursor pointer and click on biome perimeter to focus
      map.on("click", "biomes-perimeter-layer", (e) => {
        if (!e.features || !e.features[0]) return;
        const clickedId = e.features[0].properties?.id;
        const targetBiome = BIOMES.find((b) => b.id === clickedId);
        if (targetBiome && onSelectBiome) {
          onSelectBiome(targetBiome);
        }
      });

      map.on("mouseenter", "biomes-perimeter-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "biomes-perimeter-layer", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. React to activeBiome changes (smooth flyTo)
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: activeBiome.center,
      zoom: activeBiome.zoom,
      speed: 1.2,
      curve: 1.4,
      essential: true,
      pitch: 40,
    });
  }, [activeBiome]);

  // 3. Render and sync markers for Pokémon
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    pokemonList.forEach((pokemon) => {
      const isSelected = selectedPokemon?.id === pokemon.id;

      // Custom marker DOM Element (Pure sprite without bounding card box)
      const el = document.createElement("div");
      el.className = "pokemon-radar-marker group cursor-pointer relative select-none flex items-center justify-center";
      el.style.width = "64px";
      el.style.height = "64px";
      el.style.willChange = "transform";

      // Tooltip pill on hover
      const tooltip = document.createElement("div");
      tooltip.className =
        "absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/95 border border-slate-200 text-[10px] font-sans text-slate-800 whitespace-nowrap shadow-lg pointer-events-none z-30 font-bold";
      tooltip.innerText = `${pokemon.displayName} · Nv.${pokemon.level}`;
      el.appendChild(tooltip);

      // Subtle ground contact shadow
      const groundShadow = document.createElement("div");
      groundShadow.className =
        "absolute bottom-1 left-1/2 -translate-x-1/2 w-9 h-2.5 rounded-full bg-black/25 blur-[2px] pointer-events-none transition-transform duration-200 group-hover:scale-125";
      el.appendChild(groundShadow);

      // Pokemon HD official artwork directly on terrain
      const img = document.createElement("img");
      img.src = pokemon.sprite || pokemon.animatedSprite;
      img.alt = pokemon.displayName;
      img.className = `w-14 h-14 object-contain pointer-events-none transition-all duration-200 group-hover:scale-125 group-hover:-translate-y-1.5 ${
        isSelected
          ? "scale-125 -translate-y-2 drop-shadow-[0_8px_16px_rgba(220,10,45,0.7)]"
          : "drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
      }`;
      el.appendChild(img);

      // On click: flyTo creature & open drawer
      el.addEventListener("click", () => {
        sfx.playDexPage();
        onSelectPokemon(pokemon);
        map.flyTo({
          center: pokemon.coordinates,
          zoom: Math.max(map.getZoom(), 13),
          speed: 1.1,
          pitch: 45,
        });
      });

      const marker = new Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat(pokemon.coordinates)
        .addTo(map);

      markersRef.current[`${pokemon.id}-${pokemon.coordinates.join(",")}`] = marker;
    });

    return () => {
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};
    };
  }, [pokemonList, selectedPokemon, onSelectPokemon]);

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
