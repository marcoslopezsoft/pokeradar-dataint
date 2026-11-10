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
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono py-1 px-2 rounded-lg bg-slate-900/40 border border-slate-800">
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
      className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 transition-all shadow-sm hover:shadow-cyan-900/30 text-xs font-mono font-medium disabled:opacity-75 cursor-pointer"
    >
      <Volume2 className={`w-4 h-4 ${isPlaying ? "text-cyan-400 animate-pulse" : ""}`} />
      <span>{isPlaying ? "Reproduciendo..." : "Reproducir Alarido"}</span>

      {isPlaying && (
        <span className="flex items-end gap-0.5 h-3">
          <motion.span
            className="w-0.5 bg-cyan-400 rounded-full"
            animate={{ height: ["20%", "100%", "40%"] }}
            transition={{ repeat: Infinity, duration: 0.4 }}
          />
          <motion.span
            className="w-0.5 bg-cyan-400 rounded-full"
            animate={{ height: ["60%", "20%", "90%"] }}
            transition={{ repeat: Infinity, duration: 0.35, delay: 0.1 }}
          />
          <motion.span
            className="w-0.5 bg-cyan-400 rounded-full"
            animate={{ height: ["30%", "80%", "30%"] }}
            transition={{ repeat: Infinity, duration: 0.45, delay: 0.2 }}
          />
        </span>
      )}
    </button>
  );
}
