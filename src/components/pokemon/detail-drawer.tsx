"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, MapPin, Ruler, Weight, ShieldCheck, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { PokemonRadarEntity } from "@/types/pokemon";
import { TypeBadge } from "./type-badge";
import { StatsBars } from "./stats-bars";
import { CryPlayer } from "./cry-player";
import { sfx } from '@/lib/sound-effects';

interface DetailDrawerProps {
  pokemon: PokemonRadarEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToParty: (pokemon: PokemonRadarEntity) => void;
  isInParty: boolean;
  isPartyFull: boolean;
}

export function DetailDrawer({
  pokemon,
  isOpen,
  onClose,
  onAddToParty,
  isInParty,
  isPartyFull,
}: DetailDrawerProps) {
  if (!pokemon) return null;

  const handleCapture = () => {
    onAddToParty(pokemon);
    sfx.playCatchSuccess();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#38bdf8", "#eab308", "#10b981", "#ef4444"],
    });
  };

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Drawer container */}
          <motion.aside
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-slate-950/95 border-l border-slate-800 backdrop-blur-2xl z-50 flex flex-col shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  #{String(pokemon.id).padStart(3, '0')}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  RADAR SCANNER
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
                aria-label="Cerrar panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Pokemon Title & Origin */}
              <div>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-2xl font-bold tracking-tight text-white capitalize">
                    {pokemon.displayName}
                  </h2>
                  <span className="font-mono text-xs text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/50">
                    Nv. {pokemon.level}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    Avistado en:{' '}
                    <strong className="text-slate-300">
                      {pokemon.biomeName}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Sprite Showcase with Radar Glow */}
              <div className="relative flex items-center justify-center p-6 rounded-2xl bg-linear-to-b from-slate-900/60 to-slate-950/80 border border-slate-800/80 overflow-hidden">
                <div className="absolute inset-0 bg-radial from-cyan-500/10 to-transparent pointer-events-none" />

                {pokemon.animatedSprite ? (
                  <img
                    src={pokemon.animatedSprite}
                    alt={pokemon.displayName}
                    className="w-36 h-36 object-contain pixelated z-10 filter drop-shadow-[0_10px_15px_rgba(6,182,212,0.25)]"
                  />
                ) : (
                  <img
                    src={pokemon.sprite}
                    alt={pokemon.displayName}
                    className="w-36 h-36 object-contain z-10 filter drop-shadow-[0_10px_15px_rgba(6,182,212,0.25)]"
                  />
                )}
              </div>

              {/* Element Types & Cry Button */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {pokemon.types.map((type) => (
                    <TypeBadge key={type} type={type} size="md" />
                  ))}
                </div>
                <CryPlayer cryUrl={pokemon.cryUrl} name={pokemon.displayName} />
              </div>

              {/* Physical Dimensions */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800/60 text-cyan-400">
                    <Ruler className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      Altura
                    </div>
                    <div className="text-sm font-bold font-mono text-slate-200">
                      {pokemon.height} m
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800/60 text-cyan-400">
                    <Weight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      Peso
                    </div>
                    <div className="text-sm font-bold font-mono text-slate-200">
                      {pokemon.weight} kg
                    </div>
                  </div>
                </div>
              </div>

              {/* Base Stats Animated */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
                <StatsBars stats={pokemon.stats} />
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="sticky bottom-0 p-4 bg-slate-950/95 backdrop-blur-md border-t border-slate-800">
              <button
                onClick={handleCapture}
                disabled={isInParty || isPartyFull}
                className={`w-full py-3 px-4 rounded-xl font-mono text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isInParty
                    ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                    : isPartyFull
                      ? 'bg-amber-950/40 border border-amber-800/50 text-amber-300 cursor-not-allowed'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border border-cyan-300 shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.01]'
                }`}
              >
                {isInParty ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>EN TU EQUIPO DE EXPEDICIÓN</span>
                  </>
                ) : isPartyFull ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>EQUIPO COMPLETO (6/6)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>RECLUTAR AL EQUIPO DE EXPEDICIÓN</span>
                  </>
                )}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
