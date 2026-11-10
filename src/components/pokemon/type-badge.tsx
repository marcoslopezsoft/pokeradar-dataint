import React from "react";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<
  string,
  { label: string; bg: string; border: string; text: string; glow: string }
> = {
  normal: {
    label: "Normal",
    bg: "bg-stone-500/20",
    border: "border-stone-400/40",
    text: "text-stone-300",
    glow: "shadow-stone-500/20",
  },
  fire: {
    label: "Fuego",
    bg: "bg-orange-500/20",
    border: "border-orange-500/50",
    text: "text-orange-400",
    glow: "shadow-orange-500/30",
  },
  water: {
    label: "Agua",
    bg: "bg-blue-500/20",
    border: "border-blue-500/50",
    text: "text-blue-400",
    glow: "shadow-blue-500/30",
  },
  grass: {
    label: "Planta",
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/50",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/30",
  },
  electric: {
    label: "Eléctrico",
    bg: "bg-yellow-500/20",
    border: "border-yellow-400/50",
    text: "text-yellow-300",
    glow: "shadow-yellow-500/30",
  },
  ice: {
    label: "Hielo",
    bg: "bg-cyan-400/20",
    border: "border-cyan-400/50",
    text: "text-cyan-300",
    glow: "shadow-cyan-400/30",
  },
  fighting: {
    label: "Lucha",
    bg: "bg-red-700/20",
    border: "border-red-600/50",
    text: "text-red-400",
    glow: "shadow-red-600/30",
  },
  poison: {
    label: "Veneno",
    bg: "bg-purple-600/20",
    border: "border-purple-500/50",
    text: "text-purple-300",
    glow: "shadow-purple-600/30",
  },
  ground: {
    label: "Tierra",
    bg: "bg-amber-700/20",
    border: "border-amber-600/50",
    text: "text-amber-300",
    glow: "shadow-amber-600/30",
  },
  flying: {
    label: "Volador",
    bg: "bg-indigo-400/20",
    border: "border-indigo-400/50",
    text: "text-indigo-300",
    glow: "shadow-indigo-400/30",
  },
  psychic: {
    label: "Psíquico",
    bg: "bg-pink-500/20",
    border: "border-pink-500/50",
    text: "text-pink-300",
    glow: "shadow-pink-500/30",
  },
  bug: {
    label: "Bicho",
    bg: "bg-lime-500/20",
    border: "border-lime-500/50",
    text: "text-lime-300",
    glow: "shadow-lime-500/30",
  },
  rock: {
    label: "Roca",
    bg: "bg-yellow-800/20",
    border: "border-yellow-700/50",
    text: "text-yellow-400",
    glow: "shadow-yellow-800/30",
  },
  ghost: {
    label: "Fantasma",
    bg: "bg-violet-900/30",
    border: "border-violet-600/50",
    text: "text-violet-300",
    glow: "shadow-violet-800/30",
  },
  dragon: {
    label: "Dragón",
    bg: "bg-violet-600/25",
    border: "border-violet-500/60",
    text: "text-violet-300",
    glow: "shadow-violet-600/30",
  },
  dark: {
    label: "Siniestro",
    bg: "bg-zinc-800/40",
    border: "border-zinc-700/60",
    text: "text-zinc-300",
    glow: "shadow-zinc-700/30",
  },
  steel: {
    label: "Acero",
    bg: "bg-slate-400/20",
    border: "border-slate-400/50",
    text: "text-slate-300",
    glow: "shadow-slate-400/30",
  },
  fairy: {
    label: "Hada",
    bg: "bg-rose-400/20",
    border: "border-rose-400/50",
    text: "text-rose-300",
    glow: "shadow-rose-400/30",
  },
};

interface TypeBadgeProps {
  type: string;
  size?: "sm" | "md" | "lg";
}

export function TypeBadge({ type, size = "md" }: TypeBadgeProps) {
  const normalized = type.toLowerCase();
  const config = TYPE_CONFIG[normalized] || {
    label: type,
    bg: "bg-slate-800/50",
    border: "border-slate-700",
    text: "text-slate-300",
    glow: "shadow-none",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium tracking-wide",
    md: "px-2.5 py-1 text-xs font-semibold tracking-wider uppercase",
    lg: "px-3.5 py-1.5 text-sm font-bold tracking-wider uppercase",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border backdrop-blur-md transition-all shadow-sm",
        config.bg,
        config.border,
        config.text,
        config.glow,
        sizeClasses[size]
      )}
    >
      {config.label}
    </span>
  );
}
