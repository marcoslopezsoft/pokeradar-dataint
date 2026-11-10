"use client";

import React, { useEffect, useRef } from "react";
import { Map, Marker, NavigationControl } from "maplibre-gl";
import { PokemonRadarEntity, BiomeRegion } from "@/types/pokemon";
import { INITIAL_MAP_CONFIG, BIOMES } from "@/lib/biomes";

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

    map.on("load", () => {
      // GeoJSON Feature Collection for Biome Atmospheric Radii
      const biomeFeatures: GeoJSON.FeatureCollection<GeoJSON.Point> = {
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
          "circle-opacity": 0.15,
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
          "circle-stroke-width": 1.5,
          "circle-stroke-color": ["get", "color"],
          "circle-stroke-opacity": 0.4,
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

      // Custom marker DOM Element
      const el = document.createElement("div");
      el.className = "pokemon-radar-marker group cursor-pointer relative";
      el.style.width = "54px";
      el.style.height = "54px";

      // Tooltip pill on hover
      const tooltip = document.createElement("div");
      tooltip.className =
        "absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/95 border border-cyan-500/50 text-[10px] font-mono text-cyan-200 whitespace-nowrap shadow-lg pointer-events-none z-30";
      tooltip.innerText = `${pokemon.displayName} #${pokemon.id}`;
      el.appendChild(tooltip);

      // Radar pulse ring
      const pulseRing = document.createElement("div");
      pulseRing.className =
        "absolute inset-0 rounded-full border-2 border-cyan-400 pointer-events-none animate-radar-pulse";
      el.appendChild(pulseRing);

      // Marker badge wrapper
      const badge = document.createElement("div");
      badge.className = `relative w-full h-full rounded-2xl flex items-center justify-center p-1 backdrop-blur-md transition-all duration-300 transform group-hover:scale-115 ${
        isSelected
          ? "bg-cyan-500/30 border-2 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-110"
          : "bg-slate-950/85 border border-slate-700/80 shadow-lg group-hover:border-cyan-400"
      }`;

      // Pokemon sprite image
      const img = document.createElement("img");
      img.src = pokemon.animatedSprite || pokemon.sprite;
      img.alt = pokemon.displayName;
      img.className = "w-11 h-11 object-contain pixelated pointer-events-none";
      badge.appendChild(img);

      // Level pill
      const levelBadge = document.createElement("span");
      levelBadge.className =
        "absolute -bottom-1 -right-1 bg-cyan-950 border border-cyan-400 text-[9px] font-mono font-bold text-cyan-200 px-1 py-0.2 rounded-full";
      levelBadge.innerText = `L${pokemon.level}`;
      badge.appendChild(levelBadge);

      el.appendChild(badge);

      // On click: flyTo creature & open drawer
      el.addEventListener("click", () => {
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
        anchor: "center",
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
