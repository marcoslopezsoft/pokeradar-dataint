"use client";

import React, { useEffect, useRef } from "react";
import { Map, Marker, setWorkerUrl } from "maplibre-gl";
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
  const markersRef = useRef<{
    [key: string]: { marker: Marker; coordinates: [number, number] };
  }>({});
  const markerImgsRef = useRef<{ [id: number]: HTMLImageElement }>({});
  const biomePinsRef = useRef<{ [key: string]: Marker }>({});
  const onSelectBiomeRef = useRef(onSelectBiome);
  const onSelectPokemonRef = useRef(onSelectPokemon);
  const selectedPokemonIdRef = useRef<number | null>(null);
  const lastZoomedOutRef = useRef<boolean | null>(null);
  const isFirstBiomeEffectRef = useRef(true);

  useEffect(() => {
    onSelectBiomeRef.current = onSelectBiome;
  }, [onSelectBiome]);

  useEffect(() => {
    onSelectPokemonRef.current = onSelectPokemon;
  }, [onSelectPokemon]);

  useEffect(() => {
    selectedPokemonIdRef.current = selectedPokemon?.id ?? null;
  }, [selectedPokemon]);

  // Synchronize visibility of biome pins and cull off-screen Pokémon markers outside a 3x viewport buffer
  const syncZoomVisibility = (force = false) => {
    const map = mapRef.current;
    if (!map) return;
    const zoom = map.getZoom();
    const isZoomedOut = zoom < 9.2;

    if (!force && lastZoomedOutRef.current === isZoomedOut) return;
    lastZoomedOutRef.current = isZoomedOut;

    // Biome overview pins: visible when zoomed out
    Object.values(biomePinsRef.current).forEach((pin) => {
      const el = pin.getElement();
      if (el) {
        el.style.opacity = isZoomedOut ? "1" : "0";
        el.style.pointerEvents = isZoomedOut ? "auto" : "none";
        el.style.transform = isZoomedOut ? "scale(1) translateY(0)" : "scale(0.85) translateY(-8px)";
      }
    });

    const bounds = !isZoomedOut ? map.getBounds() : null;
    const lngSpan = bounds ? bounds.getEast() - bounds.getWest() : 0;
    const latSpan = bounds ? bounds.getNorth() - bounds.getSouth() : 0;
    const minLng = bounds ? bounds.getWest() - lngSpan : -180;
    const maxLng = bounds ? bounds.getEast() + lngSpan : 180;
    const minLat = bounds ? bounds.getSouth() - latSpan : -90;
    const maxLat = bounds ? bounds.getNorth() + latSpan : 90;

    // Pokemon markers: visible only when zoomed in AND inside the padded viewport
    Object.values(markersRef.current).forEach(({ marker, coordinates }) => {
      const el = marker.getElement();
      if (!el) return;
      const inBuffer =
        !isZoomedOut &&
        coordinates[0] >= minLng &&
        coordinates[0] <= maxLng &&
        coordinates[1] >= minLat &&
        coordinates[1] <= maxLat;
      const targetDisplay = inBuffer ? "flex" : "none";
      if (el.style.display !== targetDisplay) {
        el.style.display = targetDisplay;
      }
    });
  };

  // 1. Initialize MapLibre GL Map & GeoJSON Geographic Biome Layers
  const initialBiomeRef = useRef({
    center: activeBiome.center,
    zoom: activeBiome.zoom,
  });

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const isMobileViewport =
      typeof window !== "undefined" && window.innerWidth < 768;
    const cappedPixelRatio =
      typeof window !== "undefined"
        ? Math.min(window.devicePixelRatio || 1, 1.5)
        : 1;

    const map = new Map({
      container: mapContainerRef.current,
      style: INITIAL_MAP_CONFIG.style,
      center: initialBiomeRef.current.center,
      zoom: initialBiomeRef.current.zoom,
      minZoom: INITIAL_MAP_CONFIG.minZoom,
      maxZoom: INITIAL_MAP_CONFIG.maxZoom,
      pitch: isMobileViewport ? 0 : 22,
      bearing: 0,
      attributionControl: false,
      pixelRatio: cappedPixelRatio,
      maxTileCacheSize: 300,
      cancelPendingTileRequestsWhileZooming: true,
      refreshExpiredTiles: false,
      fadeDuration: 0,
    });

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
          "biome-pin-marker group cursor-pointer flex flex-col items-center select-none transition-opacity duration-200";

        // Label pill with biome name (solid white bg + page red border, zero backdrop-blur for 60fps over WebGL)
        const labelPill = document.createElement("div");
        labelPill.className =
          "flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-800 border-2 border-red-500 shadow-lg mb-1.5 transition-transform duration-200 group-hover:scale-105";
        labelPill.innerHTML = `
          <span class="w-2 h-2 rounded-full inline-block" style="background-color: ${b.accentColor};"></span>
          <span class="font-sans font-bold text-[11px] whitespace-nowrap tracking-wide text-slate-800">${b.name}</span>
        `;
        pinEl.appendChild(labelPill);

        // Location Pin Beacon with SVG Icon
        const pinIcon = document.createElement("div");
        pinIcon.className = "relative flex items-center justify-center transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-110";
        pinIcon.innerHTML = `
          <div class="w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white" style="background: radial-gradient(circle at 30% 30%, ${b.accentColor}, #0f172a);">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div class="absolute bottom-[-5.5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-white"></div>
        `;
        pinEl.appendChild(pinIcon);

        // Soft terrain dot (radial gradient, zero CSS blur filter)
        const ripple = document.createElement("div");
        ripple.className = "w-7 h-2 mt-1 opacity-70";
        ripple.style.background = `radial-gradient(ellipse at center, ${b.accentColor} 0%, transparent 72%)`;
        pinEl.appendChild(ripple);

        // Click handler (touchAction: manipulation gives zero-delay click on mobile without double-fire)
        pinEl.style.touchAction = "manipulation";
        const handleSelect = (e: Event) => {
          e.stopPropagation();
          sfx.playSwitch();
          onSelectBiomeRef.current?.(b);
          const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
          map.flyTo({
            center: b.center,
            zoom: b.zoom,
            speed: isMobile ? 2.0 : 1.5,
            curve: 1.25,
            pitch: isMobile ? 0 : 22,
            essential: true,
          });
        };

        pinEl.addEventListener("click", handleSelect);

        const pinMarker = new Marker({
          element: pinEl,
          anchor: "bottom",
        })
          .setLngLat(b.center)
          .addTo(map);

        biomePinsRef.current[b.id] = pinMarker;
      });

      // Synchronize overview pins on zoom threshold and refresh viewport culling after panning/flying
      map.on("zoom", () => syncZoomVisibility(false));
      map.on("moveend", () => syncZoomVisibility(true));
      syncZoomVisibility(true);
    });

    mapRef.current = map;

    return () => {
      Object.values(biomePinsRef.current).forEach((pin) => pin.remove());
      biomePinsRef.current = {};
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. React to activeBiome changes (skip initial mount flyTo since map starts at initialBiomeRef)
  useEffect(() => {
    if (isFirstBiomeEffectRef.current) {
      isFirstBiomeEffectRef.current = false;
      return;
    }
    if (!mapRef.current) return;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    mapRef.current.flyTo({
      center: activeBiome.center,
      zoom: activeBiome.zoom,
      speed: isMobile ? 2.0 : 1.5,
      curve: 1.25,
      essential: true,
      pitch: isMobile ? 0 : 22,
    });
  }, [activeBiome]);

  // 3. Render and sync markers for Pokémon (ONLY re-runs when pokemonList changes, NEVER on selection!)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(({ marker }) => marker.remove());
    markersRef.current = {};
    markerImgsRef.current = {};

    pokemonList.forEach((pokemon) => {
      // Custom marker DOM Element (No will-change on 48 idle nodes to save mobile VRAM)
      const el = document.createElement("div");
      el.className = "pokemon-radar-marker group cursor-pointer relative select-none flex items-center justify-center";
      el.style.width = "64px";
      el.style.height = "64px";
      el.style.touchAction = "manipulation";
      el.style.contain = "layout style";

      // Tooltip pill on hover (desktop only)
      const tooltip = document.createElement("div");
      tooltip.className =
        "absolute -top-7 left-1/2 -translate-x-1/2 hidden sm:group-hover:flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-[10px] font-sans text-slate-800 whitespace-nowrap shadow-lg pointer-events-none z-30 font-bold";
      tooltip.innerText = `${pokemon.displayName} · Nv.${pokemon.level}`;
      el.appendChild(tooltip);

      // Soft ground contact shadow via radial gradient (Zero CSS blur filter cost)
      const groundShadow = document.createElement("div");
      groundShadow.className =
        "absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-3 pointer-events-none transition-transform duration-200 group-hover:scale-125";
      groundShadow.style.background = "radial-gradient(ellipse at center, rgba(0,0,0,0.32) 0%, transparent 72%)";
      el.appendChild(groundShadow);

      // Pokemon HD official artwork directly on terrain (0 CSS drop-shadow filter passes during pan/zoom)
      const img = document.createElement("img");
      img.src = pokemon.sprite || pokemon.animatedSprite;
      img.alt = pokemon.displayName;
      img.decoding = "async";
      img.className =
        "w-14 h-14 object-contain pointer-events-none transition-transform duration-200 group-hover:scale-125 group-hover:-translate-y-1.5 select-none";
      el.appendChild(img);
      markerImgsRef.current[pokemon.id] = img;

      // Click handler: zero-delay on mobile with touchAction: manipulation
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        sfx.playDexPage();
        const isAlreadySelected = selectedPokemonIdRef.current === pokemon.id;
        onSelectPokemonRef.current(pokemon);
        if (isAlreadySelected) {
          const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
          map.flyTo({
            center: pokemon.coordinates,
            zoom: 15.5,
            speed: isMobile ? 2.0 : 1.5,
            pitch: isMobile ? 0 : 28,
            essential: true,
          });
        }
      });

      const marker = new Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat(pokemon.coordinates)
        .addTo(map);

      markersRef.current[`${pokemon.id}-${pokemon.coordinates.join(",")}`] = {
        marker,
        coordinates: pokemon.coordinates,
      };
    });

    // Sync visibility with current zoom level
    syncZoomVisibility(true);

    return () => {
      Object.values(markersRef.current).forEach(({ marker }) => marker.remove());
      markersRef.current = {};
      markerImgsRef.current = {};
    };
  }, [pokemonList]);

  // 4. Update selected styling & flyTo when selectedPokemon changes (O(1) class update, NO DOM rebuild!)
  useEffect(() => {
    if (!selectedPokemon) return;

    // Update active highlight classes on marker images instantly (pure transform, zero filter overhead)
    Object.entries(markerImgsRef.current).forEach(([idStr, img]) => {
      const isSel = Number(idStr) === selectedPokemon.id;
      img.className = `w-14 h-14 object-contain pointer-events-none transition-transform duration-200 group-hover:scale-125 group-hover:-translate-y-1.5 select-none ${
        isSel ? "scale-125 -translate-y-2 brightness-105" : ""
      }`;
    });

    // Fly to coordinates smoothly (e.g. when selected from PartyDock or Search)
    if (mapRef.current) {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      mapRef.current.flyTo({
        center: selectedPokemon.coordinates,
        zoom: 15.5,
        speed: isMobile ? 2.0 : 1.5,
        pitch: isMobile ? 0 : 28,
        essential: true,
      });
    }
  }, [selectedPokemon]);

  return (
    <div className="relative w-full h-full min-h-screen bg-white">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
