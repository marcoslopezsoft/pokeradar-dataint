"use client";

import { useCallback, useSyncExternalStore } from "react";
import { PokemonRadarEntity } from "@/types/pokemon";

const STORAGE_KEY = "pokeradar_expedition_party_v1";
const PARTY_EVENT = "pokeradar-party-updated";
const EMPTY_PARTY: PokemonRadarEntity[] = [];

let cachedRaw: string | null = null;
let cachedParty: PokemonRadarEntity[] = EMPTY_PARTY;

function subscribeToParty(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handleChange = () => callback();
  window.addEventListener("storage", handleChange);
  window.addEventListener(PARTY_EVENT, handleChange);
  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(PARTY_EVENT, handleChange);
  };
}

function getPartySnapshot(): PokemonRadarEntity[] {
  if (typeof window === "undefined") return EMPTY_PARTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedRaw = null;
      cachedParty = EMPTY_PARTY;
      return EMPTY_PARTY;
    }
    if (raw === cachedRaw) {
      return cachedParty;
    }
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cachedRaw = raw;
      cachedParty = parsed as PokemonRadarEntity[];
      return cachedParty;
    }
  } catch (e) {
    console.warn("Failed to read expedition party from localStorage:", e);
  }
  return EMPTY_PARTY;
}

function getServerPartySnapshot(): PokemonRadarEntity[] {
  return EMPTY_PARTY;
}

function subscribeHydration(): () => void {
  return () => {};
}

function writeParty(updated: PokemonRadarEntity[]): void {
  try {
    const serialized = JSON.stringify(updated);
    localStorage.setItem(STORAGE_KEY, serialized);
    cachedRaw = serialized;
    cachedParty = updated;
    window.dispatchEvent(new Event(PARTY_EVENT));
  } catch (e) {
    console.warn("Failed to persist party:", e);
  }
}

export function useExpedition() {
  const party = useSyncExternalStore(
    subscribeToParty,
    getPartySnapshot,
    getServerPartySnapshot
  );
  const isLoaded = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false
  );

  const addToParty = useCallback(
    (pokemon: PokemonRadarEntity): boolean => {
      if (party.length >= 6) return false;
      if (party.some((p) => p.id === pokemon.id)) return false;

      writeParty([...party, pokemon]);
      return true;
    },
    [party]
  );

  const removeFromParty = useCallback(
    (pokemonId: number) => {
      writeParty(party.filter((p) => p.id !== pokemonId));
    },
    [party]
  );

  const isInParty = useCallback(
    (pokemonId: number): boolean => party.some((p) => p.id === pokemonId),
    [party]
  );

  return {
    party,
    isLoaded,
    addToParty,
    removeFromParty,
    isInParty,
    isPartyFull: party.length >= 6,
  };
}
