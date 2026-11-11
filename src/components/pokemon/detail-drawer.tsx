"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import Lenis from "lenis";
import { PokemonRadarEntity } from "@/types/pokemon";
import { StatsBars } from "./stats-bars";
import { TypeBadge } from "./type-badge";
import { sfx } from "@/lib/sound-effects";
import { translateAbilityToSpanish } from "@/lib/utils";
import { fetchPokemonDescription, fetchAbilitySpanishName } from "@/lib/pokeapi";

interface DetailDrawerProps {
  pokemon: PokemonRadarEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToParty: (pokemon: PokemonRadarEntity) => void;
  onRemoveFromParty: (pokemonId: number) => void;
  isInParty: boolean;
  isPartyFull: boolean;
}

interface TypeTheme {
  from: string;
  to: string;
  badgeBg: string;
  accentColor: string;
}

const DEFAULT_TYPE_THEME: TypeTheme = {
  from: "#3b82f6",
  to: "#1d4ed8",
  badgeBg: "bg-white/25",
  accentColor: "#3b82f6",
};

const TYPE_THEMES: Record<string, TypeTheme> = {
  grass: {
    from: "#48d0b0",
    to: "#38b293",
    badgeBg: "bg-white/25",
    accentColor: "#48d0b0",
  },
  fire: {
    from: "#fb6c6c",
    to: "#e64a4a",
    badgeBg: "bg-white/25",
    accentColor: "#fb6c6c",
  },
  water: {
    from: "#77befe",
    to: "#58a0e8",
    badgeBg: "bg-white/25",
    accentColor: "#77befe",
  },
  electric: {
    from: "#ffd86f",
    to: "#e6be48",
    badgeBg: "bg-white/25",
    accentColor: "#ffd86f",
  },
  bug: {
    from: "#a8b820",
    to: "#8d9a1b",
    badgeBg: "bg-white/25",
    accentColor: "#a8b820",
  },
  normal: {
    from: "#a8a878",
    to: "#8a8a60",
    badgeBg: "bg-white/25",
    accentColor: "#a8a878",
  },
  poison: {
    from: "#a040a0",
    to: "#803380",
    badgeBg: "bg-white/25",
    accentColor: "#a040a0",
  },
  ground: {
    from: "#e0c068",
    to: "#cbb050",
    badgeBg: "bg-white/25",
    accentColor: "#e0c068",
  },
  fairy: {
    from: "#ee99ac",
    to: "#d87c91",
    badgeBg: "bg-white/25",
    accentColor: "#ee99ac",
  },
  fighting: {
    from: "#c03028",
    to: "#9f2720",
    badgeBg: "bg-white/25",
    accentColor: "#c03028",
  },
  psychic: {
    from: "#f85888",
    to: "#d43a6a",
    badgeBg: "bg-white/25",
    accentColor: "#f85888",
  },
  rock: {
    from: "#b8a038",
    to: "#968228",
    badgeBg: "bg-white/25",
    accentColor: "#b8a038",
  },
  ghost: {
    from: "#705898",
    to: "#564278",
    badgeBg: "bg-white/25",
    accentColor: "#705898",
  },
  ice: {
    from: "#98d8d8",
    to: "#74bcbc",
    badgeBg: "bg-white/25",
    accentColor: "#98d8d8",
  },
  dragon: {
    from: "#7038f8",
    to: "#5324c4",
    badgeBg: "bg-white/25",
    accentColor: "#7038f8",
  },
  steel: {
    from: "#b8b8d0",
    to: "#9999b4",
    badgeBg: "bg-white/25",
    accentColor: "#b8b8d0",
  },
  dark: {
    from: "#705848",
    to: "#503f34",
    badgeBg: "bg-white/25",
    accentColor: "#705848",
  },
  flying: {
    from: "#8fa8ff",
    to: "#6884eb",
    badgeBg: "bg-white/25",
    accentColor: "#8fa8ff",
  },
};

function buildElementalBackground(primary: TypeTheme, secondary?: TypeTheme | null): string {
  if (!secondary) {
    return `linear-gradient(135deg, ${primary.from} 0%, ${primary.to} 100%)`;
  }
  return `linear-gradient(135deg, ${primary.from} 0%, ${primary.to} calc(50% - 1.5px), #ffffff calc(50% - 1px), #ffffff calc(50% + 1px), ${secondary.from} calc(50% + 1.5px), ${secondary.to} 100%)`;
}

