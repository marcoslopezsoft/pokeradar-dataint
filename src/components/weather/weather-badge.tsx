"use client";

import React, { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudSnow, Sun, Wind, CloudLightning } from "lucide-react";
import { fetchBiomeWeather } from "@/lib/pokeapi";
import { WeatherData } from "@/types/pokemon";

interface WeatherBadgeProps {
  lat: number;
  lng: number;
  biomeName: string;
}

export function WeatherBadge({ lat, lng, biomeName }: WeatherBadgeProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchBiomeWeather(lat, lng)
      .then((data) => {
        if (isMounted) {
          setWeather(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lat, lng]);

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />;
    if (code >= 61 && code <= 65) return <CloudRain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />;
    if (code >= 71 && code <= 77) return <CloudSnow className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />;
    if (code >= 95) return <CloudLightning className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 shrink-0" />;
    return <Cloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-xl bg-slate-100/90 border border-slate-200 text-[11px] text-slate-400 animate-pulse font-sans">
        <Wind className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="hidden sm:inline">...</span>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div
      className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-100 sm:bg-white/90 sm:backdrop-blur-md border border-slate-200/90 shadow-2xs text-[11px] sm:text-xs font-sans font-medium shrink-0"
      title={`${weather.conditionDescription} · ${weather.temperature}°C · Viento: ${weather.windSpeed} km/h · ${biomeName}`}
    >
      <div className="flex items-center justify-center shrink-0">
        {getWeatherIcon(weather.weatherCode)}
      </div>
      <div className="flex items-center gap-1 leading-tight">
        <span className="font-bold text-slate-800 text-[11px] sm:text-xs">
          {weather.temperature}°C
        </span>
        <span className="hidden sm:inline text-slate-500 text-[10px]">
          · {weather.conditionDescription}
        </span>
        <span className="hidden md:inline text-slate-400 text-[10px]">
          · {weather.windSpeed} km/h
        </span>
      </div>
    </div>
  );
}
