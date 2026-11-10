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
    if (code === 0 || code === 1) return <Sun className="w-4 h-4 text-amber-400" />;
    if (code >= 61 && code <= 65) return <CloudRain className="w-4 h-4 text-blue-400" />;
    if (code >= 71 && code <= 77) return <CloudSnow className="w-4 h-4 text-cyan-200" />;
    if (code >= 95) return <CloudLightning className="w-4 h-4 text-yellow-400" />;
    return <Cloud className="w-4 h-4 text-slate-300" />;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-500 animate-pulse font-sans font-medium">
        <Wind className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="hidden sm:inline">Sondeando atmósfera...</span>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div
      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-xs text-xs font-sans font-medium"
      title={`${weather.conditionDescription} · Viento: ${weather.windSpeed} km/h · ${biomeName}`}
    >
      <div className="p-0.5 sm:p-1 rounded-md bg-slate-100 shrink-0">
        {getWeatherIcon(weather.weatherCode)}
      </div>
      <div>
        <div className="flex items-center gap-1 sm:gap-1.5 leading-tight">
          <span className="font-bold text-slate-800 text-xs">
            {weather.temperature}°C
          </span>
          <span className="hidden sm:inline text-slate-500 text-[10px]">
            · {weather.conditionDescription}
          </span>
        </div>
        <div className="hidden lg:block text-[10px] text-slate-400 leading-tight">
          Viento: {weather.windSpeed} km/h · {biomeName}
        </div>
      </div>
    </div>
  );
}
