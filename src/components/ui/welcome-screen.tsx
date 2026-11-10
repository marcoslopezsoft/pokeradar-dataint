"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { sfx } from "@/lib/sound-effects";

interface WelcomeScreenProps {
  onStartAdventure: () => void;
  isLoading: boolean;
}

export function WelcomeScreen({ onStartAdventure, isLoading }: WelcomeScreenProps) {
  const [hasStarted, setHasStarted] = useState(false);

  const handleStart = () => {
    sfx.playMenuOpen();
    sfx.startBgm();
    setHasStarted(true);
    onStartAdventure();
  };

  return (
    <AnimatePresence>
      {!hasStarted && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white p-6 select-none"
        >
          {/* Subtle Watermark in background */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
            className="absolute w-[600px] h-[600px] pointer-events-none opacity-5"
          >
            <img
              src="/pokeball-icon.webp"
              alt=""
              className="w-full h-full object-contain"
            />
          </motion.div>

          {/* Main Card Content */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
            {/* Pokeball Logo (Spinning when loading, breathing when ready) */}
            <div className="relative flex items-center justify-center mb-8">
              {/* Luminous Pulsing Glow */}
              <motion.div
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.15, 0.35, 0.15],
                }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute w-44 h-44 rounded-full bg-red-500 blur-2xl pointer-events-none"
              />

              {/* Pokeball Image */}
              <motion.div
                animate={
                  isLoading
                    ? { rotate: 360 }
                    : { y: [0, -6, 0] }
                }
                transition={
                  isLoading
                    ? { repeat: Infinity, duration: 1.2, ease: "linear" }
                    : { repeat: Infinity, duration: 2.8, ease: "easeInOut" }
                }
                className="relative z-10 w-28 h-28 flex items-center justify-center"
              >
                <img
                  src="/pokeball-icon.webp"
                  alt="PokéRadar Pokeball"
                  className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(220,10,45,0.3)]"
                />
              </motion.div>
            </div>

            {/* Title & Brand */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="space-y-2 mb-8"
            >
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
                POKÉRADAR <span className="text-red-600">GEO</span>
              </h1>

              <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
                Exploración geoespacial interactiva del mundo Pokémon con biomas reales y telemetría satelital.
              </p>
            </motion.div>

            {/* Action Button: Comenzar Aventura / Cargando */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="w-full max-w-xs"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 font-sans text-sm font-bold shadow-xs">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 flex items-center justify-center"
                  >
                    <img
                      src="/pokeball-icon.webp"
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                  <span>Sintonizando Radar...</span>
                </div>
              ) : (
                <button
                  onClick={handleStart}
                  className="group relative w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-sans text-sm font-extrabold tracking-wide shadow-lg shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <span>COMENZAR AVENTURA</span>
                  <Icon
                    icon="solar:arrow-right-linear"
                    width={18}
                    height={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
