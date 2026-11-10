import React from "react";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<
  string,
  { label: string; bg: string; border: string; text: string; glow: string }
> = {
  normal: {
    label: "Normal",
    bg: "bg-stone-100",
    border: "border-stone-300",
    text: "text-stone-700",
    glow: "shadow-xs",
  },
  fire: {
    label: "Fuego",
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-700",
    glow: "shadow-orange-500/15",
  },
  water: {
    label: "Agua",
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-700",
    glow: "shadow-blue-500/15",
  },
  grass: {
    label: "Planta",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-700",
    glow: "shadow-emerald-500/15",
  },
  electric: {
    label: "Eléctrico",
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-800",
    glow: "shadow-amber-500/15",
  },
  ice: {
    label: "Hielo",
    bg: "bg-cyan-50",
    border: "border-cyan-300",
    text: "text-cyan-800",
    glow: "shadow-cyan-400/15",
  },
  fighting: {
    label: "Lucha",
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-700",
    glow: "shadow-red-600/15",
  },
  poison: {
    label: "Veneno",
    bg: "bg-purple-50",
    border: "border-purple-300",
    text: "text-purple-700",
    glow: "shadow-purple-600/15",
  },
  ground: {
    label: "Tierra",
    bg: "bg-amber-100/70",
    border: "border-amber-400",
    text: "text-amber-900",
    glow: "shadow-amber-600/15",
  },
  flying: {
    label: "Volador",
    bg: "bg-indigo-50",
    border: "border-indigo-300",
    text: "text-indigo-700",
    glow: "shadow-indigo-400/15",
  },
  psychic: {
    label: "Psíquico",
    bg: "bg-pink-50",
    border: "border-pink-300",
    text: "text-pink-700",
    glow: "shadow-pink-500/15",
  },
  bug: {
    label: "Bicho",
    bg: "bg-lime-50",
    border: "border-lime-300",
    text: "text-lime-800",
    glow: "shadow-lime-500/15",
  },
  rock: {
    label: "Roca",
    bg: "bg-yellow-100/70",
    border: "border-yellow-400",
    text: "text-yellow-900",
    glow: "shadow-yellow-800/15",
  },
  ghost: {
    label: "Fantasma",
    bg: "bg-violet-50",
    border: "border-violet-300",
    text: "text-violet-800",
    glow: "shadow-violet-800/15",
  },
  dragon: {
    label: "Dragón",
    bg: "bg-purple-100/60",
    border: "border-purple-400",
    text: "text-purple-900",
    glow: "shadow-purple-600/15",
  },
  dark: {
    label: "Siniestro",
    bg: "bg-zinc-100",
    border: "border-zinc-300",
    text: "text-zinc-800",
    glow: "shadow-zinc-700/15",
  },
  steel: {
    label: "Acero",
    bg: "bg-slate-100",
    border: "border-slate-300",
    text: "text-slate-700",
    glow: "shadow-slate-400/15",
  },
  fairy: {
    label: "Hada",
    bg: "bg-rose-50",
    border: "border-rose-300",
    text: "text-rose-700",
    glow: "shadow-rose-400/15",
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
