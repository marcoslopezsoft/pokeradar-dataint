"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { PokemonRadarEntity } from "@/types/pokemon";
import { TypeBadge } from "../pokemon/type-badge";
import { buildTeamTacticalDiagnosis } from "@/lib/team-analysis";
import { translateTypeToSpanish } from "@/lib/utils";

interface TeamAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  party: PokemonRadarEntity[];
}

export function TeamAnalysisModal({
  isOpen,
  onClose,
  party,
}: TeamAnalysisModalProps) {
  const [copied, setCopied] = useState(false);

  const diagnosis = useMemo(() => buildTeamTacticalDiagnosis(party), [party]);

  const handleCopySummary = () => {
    const list = diagnosis.members
      .map(
        (m, i) =>
          `${i + 1}. ${m.pokemon.displayName} (Nv. ${m.pokemon.level} · ${m.roleLabel}) - ${m.pokemon.types
            .map(translateTypeToSpanish)
            .join("/")} [${m.totalStats} pts]`
      )
      .join("\n");

    const weakLine =
      diagnosis.criticalWeaknesses.length > 0
        ? `⚠️ Debilidades a vigilar: ${diagnosis.criticalWeaknesses
            .slice(0, 4)
            .map(
              (w) =>
                `${translateTypeToSpanish(w.type)} (${w.weakCount}/${diagnosis.memberCount})`
            )
            .join(", ")}`
        : "🛡️ Sin debilidades grupales críticas";

    const text =
      `🔴 EQUIPO DE EXPEDICIÓN POKÉRADAR (DATAINT) ⚡\n\n` +
      `${list}\n\n` +
      `📋 ${diagnosis.executiveSummary}\n` +
      `📊 Cobertura ofensiva: ${diagnosis.offensiveCoverageTypes.length}/18 tipos | Nivel Promedio: Nv. ${diagnosis.avgLevel}\n` +
      `${weakLine}\n` +
      `🛰️ Explorado en PokéRadar Geoespacial`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/20 overflow-hidden"
          >
            {/* Header (clean title without side icon) */}
            <div className="flex items-center justify-between border-b-2 border-red-600/80 px-5 sm:px-6 py-4 shrink-0 bg-white">
              <div>
                <h3 className="font-sans text-sm sm:text-base font-extrabold text-slate-900 tracking-wide">
                  DIAGNÓSTICO TÁCTICO DE EXPEDICIÓN
                </h3>
                <p className="font-sans text-[11px] text-slate-500 mt-0.5">
                  {diagnosis.memberCount > 1
                    ? `Análisis grupal de ${diagnosis.memberCount} Pokémon y detalle individual`
                    : diagnosis.memberCount === 1
                      ? 'Evaluación individual del primer integrante y proyección de equipo'
                      : 'Estado actual del escuadrón de campo'}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar diagnóstico táctico"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 py-4 space-y-5">
              {party.length === 0 ? (
                <div className="py-10 text-center text-slate-500 font-sans text-sm space-y-2">
                  <p className="font-semibold text-slate-700">
                    Tu equipo de expedición está vacío.
                  </p>
                  <p className="text-xs text-slate-400">
                    Seleccioná especímenes en el radar y pulsá &quot;Reclutar al
                    Equipo&quot;.
                  </p>
                </div>
              ) : (
                <>
                  {/* 1. Executive Narrative (Team-wide analysis when >1, solo breakdown when 1) */}
                  <div className="p-4 rounded-2xl bg-linear-to-br from-slate-50 to-red-50/40 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                        {diagnosis.memberCount > 1
                          ? 'Evaluación Conjunta del Equipo'
                          : 'Evaluación Inicial'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {diagnosis.avgStats.total} pts base prom.
                      </span>
                    </div>
                    <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 font-medium">
                      {diagnosis.executiveSummary}
                    </p>
                    {diagnosis.synergyNotes.length > 0 && (
                      <ul className="space-y-1.5 pt-1 border-t border-slate-200/70">
                        {diagnosis.synergyNotes.map((note, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-600 leading-snug"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* 2. Key Metrics & Team Stat Averages */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-sans">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Miembros
                      </div>
                      <div className="text-red-600 font-extrabold text-base mt-0.5">
                        {diagnosis.memberCount} / 6
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Nivel Prom.
                      </div>
                      <div className="text-amber-600 font-extrabold text-base mt-0.5">
                        Nv. {diagnosis.avgLevel}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Cobertura
                      </div>
                      <div className="text-emerald-600 font-extrabold text-base mt-0.5">
                        {diagnosis.offensiveCoverageTypes.length} / 18 tipos
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Prom. Base
                      </div>
                      <div className="text-slate-800 font-extrabold text-base mt-0.5">
                        {diagnosis.avgStats.total} pts
                      </div>
                    </div>
                  </div>

                  {/* Team Stat Balance Bar */}
                  <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-[11px]">
                    <div>
                      <div className="text-slate-400 font-medium">HP prom.</div>
                      <div className="font-bold text-emerald-600 text-xs mt-0.5">
                        {diagnosis.avgStats.hp}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">
                        ATQ prom.
                      </div>
                      <div className="font-bold text-red-600 text-xs mt-0.5">
                        {diagnosis.avgStats.attack}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">
                        DEF prom.
                      </div>
                      <div className="font-bold text-blue-600 text-xs mt-0.5">
                        {diagnosis.avgStats.defense}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">
                        VEL prom.
                      </div>
                      <div className="font-bold text-amber-600 text-xs mt-0.5">
                        {diagnosis.avgStats.speed}
                      </div>
                    </div>
                  </div>

                  {/* 3. Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Defensive Resistances / Offensive Presence */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>
                          {diagnosis.memberCount > 1
                            ? 'Resistencias del Equipo'
                            : 'Resistencias del Pokémon'}
                        </span>
                      </div>
                      {diagnosis.defensiveStrengths.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {diagnosis.defensiveStrengths.map((s) => (
                            <span
                              key={s.type}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-[11px] font-semibold text-emerald-800"
                            >
                              {translateTypeToSpanish(s.type)}
                              {diagnosis.memberCount > 1 && (
                                <span className="text-[10px] text-emerald-600">
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
                    <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/70 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>
                          {diagnosis.memberCount > 1
                            ? 'Debilidades Críticas del Equipo'
                            : 'Debilidades Directas'}
                        </span>
                      </div>
                      {diagnosis.criticalWeaknesses.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {diagnosis.criticalWeaknesses.map((w) => (
                            <span
                              key={w.type}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-rose-200 text-[11px] font-semibold text-rose-800"
                            >
                              {translateTypeToSpanish(w.type)}
                              <span className="text-[10px] font-bold text-rose-600">
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

                  {/* 4. Detailed Breakdown of EVERY Selected Pokemon */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="font-bold uppercase tracking-wider text-slate-600">
                        Detalle de Integrantes Seleccionados (
                        {diagnosis.memberCount})
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {diagnosis.uniqueElementalTypes.length} tipos propios
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {diagnosis.members.map((member) => {
                        const { pokemon } = member;
                        return (
                          <div
                            key={pokemon.id}
                            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                <img
                                  src={pokemon.animatedSprite || pokemon.sprite}
                                  alt={pokemon.displayName}
                                  className="w-10 h-10 object-contain"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center justify-between gap-1.5">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-bold text-sm text-slate-900 truncate">
                                      {pokemon.displayName}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold tabular-nums">
                                      Nv. {pokemon.level}
                                    </span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-white text-[10px] font-semibold">
                                    {member.roleLabel}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                  {pokemon.types.map((t) => (
                                    <TypeBadge key={t} type={t} size="sm" />
                                  ))}
                                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 ml-1">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                    {pokemon.biomeName}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Individual tactical description */}
                            <p className="text-[11px] sm:text-xs leading-relaxed text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200/70">
                              {member.summaryText}
                            </p>

                            {/* Compact stat strip */}
                            <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-sans">
                              <div className="py-1 rounded-lg bg-white border border-slate-200/70">
                                <span className="text-slate-400">HP </span>
                                <span className="font-bold text-slate-800">
                                  {pokemon.stats.hp ?? 0}
                                </span>
                              </div>
                              <div className="py-1 rounded-lg bg-white border border-slate-200/70">
                                <span className="text-slate-400">ATQ </span>
                                <span className="font-bold text-slate-800">
                                  {pokemon.stats.attack ?? 0}
                                </span>
                              </div>
                              <div className="py-1 rounded-lg bg-white border border-slate-200/70">
                                <span className="text-slate-400">DEF </span>
                                <span className="font-bold text-slate-800">
                                  {pokemon.stats.defense ?? 0}
                                </span>
                              </div>
                              <div className="py-1 rounded-lg bg-white border border-slate-200/70">
                                <span className="text-slate-400">VEL </span>
                                <span className="font-bold text-slate-800">
                                  {pokemon.stats.speed ?? 0}
                                </span>
                              </div>
                              <div className="py-1 rounded-lg bg-red-50 border border-red-200/70">
                                <span className="text-red-500 font-semibold">
                                  TOT{' '}
                                </span>
                                <span className="font-bold text-red-700">
                                  {member.totalStats}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-200 px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3 shrink-0 bg-white">
              {party.length > 0 && (
                <button
                  onClick={handleCopySummary}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 font-sans text-xs font-semibold transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copiar Ficha</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-sans text-xs font-bold transition-all cursor-pointer ml-auto shadow-md shadow-red-600/30"
              >
                CERRAR DIAGNÓSTICO
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
