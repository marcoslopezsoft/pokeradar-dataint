"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatsBarsProps {
  stats: Record<string, number>;
}

const STAT_CONFIG: Record<
  string,
  { label: string; color: string; max: number }
> = {
  hp: { label: "HP", color: "from-emerald-500 to-green-400", max: 255 },
  attack: { label: "Ataque", color: "from-red-500 to-amber-500", max: 190 },
  defense: { label: "Defensa", color: "from-blue-500 to-cyan-400", max: 230 },
  "special-attack": {
    label: "Atq. Esp.",
    color: "from-purple-500 to-pink-500",
    max: 194,
  },
  "special-defense": {
    label: "Def. Esp.",
    color: "from-indigo-500 to-blue-400",
    max: 230,
  },
  speed: { label: "Velocidad", color: "from-amber-400 to-yellow-300", max: 200 },
};

export function StatsBars({ stats }: StatsBarsProps) {
  const statKeys = [
    "hp",
    "attack",
    "defense",
    "special-attack",
    "special-defense",
    "speed",
  ];

  const total = statKeys.reduce((acc, key) => acc + (stats[key] || 0), 0);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>ESTADÍSTICAS BASE</span>
        <span className="text-cyan-400 font-semibold">TOTAL: {total}</span>
      </div>

      <div className="space-y-2">
        {statKeys.map((key) => {
          const config = STAT_CONFIG[key] || {
            label: key,
            color: "from-cyan-500 to-blue-500",
            max: 200,
          };
          const val = stats[key] || 0;
          const percentage = Math.min(100, Math.round((val / config.max) * 100));

          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">{config.label}</span>
                <span className="text-slate-200 font-bold">{val}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${config.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
