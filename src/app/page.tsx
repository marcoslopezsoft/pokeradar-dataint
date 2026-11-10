"use client";

import React from "react";
import { usePokemonRadar } from "@/hooks/use-pokemon-radar";
import { useExpedition } from "@/hooks/use-expedition";
import { MapContainer } from "@/components/map/map-container";
import { RadarHud } from "@/components/map/radar-hud";
import { DetailDrawer } from "@/components/pokemon/detail-drawer";
import { PartyDock } from "@/components/expedition/party-dock";

export default function HomePage() {
  const {
    activeBiome,
    selectBiome,
    entities,
    totalSpotted,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    selectedPokemon,
    selectPokemon,
    isDrawerOpen,
    closeDrawer,
  } = usePokemonRadar();

  const { party, addToParty, removeFromParty, isInParty, isPartyFull } =
    useExpedition();

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#f8fafc] font-sans select-none">
      {/* Top HUD Controls & Weather */}
      <RadarHud
        activeBiome={activeBiome}
        onSelectBiome={selectBiome}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        totalSpotted={totalSpotted}
      />

      {/* Main Geospatial Map Engine */}
      <MapContainer
        pokemonList={entities}
        activeBiome={activeBiome}
        selectedPokemon={selectedPokemon}
        onSelectPokemon={selectPokemon}
        onSelectBiome={selectBiome}
      />

      {/* Expedition Party Dock (Floating Bottom) */}
      <PartyDock
        party={party}
        onSelectPokemon={selectPokemon}
        onReleasePokemon={removeFromParty}
        selectedId={selectedPokemon?.id}
      />

      {/* Lateral Detail Drawer (Pokemon Stats & Audio) */}
      <DetailDrawer
        pokemon={selectedPokemon}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onAddToParty={addToParty}
        onRemoveFromParty={removeFromParty}
        isInParty={selectedPokemon ? isInParty(selectedPokemon.id) : false}
        isPartyFull={isPartyFull}
      />
    </main>
  );
}
