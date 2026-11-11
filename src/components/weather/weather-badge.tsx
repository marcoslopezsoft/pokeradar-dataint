"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Wind,
  CloudLightning,
  Moon,
  MapPin,
  X,
} from "lucide-react";
import { Icon } from "@iconify/react";
import { fetchBiomeWeather, getWeatherBoostConfig } from "@/lib/pokeapi";
import { TYPE_CONFIG, TypeBadge } from "@/components/pokemon/type-badge";
import { sfx } from "@/lib/sound-effects";
import { WeatherData } from "@/types/pokemon";

interface WeatherBadgeProps {
  lat: number;
  lng: number;
  biomeName: string;
  initialWeather?: WeatherData | null;
}

function renderWeatherIcon(code: number, sizeClass: string) {
  if (code === 0 || code === 1) {
    return <Sun className={`${sizeClass} text-amber-500 shrink-0`} />;
  }
  if (code >= 61 && code <= 65) {
    return <CloudRain className={`${sizeClass} text-blue-500 shrink-0`} />;
  }
  if (code >= 71 && code <= 77) {
    return <CloudSnow className={`${sizeClass} text-cyan-400 shrink-0`} />;
  }
  if (code >= 95) {
    return <CloudLightning className={`${sizeClass} text-yellow-500 shrink-0`} />;
  }
  return <Cloud className={`${sizeClass} text-slate-400 shrink-0`} />;
}

function subscribeHydration(): () => void {
  return () => {};
}

