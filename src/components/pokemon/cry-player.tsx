"use client";

import React, { useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

interface CryPlayerProps {
  cryUrl: string | null;
  name: string;
}

export function CryPlayer({ cryUrl, name }: CryPlayerProps) {
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

  if (!cryUrl) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans py-1 px-2.5 rounded-lg bg-slate-100 border border-slate-200">
        <VolumeX className="w-3.5 h-3.5 text-slate-400" />
        <span>Audio no disponible</span>
      </div>
    );
  }

  return (
    <button
      onClick={handlePlay}
      disabled={isPlaying}
      aria-label={`Reproducir sonido de ${name}`}
      className="group relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 hover:border-red-400 text-red-600 hover:text-red-700 transition-all shadow-xs text-xs font-sans font-semibold disabled:opacity-75 cursor-pointer"
    >
      <Volume2 className={`w-4 h-4 ${isPlaying ? "text-red-600 animate-pulse" : ""}`} />
      <span>{isPlaying ? "Reproduciendo..." : "Reproducir Alarido"}</span>

      {isPlaying && (
        <span className="flex items-end gap-0.5 h-3">
          <motion.span
            className="w-0.5 bg-red-500 rounded-full"
            animate={{ height: ["20%", "100%", "40%"] }}
            transition={{ repeat: Infinity, duration: 0.4 }}
          />
          <motion.span
            className="w-0.5 bg-red-500 rounded-full"
            animate={{ height: ["60%", "20%", "90%"] }}
            transition={{ repeat: Infinity, duration: 0.35, delay: 0.1 }}
          />
          <motion.span
            className="w-0.5 bg-red-500 rounded-full"
            animate={{ height: ["30%", "80%", "30%"] }}
            transition={{ repeat: Infinity, duration: 0.45, delay: 0.2 }}
          />
        </span>
      )}
    </button>
  );
}
