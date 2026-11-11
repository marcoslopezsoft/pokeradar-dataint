"use client";

import React, { useMemo, useRef } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  X,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Radar,
} from "lucide-react";
import { PokemonRadarEntity } from "@/types/pokemon";
import { TypeBadge } from "../pokemon/type-badge";
import { buildTeamTacticalDiagnosis } from "@/lib/team-analysis";
import { translateTypeToSpanish } from "@/lib/utils";
import { PokedexSensorCluster } from "@/components/ui/pokedex-sensors";
import { resolvePokemonTypeThemes } from "@/lib/type-themes";
import { PokedexSteppedBackdrop } from "@/components/ui/pokedex-stepped-backdrop";

interface TeamAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  party: PokemonRadarEntity[];
}

interface PokedexLcdContentProps {
  party: PokemonRadarEntity[];
  diagnosis: ReturnType<typeof buildTeamTacticalDiagnosis>;
}

const HARD_WHITE_TEXT_SHADOW: React.CSSProperties = {
  textShadow: "1px 1px 0 rgba(0, 0, 0, 0.4)",
};

/** Mounted only while modal is open so scrollRef attaches cleanly for useScroll. */
function PokedexLcdContent({
  party,
  diagnosis,
}: PokedexLcdContentProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 30,
    restDelta: 0.001,
  });
  const bannerScale = useTransform(smoothProgress, [0, 0.28], [1, 0.975]);
  const bannerOpacity = useTransform(smoothProgress, [0, 0.35], [1, 0.88]);

  const statTelemetry = [
    {
      label: "HP prom.",
      value: diagnosis.avgStats.hp,
      pct: Math.min(100, Math.round((diagnosis.avgStats.hp / 140) * 100)),
      barClass: "bg-emerald-500",
      textClass: "text-emerald-700",
    },
    {
      label: "ATQ prom.",
      value: diagnosis.avgStats.attack,
      pct: Math.min(100, Math.round((diagnosis.avgStats.attack / 140) * 100)),
      barClass: "bg-amber-500",
      textClass: "text-amber-700",
    },
    {
      label: "DEF prom.",
      value: diagnosis.avgStats.defense,
      pct: Math.min(100, Math.round((diagnosis.avgStats.defense / 140) * 100)),
      barClass: "bg-sky-500",
      textClass: "text-sky-700",
    },
    {
      label: "VEL prom.",
      value: diagnosis.avgStats.speed,
      pct: Math.min(100, Math.round((diagnosis.avgStats.speed / 140) * 100)),
      barClass: "bg-indigo-500",
      textClass: "text-indigo-700",
    },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-slate-50 border-2 border-[#7f0417]/60 shadow-inner overflow-hidden">
      {/* Scrollable LCD Viewport */}
      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 space-y-5 bg-slate-50"
      >
        {party.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-600 font-sans text-sm space-y-2">
            <p className="font-bold text-slate-900">
              Tu equipo de expedición está vacío.
            </p>
            <p className="text-xs text-slate-500">
              Seleccioná especímenes en el radar y pulsá &quot;Reclutar al Equipo&quot;.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Executive Narrative Card: #28A7F6 Pokédex Blue + Pokéball Watermark + White Text */}
            <motion.div
              style={{ scale: bannerScale, opacity: bannerOpacity }}
              className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-[#28A7F6] text-white space-y-3"
            >
              {/* Subtle Pokéball Watermark in Corner */}
              <svg
                viewBox="0 0 100 100"
                className="absolute -right-6 -bottom-6 w-32 h-32 text-white/25 pointer-events-none"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 10c19.9 0 36.3 14.7 39.4 34H66.2C63.6 34.6 57.4 30 50 30s-13.6 4.6-16.2 14H10.6C13.7 24.7 30.1 10 50 10zm0 80c-19.9 0-36.3-14.7-39.4-34h23.2C36.4 65.4 42.6 70 50 70s13.6-4.6 16.2-14h23.2c-3.1 19.3-19.5 34-39.4 34zm0-50c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10z" />
              </svg>

              <div className="relative z-10 flex items-center justify-between gap-2">
                <span
                  style={HARD_WHITE_TEXT_SHADOW}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider"
                >
                  <Radar
                    style={{ filter: "drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.4))" }}
                    className="w-3.5 h-3.5 text-white"
                  />
                  {diagnosis.memberCount > 1
                    ? "Evaluación Conjunta del Equipo"
                    : "Evaluación Inicial"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[11px] font-extrabold tabular-nums">
                  {diagnosis.avgStats.total} puntos promedio
                </span>
              </div>

              <p
                style={HARD_WHITE_TEXT_SHADOW}
                className="relative z-10 text-xs sm:text-[13px] leading-5 text-white font-semibold"
              >
                {diagnosis.executiveSummary}
              </p>

              {diagnosis.synergyNotes.length > 0 && (
                <ul
                  style={HARD_WHITE_TEXT_SHADOW}
                  className="relative z-10 space-y-1.5 pt-2"
                >
                  {diagnosis.synergyNotes.map((note, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-[11px] sm:text-xs text-white font-medium leading-4.5 px-1 py-0.5"
                    >
                      <span
                        style={{ boxShadow: "1px 1px 0 rgba(0, 0, 0, 0.4)" }}
                        className="w-1.5 h-1.5 rounded-full bg-white shrink-0 mt-1.5"
                      />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>

            {/* 2. Key Pokédex Hardware Telemetry Metrics (clean borderless & fill-less) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans px-1">
              <div className="p-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Miembros
                </div>
                <div className="text-sky-700 font-extrabold text-base mt-0.5 tabular-nums">
                  {diagnosis.memberCount} / 6
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-sky-200/70 overflow-hidden">
                  <div
                    className="h-full bg-[#28A7F6] rounded-full"
                    style={{ width: `${(diagnosis.memberCount / 6) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Nivel Prom.
                </div>
                <div className="text-amber-600 font-extrabold text-base mt-0.5 tabular-nums">
                  Nv. {diagnosis.avgLevel}
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-amber-200/70 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, (diagnosis.avgLevel / 50) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Cobertura
                </div>
                <div className="text-emerald-700 font-extrabold text-base mt-0.5 tabular-nums">
                  {diagnosis.offensiveCoverageTypes.length} / 18 tipos
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-emerald-200/70 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${Math.round((diagnosis.offensiveCoverageTypes.length / 18) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Prom. Base
                </div>
                <div className="text-indigo-700 font-extrabold text-base mt-0.5 tabular-nums">
                  {diagnosis.avgStats.total} pts
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-indigo-200/70 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round((diagnosis.avgStats.total / 600) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Clean Borderless Team Stat Telemetry Display */}
            <div className="grid grid-cols-4 gap-3 px-1 py-1 text-center text-[11px]">
              {statTelemetry.map((stat) => (
                <div key={stat.label} className="p-2">
                  <div className="text-slate-500 font-semibold text-[10px]">
                    {stat.label}
                  </div>
                  <div className={`font-extrabold text-xs sm:text-sm mt-0.5 tabular-nums ${stat.textClass}`}>
                    {stat.value}
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stat.barClass}`}
                      style={{ width: `${stat.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 3. Strengths & Weaknesses (clean bordered containers) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Defensive Resistances */}
              <div className="p-3.5 rounded-2xl border border-emerald-300/85 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {diagnosis.memberCount > 1
                      ? "Resistencias del Equipo"
                      : "Resistencias del Pokémon"}
                  </span>
                </div>
                {diagnosis.defensiveStrengths.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {diagnosis.defensiveStrengths.map((s) => (
                      <span
                        key={s.type}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/75 text-[11px] font-semibold text-emerald-900"
                      >
                        {translateTypeToSpanish(s.type)}
                        {diagnosis.memberCount > 1 && (
                          <span className="text-[10px] text-emerald-700 font-bold">
                            ({s.resistCount}/{diagnosis.memberCount})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Sin resistencias grupales destacadas aún.
                  </p>
                )}
              </div>

              {/* Critical Weaknesses */}
              <div className="p-3.5 rounded-2xl border border-amber-300/85 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>
                    {diagnosis.memberCount > 1
                      ? "Debilidades Críticas del Equipo"
                      : "Debilidades Directas"}
                  </span>
                </div>
                {diagnosis.criticalWeaknesses.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {diagnosis.criticalWeaknesses.map((w) => (
                      <span
                        key={w.type}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100/80 text-[11px] font-semibold text-amber-950"
                      >
                        {translateTypeToSpanish(w.type)}
                        <span className="text-[10px] font-bold text-orange-600">
                          {diagnosis.memberCount > 1
                            ? `${w.weakCount}/${diagnosis.memberCount}`
                            : `×${w.maxMultiplier}`}
                        </span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Cobertura defensiva muy bien compensada.
                  </p>
                )}
              </div>
            </div>

            {/* 4. Detailed Breakdown of EVERY Selected Pokemon (bordered outer & item containers) */}
            <div className="p-3.5 rounded-2xl border border-slate-300/85 space-y-3">
              <div className="flex items-center justify-between text-xs font-sans px-0.5">
                <span className="font-extrabold uppercase tracking-wider text-slate-800">
                  Integrantes del Escuadrón
                </span>
                <span className="text-[11px] font-bold text-sky-700">
                  {diagnosis.uniqueElementalTypes.length} tipos propios
                </span>
              </div>

              <div className="space-y-2.5">
                {diagnosis.members.map((member, index) => {
                  const { pokemon } = member;
                  const { primary, secondary } = resolvePokemonTypeThemes(pokemon.types);
                  return (
                    <motion.div
                      key={pokemon.id}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, root: scrollRef, amount: 0.12 }}
                      transition={{
                        duration: 0.28,
                        delay: Math.min(index * 0.04, 0.16),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="p-3.5 rounded-xl border border-slate-200 space-y-2.5"
                    >
                      <div className="flex items-start gap-3">
                        {/* Sprite tile featuring Pokémon's own elemental type colors (half-and-half stepped SVG when dual-type) */}
                        <div className="relative w-13 h-13 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                          <PokedexSteppedBackdrop
                            primary={primary}
                            secondary={secondary}
                            seamOpacity={0.85}
                            seamWidth={2}
                          />
                          <Image
                            src={pokemon.animatedSprite || pokemon.sprite}
                            alt={pokemon.displayName}
                            width={42}
                            height={42}
                            unoptimized
                            className="relative z-10 w-10.5 h-10.5 object-contain drop-shadow-xs"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-extrabold text-sm text-slate-900 truncate">
                                {pokemon.displayName}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-300/85 text-amber-950 text-[10px] font-extrabold tabular-nums">
                                Nv. {pokemon.level}
                              </span>
                            </div>
                            <span
                              style={HARD_WHITE_TEXT_SHADOW}
                              className="px-2.5 py-0.5 rounded-lg bg-[#28A7F6] text-white text-[10px] font-bold"
                            >
                              {member.roleLabel}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {pokemon.types.map((t) => (
                              <TypeBadge key={t} type={t} size="sm" />
                            ))}
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 ml-1">
                              <MapPin className="w-3 h-3 text-[#28A7F6] shrink-0" />
                              {pokemon.biomeName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Individual tactical description */}
                      <p className="text-[11px] sm:text-xs leading-relaxed text-slate-700 pl-1">
                        {member.summaryText}
                      </p>

                      {/* Clean borderless stat row */}
                      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center text-[10px] font-sans pt-1">
                        <div className="py-1 whitespace-nowrap">
                          <span className="text-emerald-700 font-semibold">HP: </span>
                          <span className="font-extrabold text-slate-900 tabular-nums">
                            {pokemon.stats.hp ?? 0}
                          </span>
                        </div>
                        <div className="py-1 whitespace-nowrap">
                          <span className="text-amber-700 font-semibold">ATQ: </span>
                          <span className="font-extrabold text-slate-900 tabular-nums">
                            {pokemon.stats.attack ?? 0}
                          </span>
                        </div>
                        <div className="py-1 whitespace-nowrap">
                          <span className="text-sky-700 font-semibold">DEF: </span>
                          <span className="font-extrabold text-slate-900 tabular-nums">
                            {pokemon.stats.defense ?? 0}
                          </span>
                        </div>
                        <div className="py-1 whitespace-nowrap">
                          <span className="text-indigo-700 font-semibold">VEL: </span>
                          <span className="font-extrabold text-slate-900 tabular-nums">
                            {pokemon.stats.speed ?? 0}
                          </span>
                        </div>
                        <div
                          style={HARD_WHITE_TEXT_SHADOW}
                          className="py-1 px-1 rounded-lg bg-[#28A7F6] text-white whitespace-nowrap"
                        >
                          <span className="font-semibold">TOTAL: </span>
                          <span className="font-extrabold tabular-nums">
                            {member.totalStats}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function TeamAnalysisModal({
  isOpen,
  onClose,
  party,
}: TeamAnalysisModalProps) {
  const diagnosis = useMemo(() => buildTeamTacticalDiagnosis(party), [party]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/55 sm:bg-slate-900/40 sm:backdrop-blur-md"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col p-2.5 sm:p-3.5 rounded-3xl bg-linear-to-b from-[#dc0a2d] to-[#b00722] border-2 border-[#7f0417] shadow-2xl shadow-red-950/45 overflow-hidden"
          >
            {/* Top Pokédex Sensor & Telemetry Header */}
            <div className="flex items-center justify-between gap-3 px-1 pb-2.5 sm:pb-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <PokedexSensorCluster size="md" />
                <div className="min-w-0">
                  <h3 className="font-sans text-xs sm:text-sm font-extrabold text-white tracking-wider uppercase drop-shadow-xs truncate">
                    DIAGNÓSTICO TÁCTICO DE EXPEDICIÓN
                  </h3>
                  <p className="font-sans text-[10px] sm:text-[11px] text-white/85 font-medium truncate">
                    {diagnosis.memberCount > 1
                      ? `Análisis grupal de ${diagnosis.memberCount} Pokémon y detalle individual`
                      : diagnosis.memberCount === 1
                        ? "Evaluación individual del primer integrante y proyección"
                        : "Estado actual del escuadrón de campo"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center gap-1" aria-hidden="true">
                  <span className="w-3 h-1 rounded-full bg-[#7f0417]/75" />
                  <span className="w-3 h-1 rounded-full bg-[#7f0417]/75" />
                </div>
                <button
                  onClick={onClose}
                  aria-label="Cerrar diagnóstico táctico"
                  className="p-1.5 rounded-xl bg-[#7f0417]/45 hover:bg-[#7f0417]/75 text-white border border-white/20 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <PokedexLcdContent
              party={party}
              diagnosis={diagnosis}
            />

            {/* Bottom Pokédex Hardware Rim */}
            <div className="flex items-center justify-between px-1.5 pt-2 shrink-0" aria-hidden="true">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#7f0417]/70" />
                <span className="w-6 h-1 rounded-full bg-[#7f0417]/70" />
              </div>
              <span className="text-[9px] font-extrabold tracking-widest uppercase text-white/80">
                POKÉDEX GEO · MÓDULO TÁCTICO
              </span>
              <div className="flex items-center gap-1">
                <span className="w-4 h-1 rounded-full bg-[#7f0417]/70" />
                <span className="w-4 h-1 rounded-full bg-[#7f0417]/70" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
