"use client";

import React, { useId } from "react";
import { TypeTheme } from "@/lib/type-themes";

interface PokedexSteppedBackdropProps {
  primary: TypeTheme;
  secondary?: TypeTheme | null;
  seamOpacity?: number;
  seamWidth?: number;
}

/** Stepped Pokédex diagonal dual-type SVG backdrop (falls back to smooth single-type gradient). */
export function PokedexSteppedBackdrop({
  primary,
  secondary = null,
  seamOpacity = 0.65,
  seamWidth = 3.5,
}: PokedexSteppedBackdropProps) {
  const uid = useId().replace(/:/g, "");
  const grad1Id = `poke-grad-1-${uid}`;
  const grad2Id = `poke-grad-2-${uid}`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      <defs>
        <linearGradient id={grad1Id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primary.from} />
          <stop offset="100%" stopColor={primary.to} />
        </linearGradient>
        {secondary && (
          <linearGradient id={grad2Id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={secondary.from} />
            <stop offset="100%" stopColor={secondary.to} />
          </linearGradient>
        )}
      </defs>

      {secondary ? (
        <>
          <rect x="0" y="0" width="100" height="100" fill={`url(#${grad2Id})`} />
          <polygon points="0,0 100,0 57,50 43,50 0,100" fill={`url(#${grad1Id})`} />
          <polyline
            points="0,100 43,50 57,50 100,0"
            fill="none"
            stroke={`rgba(255, 255, 255, ${seamOpacity})`}
            strokeWidth={seamWidth}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </>
      ) : (
        <rect x="0" y="0" width="100" height="100" fill={`url(#${grad1Id})`} />
      )}
    </svg>
  );
}
