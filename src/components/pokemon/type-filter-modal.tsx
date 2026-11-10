"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { sfx } from "@/lib/sound-effects";
import { TypeBadge } from "./type-badge";
import { translateTypeToSpanish } from "@/lib/utils";

interface TypeFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedType: string;
  onSelectType: (type: string) => void;
}

const ALL_TYPES = [
  "water",
  "fire",
  "grass",
  "electric",
  "ice",
  "rock",
  "ground",
  "flying",
  "dragon",
  "normal",
  "fighting",
  "poison",
  "psychic",
  "bug",
  "ghost",
  "steel",
  "fairy",
  "dark",
];

export function TypeFilterModal({
  isOpen,
  onClose,
  selectedType,
  onSelectType,
}: TypeFilterModalProps) {
  const handleSelect = (type: string) => {
    sfx.playButtonPress();
    onSelectType(type);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4 max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-amber-50 text-amber-600">
                  <Icon icon="solar:filter-bold" width={20} height={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Filtrar por Tipo Elemental
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selecciona un tipo para enfocar el radar
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sfx.playButtonPress();
                  onClose();
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label="Cerrar filtro"
              >
                <Icon icon="solar:close-circle-bold" width={22} height={22} />
              </button>
            </div>

            {/* "Todos los tipos" button */}
            <div className="shrink-0 pt-1">
              <button
                onClick={() => handleSelect("all")}
                className={`w-full py-2.5 px-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  selectedType === "all"
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.01]"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon icon="solar:globus-bold" width={18} height={18} />
                  <span className="text-xs font-bold tracking-wide">
                    TODOS LOS TIPOS (Sin filtro)
                  </span>
                </div>
                {selectedType === "all" && (
                  <Icon icon="solar:check-circle-bold" width={18} height={18} className="text-emerald-400" />
                )}
              </button>
            </div>

            {/* Grid of 18 Types */}
            <div className="overflow-y-auto no-scrollbar pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5 py-1 flex-1">
              {ALL_TYPES.map((type) => {
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    onClick={() => handleSelect(type)}
                    className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02] ring-2 ring-red-500 ring-offset-2"
                        : "bg-slate-50/80 hover:bg-white hover:border-slate-300 text-slate-700 border-slate-200/90 shadow-xs"
                    }`}
                  >
                    <TypeBadge type={type} size="sm" showIcon={true} />
                    {isSelected && (
                      <Icon
                        icon="solar:check-circle-bold"
                        width={16}
                        height={16}
                        className="text-emerald-400 shrink-0 ml-1"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
