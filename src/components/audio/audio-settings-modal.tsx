"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { sfx } from "@/lib/sound-effects";

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AudioSettingsModal({ isOpen, onClose }: AudioSettingsModalProps) {
  const [isMuted, setIsMuted] = useState(sfx.getIsMuted());
  const [isBgmPlaying, setIsBgmPlaying] = useState(sfx.getIsBgmPlaying());
  const [bgmVolume, setBgmVolume] = useState(sfx.getBgmVolume());
  const [sfxVolume, setSfxVolume] = useState(sfx.getSfxVolume());

  useEffect(() => {
    const unsubBgm = sfx.subscribeBgm((playing) => {
      setIsBgmPlaying(playing);
    });
    const unsubVol = sfx.subscribeVolume(() => {
      setIsMuted(sfx.getIsMuted());
      setBgmVolume(sfx.getBgmVolume());
      setSfxVolume(sfx.getSfxVolume());
    });
    return () => {
      unsubBgm();
      unsubVol();
    };
  }, []);

  const handleToggleMute = () => {
    const next = !isMuted;
    sfx.setMuted(next);
    setIsMuted(next);
    if (!next) {
      sfx.playButtonPress();
    }
  };

  const handleToggleBgm = () => {
    sfx.toggleBgm();
  };

  const handleBgmVolumeChange = (val: number) => {
    setBgmVolume(val);
    sfx.setBgmVolume(val);
  };

  const handleSfxVolumeChange = (val: number) => {
    setSfxVolume(val);
    sfx.setSfxVolume(val);
  };

  const handleTestSfx = () => {
    sfx.playCatchSuccess();
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
            className="fixed inset-0 bg-slate-900/50"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-red-50 text-red-600">
                  <Icon icon="solar:volume-loud-bold" width={20} height={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Ajustes de Sonido
                  </h3>
                  <p className="text-xs text-slate-500">
                    Música y efectos clásicos Pokémon
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sfx.playButtonPress();
                  onClose();
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label="Cerrar ajustes"
              >
                <Icon icon="solar:close-circle-bold" width={22} height={22} />
              </button>
            </div>

            {/* Master Mute Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Icon
                  icon={isMuted ? "solar:volume-cross-bold" : "solar:volume-loud-bold"}
                  width={18}
                  height={18}
                  className={isMuted ? "text-slate-400" : "text-red-600"}
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">Silenciar Todo</div>
                  <div className="text-[11px] text-slate-400">Desactiva todo el audio</div>
                </div>
              </div>

              <button
                onClick={handleToggleMute}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isMuted ? "bg-red-600" : "bg-slate-200"
                }`}
                role="switch"
                aria-checked={isMuted}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isMuted ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Background Music Section */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:music-note-bold"
                    width={16}
                    height={16}
                    className="text-red-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Tema Pokémon Rojo
                  </span>
                </div>

                <button
                  onClick={handleToggleBgm}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-colors ${
                    isBgmPlaying
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                >
                  {isBgmPlaying ? "PAUSAR" : "REPRODUCIR"}
                </button>
              </div>

              {/* BGM Volume Slider */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span>Volumen música</span>
                  <span>{Math.round(bgmVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={bgmVolume}
                  onChange={(e) => handleBgmVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            </div>

            {/* Sound Effects Section */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:gamepad-bold"
                    width={16}
                    height={16}
                    className="text-amber-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Efectos Clásicos (SFX)
                  </span>
                </div>

                <button
                  onClick={handleTestSfx}
                  className="px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold cursor-pointer transition-colors"
                  title="Reproducir fanfarria de captura"
                >
                  PROBAR
                </button>
              </div>

              {/* SFX Volume Slider */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span>Volumen efectos</span>
                  <span>{Math.round(sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={sfxVolume}
                  onChange={(e) => handleSfxVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
