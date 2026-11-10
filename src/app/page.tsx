"use client";

import React, { useState } from "react";
import { usePokemonRadar } from "@/hooks/use-pokemon-radar";
import { useExpedition } from "@/hooks/use-expedition";
import { MapContainer } from "@/components/map/map-container";
import { RadarHud } from "@/components/map/radar-hud";
import { DetailDrawer } from "@/components/pokemon/detail-drawer";
import { PartyDock } from "@/components/expedition/party-dock";
import { WelcomeScreen } from "@/components/ui/welcome-screen";

export default function HomePage() {
  const {
    activeBiome,
    selectBiome,
    entities,
    totalSpotted,
    loading,
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

  const [hasStarted, setHasStarted] = useState(false);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#f8fafc] font-sans select-none">
      {/* Welcome Screen & Spinning Pokeball Loading Screen */}
      {!hasStarted && (
        <WelcomeScreen
          isLoading={loading}
          onStartAdventure={() => setHasStarted(true)}
        />
      )}

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
