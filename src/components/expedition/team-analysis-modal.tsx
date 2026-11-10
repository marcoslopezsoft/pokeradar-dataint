"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Swords, Zap, Heart, Award, Copy, Check } from "lucide-react";
import { PokemonRadarEntity } from "@/types/pokemon";
import { TypeBadge } from "../pokemon/type-badge";

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

  if (!isOpen) return null;

  // Compute coverage of types
  const coveredTypes = Array.from(
    new Set(party.flatMap((p) => p.types))
  );

  const avgLevel =
    party.length > 0
      ? Math.round(party.reduce((acc, p) => acc + p.level, 0) / party.length)
      : 0;

  // Best stats in party
  const topHp = party.reduce(
    (max, p) => ((p.stats.hp || 0) > (max.stats.hp || 0) ? p : max),
    party[0]
  );
  const topAtk = party.reduce(
    (max, p) => ((p.stats.attack || 0) > (max.stats.attack || 0) ? p : max),
    party[0]
  );
  const topSpeed = party.reduce(
    (max, p) => ((p.stats.speed || 0) > (max.stats.speed || 0) ? p : max),
    party[0]
  );

  const handleCopySummary = () => {
    const list = party
      .map((p, i) => `${i + 1}. ${p.displayName} (Nv. ${p.level}) - ${p.types.join("/")}`)
      .join("\n");

    const text = `🔴 EQUIPO DE EXPEDICIÓN POKÉRADAR (DATAINT) ⚡\n\n${list}\n\n📊 Cobertura: ${coveredTypes.length} tipos elementales | Nivel Promedio: Nv. ${avgLevel}\n🛰️ Explorado en PokéRadar Geoespacial`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl shadow-slate-400/30 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-red-600/80 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-red-600" />
              <h3 className="font-sans text-base font-bold text-slate-800 tracking-wide">
                DIAGNÓSTICO TÁCTICO DE EXPEDICIÓN
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {party.length === 0 ? (
            <div className="py-8 text-center text-slate-500 font-sans text-sm space-y-2">
              <p>Tu equipo de expedición está vacío.</p>
              <p className="text-xs text-slate-400">
                Seleccioná especímenes en el radar y hacé clic en &quot;Reclutar al Equipo&quot;.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Metric Highlights */}
              <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Miembros:</span>
                  <span className="text-red-600 font-bold text-sm">
                    {party.length} / 6
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Nivel Promedio:</span>
                  <span className="text-amber-600 font-bold text-sm">
                    Nv. {avgLevel}
                  </span>
                </div>
              </div>

              {/* Elemental Coverage */}
              <div className="space-y-2">
                <div className="text-xs font-sans text-slate-600 flex items-center justify-between">
                  <span className="font-semibold">COBERTURA ELEMENTAL ({coveredTypes.length} tipos)</span>
                  <span className="text-red-600 font-semibold">
                    {Math.round((coveredTypes.length / 18) * 100)}% Global
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  {coveredTypes.map((t) => (
                    <TypeBadge key={t} type={t} size="sm" />
                  ))}
                </div>
              </div>

              {/* Top Performers */}
              <div className="space-y-2">
                <div className="text-xs font-sans font-semibold text-slate-600">
                  ESPECIALISTAS DE CAMPO
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] font-sans">
                  {topHp && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                      <Heart className="w-3.5 h-3.5 mx-auto text-emerald-600" />
                      <div className="text-slate-700 truncate font-semibold">
                        {topHp.displayName}
                      </div>
                      <div className="text-emerald-600 font-bold">
                        {topHp.stats.hp} HP
                      </div>
                    </div>
                  )}

                  {topAtk && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                      <Swords className="w-3.5 h-3.5 mx-auto text-red-600" />
                      <div className="text-slate-700 truncate font-semibold">
                        {topAtk.displayName}
                      </div>
                      <div className="text-red-600 font-bold">
                        {topAtk.stats.attack} ATQ
                      </div>
                    </div>
                  )}

                  {topSpeed && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                      <Zap className="w-3.5 h-3.5 mx-auto text-amber-500" />
                      <div className="text-slate-700 truncate font-semibold">
                        {topSpeed.displayName}
                      </div>
                      <div className="text-amber-600 font-bold">
                        {topSpeed.stats.speed} VEL
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="border-t border-slate-200 pt-3 flex items-center justify-between gap-3">
            {party.length > 0 && (
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 font-sans text-xs font-semibold transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">¡Copiado al Portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copiar Ficha de Equipo</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-sans text-xs font-bold transition-all cursor-pointer ml-auto shadow-md shadow-red-600/30"
            >
              CERRAR DIAGNÓSTICO
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
