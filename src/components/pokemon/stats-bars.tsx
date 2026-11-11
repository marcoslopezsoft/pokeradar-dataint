"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatsBarsProps {
  stats: Record<string, number>;
}

const STAT_CONFIG: Record<
  string,
  { label: string; max: number }
> = {
  hp: { label: "HP", max: 255 },
  attack: { label: "Ataque", max: 190 },
  defense: { label: "Defensa", max: 230 },
  "special-attack": { label: "Atq. Esp.", max: 194 },
  "special-defense": { label: "Def. Esp.", max: 230 },
  speed: { label: "Velocidad", max: 200 },
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
    <div className="space-y-3.5">
      <div className="space-y-3">
        {statKeys.map((key) => {
          const config = STAT_CONFIG[key] || {
            label: key,
            max: 200,
          };
          const val = stats[key] || 0;
          const percentage = Math.min(
            100,
            Math.round((val / config.max) * 100),
          );

          // Behance Pokédex color logic: >= 50 teal/green, < 50 warm coral/red
          const barColor =
            val >= 100
              ? 'bg-[#48d0b0]'
              : val >= 60
                ? 'bg-[#6890f0]'
                : 'bg-[#fb6c6c]';

          return (
            <div key={key} className="flex items-center text-xs">
              <span className="w-20 text-slate-500 font-medium tracking-wide">
                {config.label}
              </span>
              <span className="w-10 text-slate-800 font-semibold text-right pr-3">
                {val}
              </span>
              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${barColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}

        {/* Total Stat Row */}
        <div className="flex items-center text-xs pt-1 border-t border-slate-200">
          <span className="w-20 text-slate-700 font-bold tracking-wide">
            Total
          </span>
          <span className="w-10 text-red-600 font-bold text-right pr-3">
            {total}
          </span>
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-red-500 to-rose-600"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, Math.round((total / 720) * 100))}%`,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
