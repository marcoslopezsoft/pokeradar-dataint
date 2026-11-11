"use client";

import React from "react";

interface PokedexSensorClusterProps {
  size?: "sm" | "md";
}

/** Iconic Kanto Pokédex optical blue lens paired with the three status LEDs. */
export function PokedexSensorCluster({ size = "sm" }: PokedexSensorClusterProps) {
  const isMd = size === "md";

  return (
    <div className={`flex items-center ${isMd ? "gap-2.5" : "gap-2"}`}>
      <div
        className={`relative rounded-full bg-linear-to-br from-cyan-200 via-sky-400 to-blue-600 border-2 border-white shrink-0 ${
          isMd
            ? "w-7 h-7 sm:w-8 sm:h-8 shadow-[0_0_12px_rgba(56,189,248,0.85)]"
            : "w-4 h-4 sm:w-4.5 sm:h-4.5 shadow-[0_0_8px_rgba(56,189,248,0.85)]"
        }`}
      >
        <span
          className={`absolute rounded-full bg-white/85 ${
            isMd ? "top-1 left-1 w-1.5 h-1.5" : "top-0.5 left-0.5 w-1 h-1"
          }`}
        />
      </div>

      <div className={`flex items-center ${isMd ? "gap-1.5" : "gap-1"}`}>
        <span
          className={`${isMd ? "w-2 h-2 sm:w-2.5 sm:h-2.5" : "w-1.5 h-1.5"} rounded-full bg-red-300 ring-1 ring-[#7f0417]/60`}
        />
        <span
          className={`${isMd ? "w-2 h-2 sm:w-2.5 sm:h-2.5" : "w-1.5 h-1.5"} rounded-full bg-amber-300 ring-1 ring-[#7f0417]/60`}
        />
        <span
          className={`${isMd ? "w-2 h-2 sm:w-2.5 sm:h-2.5" : "w-1.5 h-1.5"} rounded-full bg-emerald-300 ring-1 ring-[#7f0417]/60`}
        />
      </div>
    </div>
  );
}
