"use client";

import React, { useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

interface CryPlayerProps {
  cryUrl: string | null;
  name: string;
  variant?: "default" | "glass";
}

export function CryPlayer({ cryUrl, name, variant = "default" }: CryPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = () => {
    if (!cryUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(cryUrl);
      audioRef.current.volume = 0.6;
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => setIsPlaying(false);
    } else {
      audioRef.current.src = cryUrl;
    }

    setIsPlaying(true);
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((err) => {
      console.warn("Audio playback interrupted:", err);
      setIsPlaying(false);
    });
  };

  const isGlass = variant === "glass";

  if (!cryUrl) {
    return (
      <div
        className={`flex items-center gap-1.5 text-xs font-sans py-1.5 px-3 rounded-xl ${
          isGlass
            ? "bg-white/15 border border-white/20 text-white/70"
            : "bg-slate-100 border border-slate-200 text-slate-400"
        }`}
      >
        <VolumeX className="w-3.5 h-3.5" />
        <span>Audio no disponible</span>
      </div>
    );
  }

  return (
    <button
      onClick={handlePlay}
      disabled={isPlaying}
      aria-label={`Reproducir sonido de ${name}`}
      className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shadow-xs text-xs font-sans font-semibold disabled:opacity-75 cursor-pointer ${
        isGlass
          ? "bg-white/20 hover:bg-white/30 border border-white/30 text-white shadow-md shadow-black/10 hover:scale-[1.02]"
          : "bg-red-50 border border-red-200 hover:border-red-400 text-red-600 hover:text-red-700"
      }`}
    >
      <Volume2
        className={`w-4 h-4 ${
          isPlaying
            ? isGlass
              ? "text-white animate-pulse"
              : "text-red-600 animate-pulse"
            : ""
        }`}
      />
      <span>{isPlaying ? "Reproduciendo..." : "Reproducir Alarido"}</span>

      {isPlaying && (
        <span className="flex items-end gap-0.5 h-3">
          <motion.span
            className={`w-0.5 rounded-full ${isGlass ? "bg-white" : "bg-red-500"}`}
            animate={{ height: ["20%", "100%", "40%"] }}
            transition={{ repeat: Infinity, duration: 0.4 }}
          />
          <motion.span
            className={`w-0.5 rounded-full ${isGlass ? "bg-white" : "bg-red-500"}`}
            animate={{ height: ["60%", "20%", "90%"] }}
            transition={{ repeat: Infinity, duration: 0.35, delay: 0.1 }}
          />
          <motion.span
            className={`w-0.5 rounded-full ${isGlass ? "bg-white" : "bg-red-500"}`}
            animate={{ height: ["30%", "80%", "30%"] }}
            transition={{ repeat: Infinity, duration: 0.45, delay: 0.2 }}
          />
        </span>
      )}
    </button>
  );
}