/** Dual-type SVG backdrop with a stepped diagonal seam matching Pokemon type halves. */
function ElementalSteppedBackdrop({
  primary,
  secondary,
}: {
  primary: TypeTheme;
  secondary: TypeTheme;
}) {
  const uid = useId().replace(/:/g, "");
  const grad1Id = `poke-grad-1-${uid}`;
  const grad2Id = `poke-grad-2-${uid}`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      <defs>
        <linearGradient id={grad1Id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primary.from} />
          <stop offset="100%" stopColor={primary.to} />
        </linearGradient>
        <linearGradient id={grad2Id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={secondary.from} />
          <stop offset="100%" stopColor={secondary.to} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill={`url(#${grad2Id})`} />
      <polygon points="0,0 100,0 57,50 43,50 0,100" fill={`url(#${grad1Id})`} />
      <polyline
        points="0,100 43,50 57,50 100,0"
        fill="none"
        stroke="rgba(255, 255, 255, 0.65)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Measures non-transparent pixel bounds to normalize sprite height uniformly across species. */
function computeNormalizedSpriteTransform(
  img: HTMLImageElement,
  boxWidth = 256,
  boxHeight = 224
): { scale: number; offsetY: number } {
  const natW = img.naturalWidth;
  const natH = img.naturalHeight;
  if (!natW || !natH) return { scale: 1, offsetY: 0 };

  const containScale = Math.min(boxWidth / natW, boxHeight / natH);
  const drawnW = natW * containScale;
  const drawnH = natH * containScale;

  const sampleW = Math.min(128, natW);
  const sampleH = Math.max(1, Math.round(natH * (sampleW / natW)));

  try {
    const canvas = document.createElement("canvas");
    canvas.width = sampleW;
    canvas.height = sampleH;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return { scale: 1, offsetY: 0 };

    ctx.drawImage(img, 0, 0, sampleW, sampleH);
    const { data } = ctx.getImageData(0, 0, sampleW, sampleH);

    let minX = sampleW;
    let minY = sampleH;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < sampleH; y++) {
      for (let x = 0; x < sampleW; x++) {
        if (data[(y * sampleW + x) * 4 + 3] > 20) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) return { scale: 1, offsetY: 0 };

    const visiblePxW = drawnW * ((maxX - minX + 1) / sampleW);
    const visiblePxH = drawnH * ((maxY - minY + 1) / sampleH);
    const centerFracY = (minY + maxY) / 2 / sampleH - 0.5;

    const targetHeight = boxHeight * 0.92;
    const maxWidth = boxWidth * 1.12;
    const scaleByH = visiblePxH > 0 ? targetHeight / visiblePxH : 1;
    const scaleByW = visiblePxW > 0 ? maxWidth / visiblePxW : 1;
    const scale = Number(
      Math.max(1, Math.min(scaleByH, scaleByW, 2.35)).toFixed(3)
    );
    const offsetY = Number((-centerFracY * drawnH * scale).toFixed(1));

    return { scale, offsetY };
  } catch {
    return { scale: 1, offsetY: 0 };
  }
}

export function DetailDrawer({
  pokemon,
  isOpen,
  onClose,
  onAddToParty,
  onRemoveFromParty,
  isInParty,
  isPartyFull,
}: DetailDrawerProps) {
  const scrollKey = `${pokemon?.id ?? "none"}-${isOpen ? "open" : "closed"}`;
  const [descState, setDescState] = useState<{ id: number; text: string } | null>(null);
  const [abilityTranslations, setAbilityTranslations] = useState<Record<string, string>>({});
  const [scrollState, setScrollState] = useState<{ key: string; y: number }>({
    key: scrollKey,
    y: 0,
  });
  const [spriteNorm, setSpriteNorm] = useState<{
    id: number;
    scale: number;
    offsetY: number;
  } | null>(null);

  const scrollWrapperRef = useRef<HTMLDivElement | null>(null);
  const scrollContentRef = useRef<HTMLDivElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const openedAtRef = useRef<number>(0);
  const scrollKeyRef = useRef<string>(scrollKey);
  useEffect(() => {
    scrollKeyRef.current = scrollKey;
  }, [scrollKey]);

  const scrollY = scrollState.key === scrollKey ? scrollState.y : 0;
  const isLoadingDesc = Boolean(pokemon && descState?.id !== pokemon.id);
  const description = descState && descState.id === pokemon?.id ? descState.text : "";

  // Initialize Lenis smooth scroll on desktop only (mobile uses native 60fps touch scroll)
  useEffect(() => {
    if (!isOpen || !scrollWrapperRef.current) return;
    openedAtRef.current = Date.now();

    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      return;
    }

    const lenis = new Lenis({
      wrapper: scrollWrapperRef.current,
      content: scrollContentRef.current || undefined,
      smoothWheel: true,
      lerp: 0.1,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", (e: { scroll: number }) => {
      setScrollState({ key: scrollKeyRef.current, y: e.scroll });
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

  // Always reset DOM scroll position when opening or switching pokemon
  useEffect(() => {
    if (isOpen) {
      if (scrollWrapperRef.current) {
        scrollWrapperRef.current.scrollTop = 0;
      }
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      }
    }
  }, [isOpen, pokemon?.id]);

  // Fetch official Pokédex description in Spanish
  useEffect(() => {
    if (!pokemon) return;
    let isMounted = true;
    const targetId = pokemon.id;

    fetchPokemonDescription(targetId)
      .then((desc) => {
        if (isMounted) {
          setDescState({ id: targetId, text: desc });
        }
      })
      .catch(() => {
        if (isMounted) {
          setDescState({
            id: targetId,
            text: "Registro de especie catalogado por los sensores del PokéRadar.",
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pokemon]);

  // Fetch official PokéAPI Spanish ability names
  useEffect(() => {
    if (!pokemon?.abilities || pokemon.abilities.length === 0) return;
    let isMounted = true;

    pokemon.abilities.forEach((ability) => {
      fetchAbilitySpanishName(ability).then((esName) => {
        if (isMounted && esName) {
          setAbilityTranslations((prev) => ({
            ...prev,
            [ability]: esName,
          }));
        }
      });
    });

    return () => {
      isMounted = false;
    };
  }, [pokemon?.id, pokemon?.abilities]);

  if (!pokemon) return null;

  const primaryType = pokemon.types[0]?.toLowerCase() || "normal";
  const secondaryType = pokemon.types[1]?.toLowerCase();
  const primaryTheme = TYPE_THEMES[primaryType] || DEFAULT_TYPE_THEME;
  const secondaryTheme =
    secondaryType && secondaryType !== primaryType
      ? TYPE_THEMES[secondaryType] || DEFAULT_TYPE_THEME
      : null;
  const elementalBackground = buildElementalBackground(primaryTheme, secondaryTheme);

  // Play Pokemon authentic cry when clicking on the Pokemon sprite
  const handlePlayCry = () => {
    if (!pokemon.cryUrl) return;
    try {
      const audio = new Audio(pokemon.cryUrl);
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch {
      // Audio playback safety
    }
  };

  // Toggle party recruitment via heart icon with authentic Pokemon Red/Blue SFX (No Confetti)
  const handleToggleParty = () => {
    if (!pokemon) return;

    if (isInParty) {
      onRemoveFromParty(pokemon.id);
      sfx.playRelease();
    } else {
      if (isPartyFull) {
        sfx.playDenied();
        return;
      }
      onAddToParty(pokemon);
      sfx.playCatchSuccess();
    }
  };

  const handleClose = () => {
    sfx.playButtonPress();
    onClose();
  };

  // Safe backdrop close that ignores accidental tap bleed-through within 350ms of opening
  const handleBackdropClick = () => {
    if (Date.now() - openedAtRef.current < 350) return;
    handleClose();
  };

  // Parallax and scroll progress: 0 when at top, 1 when scrolled 180px
  const scrollProgress = Math.min(1, Math.max(0, scrollY / 180));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop on mobile (No heavy backdrop-blur to keep mobile 60fps) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
          />

          {/* Behance Pokédex Sheet Drawer with Smooth GPU-Accelerated Slide */}
          <motion.aside
            ref={scrollWrapperRef}
            onScroll={(e) =>
              setScrollState({ key: scrollKey, y: e.currentTarget.scrollTop })
            }
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform' }}
            className="fixed inset-y-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl overflow-y-auto no-scrollbar overscroll-contain"
          >
            <div
              ref={scrollContentRef}
              className="relative flex flex-col min-h-full bg-white"
            >
              {/* Sticky Top Header Bar (Maintains Pokemon elemental background color on scroll, clipped cleanly to prevent subpixel bleed) */}
              <div
                className={`sticky top-0 z-40 h-14 shrink-0 flex items-center justify-between px-4 overflow-hidden text-white transition-shadow duration-200 ${
                  scrollY > 30 ? "shadow-md" : ""
                }`}
              >
                {/* Opaque scrolled backdrop + uniform 1px bottom hairline */}
                <div
                  aria-hidden="true"
                  className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-200 bg-white ${
                    scrollY > 30 ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div
                    className="w-full h-full"
                    style={{ background: elementalBackground }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-px bg-black/15" />
                </div>
                {/* Left: Back button + Habitat location aligned to the left */}
                <div className="flex items-center gap-1.5 z-10 max-w-[60%]">
                  <button
                    onClick={handleClose}
                    className="p-2 -ml-1 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer shrink-0"
                    aria-label="Volver"
                  >
                    <Icon
                      icon="solar:arrow-left-linear"
                      width={20}
                      height={20}
                    />
                  </button>

                  {/* Habitat aligned to the left next to back arrow */}
                  <div className="flex items-center gap-1.5 text-white text-xs font-semibold truncate drop-shadow-xs">
                    <Icon
                      icon="solar:map-point-bold"
                      width={14}
                      height={14}
                      className="text-white shrink-0 drop-shadow-xs"
                    />
                    <span className="truncate leading-none">
                      {pokemon.biomeName}
                    </span>
                  </div>
                </div>

                {/* Right Actions: Level & Heart Party Toggle */}
                <div className="flex items-center gap-2 z-10">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/25">
                    Nv. {pokemon.level}
                  </span>

                  <button
                    onClick={handleToggleParty}
                    disabled={!isInParty && isPartyFull}
                    className={`p-1.5 rounded-full transition-all cursor-pointer ${
                      isInParty
                        ? 'bg-white/30 text-white shadow-sm'
                        : isPartyFull
                          ? 'opacity-50 cursor-not-allowed hover:bg-transparent'
                          : 'hover:bg-white/20 text-white'
                    }`}
                    title={
                      isInParty
                        ? 'Quitar del equipo de expedición'
                        : isPartyFull
                          ? 'Equipo completo (6/6)'
                          : 'Reclutar al equipo'
                    }
                    aria-label={
                      isInParty ? 'Quitar del equipo' : 'Reclutar al equipo'
                    }
                  >
                    <Icon
                      icon={
                        isInParty ? 'solar:heart-bold' : 'solar:heart-linear'
                      }
                      width={20}
                      height={20}
                      className={`transition-transform ${
                        isInParty ? 'text-red-500 scale-110' : 'text-white'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Sticky Hero Container: Seamlessly connects to header with exact 56px offset, zero gaps */}
              <div
                style={{
                  marginTop: '-56px',
                  paddingTop: '56px',
                  background: elementalBackground,
                }}
                className="sticky top-0 z-10 w-full text-white overflow-hidden shrink-0 h-85 flex flex-col justify-center items-center"
              >
                {secondaryTheme && (
                  <ElementalSteppedBackdrop
                    primary={primaryTheme}
                    secondary={secondaryTheme}
                  />
                )}
                {/* Floating Ambient Atmosphere Particles (Desktop only to maintain 60fps on mobile) */}
                <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-white/20"
                      initial={{
                        x: `${10 + i * 16}%`,
                        y: '110%',
                        scale: 0.6 + (i % 3) * 0.3,
                        opacity: 0.1,
                      }}
                      animate={{
                        y: ['110%', '-20%'],
                        opacity: [0.1, 0.45, 0],
                      }}
                      transition={{
                        duration: 4.5 + (i % 3) * 2,
                        repeat: Infinity,
                        delay: i * 0.7,
                        ease: 'linear',
                      }}
                    />
                  ))}
                </div>

                {/* Pokéball Background Watermark (Static on mobile for 60fps, slow rotation on desktop) */}
                <motion.svg
                  viewBox="0 0 100 100"
                  className="hidden md:block absolute -right-8 -bottom-8 w-64 h-64 text-white/15 pointer-events-none"
                  fill="currentColor"
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 45,
                    ease: 'linear',
                  }}
                >
                  <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 10c19.9 0 36.3 14.7 39.4 34H66.2C63.6 34.6 57.4 30 50 30s-13.6 4.6-16.2 14H10.6C13.7 24.7 30.1 10 50 10zm0 80c-19.9 0-36.3-14.7-39.4-34h23.2C36.4 65.4 42.6 70 50 70s13.6-4.6 16.2-14h23.2c-3.1 19.3-19.5 34-39.4 34zm0-50c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10z" />
                </motion.svg>
                <svg
                  viewBox="0 0 100 100"
                  className="md:hidden absolute -right-8 -bottom-8 w-64 h-64 text-white/15 pointer-events-none"
                  fill="currentColor"
                >
                  <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 10c19.9 0 36.3 14.7 39.4 34H66.2C63.6 34.6 57.4 30 50 30s-13.6 4.6-16.2 14H10.6C13.7 24.7 30.1 10 50 10zm0 80c-19.9 0-36.3-14.7-39.4-34h23.2C36.4 65.4 42.6 70 50 70s13.6-4.6 16.2-14h23.2c-3.1 19.3-19.5 34-39.4 34zm0-50c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10z" />
                </svg>

                {/* Centered Large Pokemon Sprite (Click to roar authentic cry) */}
                <div
                  onClick={handlePlayCry}
                  style={{
                    transform: `scale(${1 - scrollProgress * 0.15}) translateY(${scrollProgress * 20}px)`,
                    opacity: 1 - scrollProgress * 0.45,
                  }}
                  className="relative z-20 flex flex-col items-center justify-center my-auto pb-3 cursor-pointer group active:scale-95 transition-transform"
                  title={`Haz clic para escuchar el alarido de ${pokemon.displayName}`}
                >
                  {/* Luminous Aura Behind Pokemon via radial-gradient (zero CSS blur cost) */}
                  <div
                    className="absolute w-60 h-60 rounded-full pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(255,255,255,0.28) 0%, transparent 70%)',
                    }}
                  />

                  {/* Big Centered Pokemon Sprite normalized cleanly across height (Zero per-frame GIF drop-shadow on mobile!) */}
                  <div className="w-64 h-56 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                    {(() => {
                      const spriteSrc = pokemon.animatedSprite || pokemon.sprite;
                      const activeNorm =
                        spriteNorm?.id === pokemon.id
                          ? spriteNorm
                          : { scale: 1, offsetY: 0 };

                      return (
                        <Image
                          key={pokemon.id}
                          src={spriteSrc}
                          alt={pokemon.displayName}
                          width={256}
                          height={224}
                          unoptimized
                          crossOrigin={
                            spriteSrc.includes('raw.githubusercontent.com')
                              ? 'anonymous'
                              : undefined
                          }
                          onLoad={(e) => {
                            const norm = computeNormalizedSpriteTransform(
                              e.currentTarget,
                              256,
                              224
                            );
                            setSpriteNorm({ id: pokemon.id, ...norm });
                          }}
                          style={{
                            imageRendering: 'pixelated',
                            transform: `translateY(${activeNorm.offsetY}px) scale(${activeNorm.scale})`,
                          }}
                          className="w-full h-full object-contain md:drop-shadow-[0_16px_32px_rgba(0,0,0,0.35)] transition-transform duration-150"
                        />
                      );
                    })()}
                  </div>

                  {/* Soft Ground Shadow via radial gradient */}
                  <div
                    className="w-40 h-4 mx-auto -mt-2"
                    style={{
                      background:
                        'radial-gradient(ellipse at center, rgba(0,0,0,0.26) 0%, transparent 72%)',
                    }}
                  />
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
                  {/* 2. Número abajo del nombre sin ceros innecesarios (ej. N° 8, N° 15) */}
                  <div className="text-sm font-bold text-slate-400 font-sans tracking-wider mt-0.5">
                    N° {pokemon.id}
                  </div>
                </div>

                {/* 3. Tipo abajo del número con su icono correspondiente + afinidad climática si aplica */}
                <div className="flex flex-wrap items-center gap-2">
                  {pokemon.types.map((type) => (
                    <TypeBadge
                      key={type}
                      type={type}
                      size="md"
                      showIcon={true}
                    />
                  ))}
                  {pokemon.weatherBoosted && (
                    <span
                      title={pokemon.weatherBoostReason}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold"
                    >
                      <Icon icon="solar:cloud-sun-2-bold" width={13} height={13} />
                      Afinidad Climática
                    </span>
                  )}
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
                          <Icon
                            icon="solar:bolt-bold"
                            width={14}
                            height={14}
                            className="text-amber-500"
                          />
                          <span>
                            {abilityTranslations[ability] ||
                              translateAbilityToSpanish(ability)}
                          </span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">
                        Habilidad estándar
                      </span>
                    )}
                  </div>
                </div>

                {/* 5. Descripción de la Pokédex */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Descripción Pokédex
                  </div>
                  {isLoadingDesc ? (
                    <div
                      aria-label="Cargando descripción Pokédex"
                      className="space-y-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 animate-pulse"
                    >
                      <div className="h-3 w-full rounded bg-slate-200" />
                      <div className="h-3 w-5/6 rounded bg-slate-200" />
                      <div className="h-3 w-2/3 rounded bg-slate-200" />
                    </div>
                  ) : (
                    <p className="text-xs leading-relaxed text-slate-600 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 italic">
                      &quot;{description}&quot;
                    </p>
                  )}
                </div>

                {/* 6. Peso y Altura */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white shadow-xs text-slate-700">
                      <Icon
                        icon="solar:ruler-bold"
                        width={16}
                        height={16}
                        className="text-cyan-600"
                      />
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
                      <Icon
                        icon="solar:dumbbell-large-bold"
                        width={16}
                        height={16}
                        className="text-amber-600"
                      />
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
