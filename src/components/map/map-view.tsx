"use client";

import React, { useEffect, useRef } from "react";
import { Map, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import type { FeatureCollection, Polygon } from "geojson";
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

/**
 * Generates an elliptical GeoJSON Polygon circle in geographic degrees.
 * Bounded to true latitude/longitude coordinates on Earth so it maintains
 * its physical geographic territory without changing size when zooming.
 * Radius encompasses all Pokémon spawned within the biome (~0.055° max delta).
 */
function createGeoCirclePolygon(
  center: [number, number],
  radiusLng: number = 0.065,
  radiusLat: number = 0.055,
  points: number = 64
): number[][][] {
  const ring: number[][] = [];
  for (let i = 0; i <= points; i++) {
    const angle = (i * 2 * Math.PI) / points;
    const lng = center[0] + radiusLng * Math.cos(angle);
    const lat = center[1] + radiusLat * Math.sin(angle);
    ring.push([lng, lat]);
  }
  return [ring];
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
  const biomePinsRef = useRef<{ [key: string]: Marker }>({});
  const onSelectBiomeRef = useRef(onSelectBiome);

  useEffect(() => {
    onSelectBiomeRef.current = onSelectBiome;
  }, [onSelectBiome]);

  // Synchronize visibility of biome pins vs pokemon markers based on zoom
  const syncZoomVisibility = () => {
    const map = mapRef.current;
    if (!map) return;
    const zoom = map.getZoom();
    const isZoomedOut = zoom < 9.2;

    // Biome overview pins: visible when zoomed out
    Object.values(biomePinsRef.current).forEach((pin) => {
      const el = pin.getElement();
      if (el) {
        if (isZoomedOut) {
          el.style.opacity = "1";
          el.style.pointerEvents = "auto";
          el.style.transform = "scale(1) translateY(0)";
        } else {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          el.style.transform = "scale(0.85) translateY(-8px)";
        }
      }
    });

    // Pokemon markers: visible when zoomed in
    Object.values(markersRef.current).forEach((marker) => {
      const el = marker.getElement();
      if (el) {
        el.style.display = isZoomedOut ? "none" : "flex";
      }
    });
  };

  // 1. Initialize MapLibre GL Map & GeoJSON Geographic Biome Layers
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

    // Suppress missing style image warnings
    map.setMissingStyleImageResolver((id) => {
      if (!map.hasImage(id)) {
        map.addImage(id, {
          width: 1,
          height: 1,
          data: new Uint8Array([0, 0, 0, 0]),
        });
      }
    });

    // Auto-fallback if remote vector style fails
    map.on("error", (e) => {
      const msg = e?.error?.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("401") || msg.includes("403")) {
        console.warn("Switching to high performance light style:", msg);
        map.setStyle(HIGH_PERF_LIGHT_STYLE);
      }
    });

    map.on("load", () => {
      // True GeoJSON Geographic Polygon perimeters for each Biome
      const biomePolygons: FeatureCollection<Polygon> = {
        type: "FeatureCollection",
        features: BIOMES.map((b) => ({
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: createGeoCirclePolygon(b.center, 0.065, 0.055, 64),
          },
          properties: {
            id: b.id,
            name: b.name,
            color: b.accentColor,
          },
        })),
      };

      map.addSource("biomes-polygon-source", {
        type: "geojson",
        data: biomePolygons,
      });

      // Geographic zone interior fill (locked to coordinates)
      map.addLayer({
        id: "biomes-polygon-fill",
        type: "fill",
        source: "biomes-polygon-source",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.13,
        },
      });

      // Solid inner radar perimeter
      map.addLayer({
        id: "biomes-polygon-stroke-inner",
        type: "line",
        source: "biomes-polygon-source",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 1.2,
          "line-opacity": 0.4,
        },
      });

      // Dashed radar boundary line (locked to coordinates)
      map.addLayer({
        id: "biomes-polygon-stroke",
        type: "line",
        source: "biomes-polygon-source",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 2.2,
          "line-opacity": 0.85,
          "line-dasharray": [3, 2],
        },
      });

      // Create interactive Biome Location Pins for High-Altitude Overview
      BIOMES.forEach((b) => {
        const pinEl = document.createElement("div");
        pinEl.className =
          "biome-pin-marker group cursor-pointer flex flex-col items-center select-none transition-all duration-300";
        pinEl.style.willChange = "transform, opacity";

        // Label pill with biome name
        const labelPill = document.createElement("div");
        labelPill.className =
          "flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/95 text-white border shadow-2xl backdrop-blur-md mb-1.5 transition-transform duration-200 group-hover:scale-105";
        labelPill.style.borderColor = `${b.accentColor}99`;
        labelPill.innerHTML = `
          <span class="w-2 h-2 rounded-full inline-block animate-pulse" style="background-color: ${b.accentColor}; box-shadow: 0 0 8px ${b.accentColor};"></span>
          <span class="font-sans font-bold text-[11px] whitespace-nowrap tracking-wide text-slate-100">${b.name}</span>
        `;
        pinEl.appendChild(labelPill);

        // Location Pin Beacon with SVG Icon
        const pinIcon = document.createElement("div");
        pinIcon.className = "relative flex items-center justify-center transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-110";
        pinIcon.innerHTML = `
          <div class="w-9 h-9 rounded-full flex items-center justify-center shadow-2xl border-2 border-white" style="background: radial-gradient(circle at 30% 30%, ${b.accentColor}, #0f172a); box-shadow: 0 4px 16px ${b.accentColor}99;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px]" style="border-t-color: #0f172a;"></div>
        `;
        pinEl.appendChild(pinIcon);

        // Ripple dot on terrain
        const ripple = document.createElement("div");
        ripple.className = "w-7 h-1.5 rounded-full mt-1 opacity-60 blur-[1px]";
        ripple.style.backgroundColor = b.accentColor;
        pinEl.appendChild(ripple);

        // Click / touch handler: select biome and fly directly to zone
        const handleSelect = (e: Event) => {
          e.stopPropagation();
          sfx.playSwitch();
          onSelectBiomeRef.current?.(b);
          map.flyTo({
            center: b.center,
            zoom: b.zoom,
            speed: 1.3,
            curve: 1.4,
            pitch: 40,
            essential: true,
          });
        };

        pinEl.addEventListener("click", handleSelect);
        pinEl.addEventListener("touchend", handleSelect);

        const pinMarker = new Marker({
          element: pinEl,
          anchor: "bottom",
        })
          .setLngLat(b.center)
          .addTo(map);

        biomePinsRef.current[b.id] = pinMarker;
      });

      // Synchronize visibility on zoom events
      map.on("zoom", syncZoomVisibility);
      syncZoomVisibility();
    });

    mapRef.current = map;

    return () => {
      Object.values(biomePinsRef.current).forEach((pin) => pin.remove());
      biomePinsRef.current = {};
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

  // 3. React to selectedPokemon changes (smooth focus & close-up zoom on selected creature)
  useEffect(() => {
    if (!mapRef.current || !selectedPokemon) return;
    mapRef.current.flyTo({
      center: selectedPokemon.coordinates,
      zoom: 15.5,
      speed: 1.35,
      pitch: 45,
      essential: true,
    });
  }, [selectedPokemon]);

  // 4. Render and sync markers for Pokémon
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

      // On click or touch: flyTo creature & open drawer
      const handleMarkerSelect = (e: Event) => {
        e.stopPropagation();
        sfx.playDexPage();
        onSelectPokemon(pokemon);
        map.flyTo({
          center: pokemon.coordinates,
          zoom: 15.5,
          speed: 1.35,
          pitch: 45,
          essential: true,
        });
      };

      el.addEventListener("click", handleMarkerSelect);
      el.addEventListener("touchend", handleMarkerSelect);

      const marker = new Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat(pokemon.coordinates)
        .addTo(map);

      markersRef.current[`${pokemon.id}-${pokemon.coordinates.join(",")}`] = marker;
    });

    // Sync visibility with current zoom level immediately
    syncZoomVisibility();

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
