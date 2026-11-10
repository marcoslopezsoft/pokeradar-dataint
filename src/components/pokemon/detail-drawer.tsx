"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  MapPin,
  Ruler,
  Weight,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import Lenis from "lenis";
import { PokemonRadarEntity } from "@/types/pokemon";
import { StatsBars } from "./stats-bars";
import { TypeBadge } from "./type-badge";
import { sfx } from "@/lib/sound-effects";
import { translateAbilityToSpanish } from "@/lib/utils";
import { fetchPokemonDescription } from "@/lib/pokeapi";

interface DetailDrawerProps {
  pokemon: PokemonRadarEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToParty: (pokemon: PokemonRadarEntity) => void;
  onRemoveFromParty: (pokemonId: number) => void;
  isInParty: boolean;
  isPartyFull: boolean;
}

const TYPE_THEMES: Record<
  string,
  { bgGradient: string; badgeBg: string; accentColor: string }
> = {
  grass: {
    bgGradient: "from-[#48d0b0] to-[#38b293]",
    badgeBg: "bg-white/25",
    accentColor: "#48d0b0",
  },
  fire: {
    bgGradient: "from-[#fb6c6c] to-[#e64a4a]",
    badgeBg: "bg-white/25",
    accentColor: "#fb6c6c",
  },
  water: {
    bgGradient: "from-[#77befe] to-[#58a0e8]",
    badgeBg: "bg-white/25",
    accentColor: "#77befe",
  },
  electric: {
    bgGradient: "from-[#ffd86f] to-[#e6be48]",
    badgeBg: "bg-white/25",
    accentColor: "#ffd86f",
  },
  bug: {
    bgGradient: "from-[#a8b820] to-[#8d9a1b]",
    badgeBg: "bg-white/25",
    accentColor: "#a8b820",
  },
  normal: {
    bgGradient: "from-[#a8a878] to-[#8a8a60]",
    badgeBg: "bg-white/25",
    accentColor: "#a8a878",
  },
  poison: {
    bgGradient: "from-[#a040a0] to-[#803380]",
    badgeBg: "bg-white/25",
    accentColor: "#a040a0",
  },
  ground: {
    bgGradient: "from-[#e0c068] to-[#cbb050]",
    badgeBg: "bg-white/25",
    accentColor: "#e0c068",
  },
  fairy: {
    bgGradient: "from-[#ee99ac] to-[#d87c91]",
    badgeBg: "bg-white/25",
    accentColor: "#ee99ac",
  },
  fighting: {
    bgGradient: "from-[#c03028] to-[#9f2720]",
    badgeBg: "bg-white/25",
    accentColor: "#c03028",
  },
  psychic: {
    bgGradient: "from-[#f85888] to-[#d43a6a]",
    badgeBg: "bg-white/25",
    accentColor: "#f85888",
  },
  rock: {
    bgGradient: "from-[#b8a038] to-[#968228]",
    badgeBg: "bg-white/25",
    accentColor: "#b8a038",
  },
  ghost: {
    bgGradient: "from-[#705898] to-[#564278]",
    badgeBg: "bg-white/25",
    accentColor: "#705898",
  },
  ice: {
    bgGradient: "from-[#98d8d8] to-[#74bcbc]",
    badgeBg: "bg-white/25",
    accentColor: "#98d8d8",
  },
  dragon: {
    bgGradient: "from-[#7038f8] to-[#5324c4]",
    badgeBg: "bg-white/25",
    accentColor: "#7038f8",
  },
  steel: {
    bgGradient: "from-[#b8b8d0] to-[#9999b4]",
    badgeBg: "bg-white/25",
    accentColor: "#b8b8d0",
  },
  dark: {
    bgGradient: "from-[#705848] to-[#503f34]",
    badgeBg: "bg-white/25",
    accentColor: "#705848",
  },
};

