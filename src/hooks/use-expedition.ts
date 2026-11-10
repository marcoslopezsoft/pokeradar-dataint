"use client";

import { useState, useEffect } from "react";
import { PokemonRadarEntity } from "@/types/pokemon";

const STORAGE_KEY = "pokeradar_expedition_party_v1";

export function useExpedition() {
  const [party, setParty] = useState<PokemonRadarEntity[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setParty(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to read expedition party from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const addToParty = (pokemon: PokemonRadarEntity): boolean => {
    if (party.length >= 6) return false;
    if (party.some((p) => p.id === pokemon.id)) return false;

    const updated = [...party, pokemon];
    setParty(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to persist party:", e);
    }
    return true;
  };

  const removeFromParty = (pokemonId: number) => {
    const updated = party.filter((p) => p.id !== pokemonId);
    setParty(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to persist party:", e);
    }
  };

  const isInParty = (pokemonId: number): boolean => {
    return party.some((p) => p.id === pokemonId);
  };

  return {
    party,
    isLoaded,
    addToParty,
    removeFromParty,
    isInParty,
    isPartyFull: party.length >= 6,
  };
}