export function WeatherBadge({
  lat,
  lng,
  biomeName,
  initialWeather = null,
}: WeatherBadgeProps) {
  const coordKey = `${lat},${lng}`;
  const isClient = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false
  );
  const [weatherState, setWeatherState] = useState<{
    key: string;
    data: WeatherData | null;
  } | null>(initialWeather ? { key: coordKey, data: initialWeather } : null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (initialWeather) return;
    let isMounted = true;

    fetchBiomeWeather(lat, lng)
      .then((data) => {
        if (isMounted) {
          setWeatherState({ key: coordKey, data });
        }
      })
      .catch(() => {
        if (isMounted) {
          setWeatherState({ key: coordKey, data: null });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [lat, lng, coordKey, initialWeather]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const weather =
    weatherState?.key === coordKey ? weatherState.data : initialWeather;
  const loading = weather === null && weatherState?.key !== coordKey;

  if (loading) {
    return (
      <div className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-xl bg-slate-100/90 border border-slate-200 text-[11px] text-slate-400 animate-pulse font-sans">
        <Wind className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="hidden sm:inline">...</span>
      </div>
    );
  }

  if (!weather) return null;

  const boostConfig = getWeatherBoostConfig(weather.weatherCode);

  const weatherModal = isClient
    ? createPortal(
          <AnimatePresence>
            {isModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="weather-modal-title"
              >
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsModalOpen(false)}
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
                />

                {/* Modal Container */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 15 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="relative w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 z-10 space-y-4 font-sans"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2.5 rounded-2xl bg-sky-50 border border-sky-100 shrink-0">
                        {renderWeatherIcon(weather.weatherCode, "w-6 h-6")}
                      </div>
                      <div className="min-w-0">
                        <h3
                          id="weather-modal-title"
                          className="text-base font-bold text-slate-900 leading-tight"
                        >
                          Clima y Afinidad
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                          <span className="truncate">{biomeName}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sfx.playButtonPress();
                        setIsModalOpen(false);
                      }}
                      aria-label="Cerrar detalle climático"
                      className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer touch-manipulation shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Current Weather Summary */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-2xl font-extrabold text-slate-900 tabular-nums leading-none">
                          {weather.temperature}°C
                        </div>
                        <div className="text-xs font-semibold text-slate-600 mt-1">
                          {weather.conditionDescription}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-[11px] font-medium text-slate-600">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-slate-200">
                          <Wind className="w-3 h-3 text-sky-500" />
                          <span className="tabular-nums">{weather.windSpeed} km/h</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-slate-200">
                          {weather.isDay ? (
                            <>
                              <Sun className="w-3 h-3 text-amber-500" />
                              <span>Día</span>
                            </>
                          ) : (
                            <>
                              <Moon className="w-3 h-3 text-indigo-500" />
                              <span>Noche</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active Climatic Affinity */}
                  <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <Icon icon="solar:cloud-sun-2-bold" width={15} height={15} />
                        Afinidad Climática Activa
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-[10px] font-bold text-emerald-700 shrink-0">
                        {boostConfig.shortLabel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {boostConfig.reason}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {boostConfig.boostedTypes.map((typeName) => (
                        <TypeBadge
                          key={typeName}
                          type={typeName}
                          size="sm"
                          showIcon={true}
                        />
                      ))}
                    </div>

                    <p className="text-[11px] text-emerald-800/80 leading-snug pt-0.5">
                      Las especies de estos tipos en {biomeName} aparecen con la insignia de Afinidad Climática en el radar y su ficha técnica.
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )
    : null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          sfx.playButtonPress();
          setIsModalOpen(true);
        }}
        aria-label={`Ver clima y afinidad climática de ${biomeName}: ${weather.temperature}°C, ${weather.conditionDescription}`}
        className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-100 sm:bg-white/90 border border-slate-200/90 hover:border-sky-300 hover:bg-sky-50/60 active:scale-95 transition-all shadow-2xs text-[11px] sm:text-xs font-sans font-medium shrink-0 cursor-pointer touch-manipulation"
      >
        <span
          className="flex items-center gap-1 sm:gap-1.5"
          title={`${weather.conditionDescription} · ${weather.temperature}°C · Viento: ${weather.windSpeed} km/h · ${biomeName} · ${boostConfig.reason}`}
        >
          <span className="flex items-center justify-center shrink-0">
            {renderWeatherIcon(
              weather.weatherCode,
              "w-3.5 h-3.5 sm:w-4 sm:h-4"
            )}
          </span>
          <span className="flex items-center gap-1 leading-tight">
            <span className="font-bold text-slate-800 text-[11px] sm:text-xs">
              {weather.temperature}°C
            </span>
            <span className="hidden sm:inline text-slate-500 text-[10px]">
              · {weather.conditionDescription}
            </span>
          </span>
        </span>

        <span className="hidden lg:flex items-center gap-1 pl-1.5 border-l border-slate-200/90">
          {boostConfig.boostedTypes.slice(0, 3).map((t) => {
            const cfg = TYPE_CONFIG[t];
            if (!cfg) return null;
            return (
              <span key={t} className="relative flex items-center group/boost">
                <span
                  aria-label={`Tipo ${cfg.label} favorecido por el clima`}
                  className={`inline-flex items-center justify-center w-4.5 h-4.5 rounded-full border transition-transform duration-150 group-hover/boost:scale-110 ${cfg.bg} ${cfg.border}`}
                >
                  <Icon icon={cfg.icon} width={10} height={10} className={cfg.text} />
                </span>

                {/* Instant hover tooltip naming the boosted elemental type */}
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-lg bg-slate-900/95 text-white text-[10px] font-medium shadow-md border border-slate-700/50 hidden group-hover/boost:flex items-center gap-1.5 whitespace-nowrap z-50 pointer-events-none">
                  <span
                    className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full shrink-0 ${cfg.bg}`}
                  >
                    <Icon icon={cfg.icon} width={9} height={9} className={cfg.text} />
                  </span>
                  <span>
                    <strong className="font-bold">Tipo {cfg.label}</strong>
                    <span className="text-slate-300"> · Potenciado por clima</span>
                  </span>
                </span>
              </span>
            );
          })}
        </span>
      </button>

      {weatherModal}
    </>
  );
}