export function DetailDrawer({
  pokemon,
  isOpen,
  onClose,
  onAddToParty,
  onRemoveFromParty,
  isInParty,
  isPartyFull,
}: DetailDrawerProps) {
  const [description, setDescription] = useState<string>("");
  const [isLoadingDesc, setIsLoadingDesc] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const scrollWrapperRef = useRef<HTMLDivElement | null>(null);
  const scrollContentRef = useRef<HTMLDivElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis smooth scroll with scroll position tracking
  useEffect(() => {
    if (!isOpen || !scrollWrapperRef.current) return;

    const lenis = new Lenis({
      wrapper: scrollWrapperRef.current,
      content: scrollContentRef.current || undefined,
      smoothWheel: true,
      lerp: 0.1,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", (e: { scroll: number }) => {
      setScrollY(e.scroll);
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isOpen]);

  // Always reset scroll to top when opening or switching pokemon
  useEffect(() => {
    if (isOpen) {
      setScrollY(0);
      if (scrollWrapperRef.current) {
        scrollWrapperRef.current.scrollTop = 0;
      }
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      }
    }
  }, [isOpen, pokemon?.id]);

  // Play Pokemon authentic cry automatically on selection
  useEffect(() => {
    if (!isOpen || !pokemon?.cryUrl) return;

    const audio = new Audio(pokemon.cryUrl);
    audio.volume = 0.5;
    audio.play().catch((err) => {
      console.warn("Auto-play cry blocked or interrupted:", err);
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [isOpen, pokemon?.id, pokemon?.cryUrl]);

  // Fetch official Pokédex description in Spanish
  useEffect(() => {
    if (!pokemon) return;
    let isMounted = true;
    setIsLoadingDesc(true);

    fetchPokemonDescription(pokemon.id)
      .then((desc) => {
        if (isMounted) {
          setDescription(desc);
          setIsLoadingDesc(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoadingDesc(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pokemon?.id]);

  if (!pokemon) return null;

  const primaryType = pokemon.types[0]?.toLowerCase() || "normal";
  const theme =
    TYPE_THEMES[primaryType] || {
      bgGradient: "from-[#3b82f6] to-[#1d4ed8]",
      badgeBg: "bg-white/25",
      accentColor: "#3b82f6",
    };

  // Toggle party recruitment via heart icon
  const handleToggleParty = () => {
    if (!pokemon) return;

    if (isInParty) {
      onRemoveFromParty(pokemon.id);
      sfx.playRelease();
    } else {
      if (isPartyFull) return;
      onAddToParty(pokemon);
      sfx.playCatchSuccess();
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#38bdf8", "#eab308", "#10b981", "#ef4444"],
      });
    }
  };

  // Parallax and scroll progress: 0 when at top, 1 when scrolled 180px
  const scrollProgress = Math.min(1, Math.max(0, scrollY / 180));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Behance Pokédex Sheet Drawer with Lenis Smooth Scrolling */}
          <motion.aside
            ref={scrollWrapperRef}
            initial={{ x: "100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 right-0 h-full h-dvh w-full max-w-md bg-white z-50 flex flex-col shadow-2xl overflow-y-auto no-scrollbar"
          >
            <div ref={scrollContentRef} className="relative flex flex-col min-h-full bg-white">
              {/* Sticky Top Header Bar (Always pinned at top, keeps Habitat visible when scrolling down) */}
              <div
                className={`sticky top-0 z-40 h-14 flex items-center justify-between px-4 transition-colors duration-200 ${
                  scrollY > 30
                    ? `bg-slate-900/85 backdrop-blur-xl border-b border-white/10 shadow-lg text-white`
                    : `bg-transparent text-white`
                }`}
              >
                {/* Back button */}
                <button
                  onClick={onClose}
                  className="p-2 -ml-1 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer z-10"
                  aria-label="Volver"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Habitat (Centered in the middle, no padding, just icon and text) */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-white text-xs font-semibold max-w-[55%] pointer-events-none drop-shadow-xs">
                  <MapPin className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="truncate leading-none">
                    {pokemon.biomeName}
                  </span>
                </div>

                {/* Right Actions: Level & Heart Party Toggle */}
                <div className="flex items-center gap-2 z-10">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                    Nv. {pokemon.level}
                  </span>

                  <button
                    onClick={handleToggleParty}
                    disabled={!isInParty && isPartyFull}
                    className={`p-2 rounded-full transition-all cursor-pointer ${
                      isInParty
                        ? "bg-white/30 text-white shadow-md scale-105"
                        : isPartyFull
                          ? "opacity-50 cursor-not-allowed hover:bg-transparent"
                          : "hover:bg-white/20 text-white"
                    }`}
                    title={
                      isInParty
                        ? "Quitar del equipo de expedición"
                        : isPartyFull
                          ? "Equipo completo (6/6)"
                          : "Reclutar al equipo"
                    }
                    aria-label={
                      isInParty
                        ? "Quitar del equipo"
                        : "Reclutar al equipo"
                    }
                  >
                    <Heart
                      className={`w-5 h-5 transition-transform ${
                        isInParty ? "fill-red-500 text-red-500 scale-110" : "text-white"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Sticky Hero Container: Seamlessly connects to header with exact 56px offset, zero gaps */}
              <div
                style={{ marginTop: "-56px", paddingTop: "56px" }}
                className={`sticky top-0 z-10 w-full bg-gradient-to-br ${theme.bgGradient} text-white overflow-hidden shrink-0 h-[340px] flex flex-col justify-center items-center`}
              >
                {/* Floating Ambient Atmosphere Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-white/20"
                      initial={{
                        x: `${10 + i * 16}%`,
                        y: "110%",
                        scale: 0.6 + (i % 3) * 0.3,
                        opacity: 0.1,
                      }}
                      animate={{
                        y: ["110%", "-20%"],
                        opacity: [0.1, 0.45, 0],
                      }}
                      transition={{
                        duration: 4.5 + (i % 3) * 2,
                        repeat: Infinity,
                        delay: i * 0.7,
                        ease: "linear",
                      }}
                    />
                  ))}
                </div>

                {/* Pokéball Background Watermark with slow rotation */}
                <motion.svg
                  viewBox="0 0 100 100"
                  className="absolute -right-8 -bottom-8 w-64 h-64 text-white/15 pointer-events-none"
                  fill="currentColor"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
                >
                  <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 10c19.9 0 36.3 14.7 39.4 34H66.2C63.6 34.6 57.4 30 50 30s-13.6 4.6-16.2 14H10.6C13.7 24.7 30.1 10 50 10zm0 80c-19.9 0-36.3-14.7-39.4-34h23.2C36.4 65.4 42.6 70 50 70s13.6-4.6 16.2-14h23.2c-3.1 19.3-19.5 34-39.4 34zm0-50c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10z" />
                </motion.svg>

                {/* Centered Large Pokemon Sprite (No Bounce, Centered in Drawer, Scales slightly on scroll) */}
                <div
                  style={{
                    transform: `scale(${1 - scrollProgress * 0.15}) translateY(${scrollProgress * 20}px)`,
                    opacity: 1 - scrollProgress * 0.45,
                  }}
                  className="relative z-20 flex flex-col items-center justify-center my-auto py-2 transition-transform ease-out duration-75"
                >
                  {/* Luminous Pulsing Aura Behind Pokemon */}
                  <div className="absolute w-52 h-52 rounded-full bg-white/20 blur-2xl pointer-events-none" />

                  {/* Big Centered Pokemon Sprite (Static, Crisp Pixel-Art Rendering) */}
                  <img
                    src={pokemon.animatedSprite || pokemon.sprite}
                    alt={pokemon.displayName}
                    style={{ imageRendering: "pixelated" }}
                    className="w-48 h-48 object-contain filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.35)]"
                  />

                  {/* Dynamic Ground Breathing Shadow */}
                  <div className="w-32 h-3 rounded-full bg-black/25 blur-xs mx-auto -mt-2" />
                </div>
              </div>

              {/* Sliding White Sheet: Glides UP and smoothly covers the sticky hero when scrolling down */}
              <div className="relative z-30 flex-1 w-full rounded-t-[36px] bg-white p-6 -mt-4 shadow-[0_-16px_36px_rgba(0,0,0,0.14)] space-y-5 pb-36 min-h-screen">
                {/* Subtle Sheet Indicator Pill */}
                <div className="w-10 h-1.5 rounded-full bg-slate-200 mx-auto -mt-2 mb-2" />

                {/* 1. Nombre */}
                <div>
                  <h2 className="text-3xl font-extrabold capitalize text-slate-900 tracking-tight font-sans">
                    {pokemon.displayName}
                  </h2>
                  {/* 2. Número abajo del nombre tipo gris */}
                  <div className="text-sm font-bold text-slate-400 font-sans tracking-wider mt-0.5">
                    N° {String(pokemon.id).padStart(3, "0")}
                  </div>
                </div>

                {/* 3. Tipo abajo del número con su icono correspondiente */}
                <div className="flex flex-wrap items-center gap-2">
                  {pokemon.types.map((type) => (
                    <TypeBadge key={type} type={type} size="md" showIcon={true} />
                  ))}
                </div>

                {/* 4. Habilidad */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Habilidad
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.abilities && pokemon.abilities.length > 0 ? (
                      pokemon.abilities.map((ability) => (
                        <span
                          key={ability}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>{translateAbilityToSpanish(ability)}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">Habilidad estándar</span>
                    )}
                  </div>
                </div>

                {/* 5. Descripción de la Pokédex */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Descripción Pokédex
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 italic">
                    {isLoadingDesc
                      ? "Consultando registro Pokédex..."
                      : `"${description}"`}
                  </p>
                </div>

                {/* 6. Peso y Altura */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white shadow-xs text-slate-700">
                      <Ruler className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-slate-400">
                        Altura
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        {pokemon.height} m
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white shadow-xs text-slate-700">
                      <Weight className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-slate-400">
                        Peso
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        {pokemon.weight} kg
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. Estadísticas Base */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Estadísticas Base
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <StatsBars stats={pokemon.stats} />
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
