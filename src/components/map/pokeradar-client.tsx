"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { usePokemonRadar } from "@/hooks/use-pokemon-radar";
import { useExpedition } from "@/hooks/use-expedition";
import { MapContainer } from "@/components/map/map-container";
import { RadarHud } from "@/components/map/radar-hud";
import { DetailDrawer } from "@/components/pokemon/detail-drawer";
import { PartyDock } from "@/components/expedition/party-dock";
import { TeamAnalysisModal } from "@/components/expedition/team-analysis-modal";
import { WelcomeScreen } from "@/components/ui/welcome-screen";
import { ProfessorOakDialog } from "@/components/ui/professor-oak-dialog";
import { PokemonRadarEntity, WeatherData } from "@/types/pokemon";

interface PokeRadarClientProps {
  initialEntities: PokemonRadarEntity[];
  initialWeatherByBiome: Record<string, WeatherData | null>;
}

export function PokeRadarClient({
  initialEntities,
  initialWeatherByBiome,
}: PokeRadarClientProps) {
  const {
    activeBiome,
    selectBiome,
    entities,
    weatherByBiome,
    totalSpotted,
    loading,
    error,
    retryLoad,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    selectedPokemon,
    selectPokemon,
    isDrawerOpen,
    closeDrawer,
  } = usePokemonRadar({ initialEntities, initialWeatherByBiome });

  const { party, addToParty, removeFromParty, isInParty, isPartyFull } =
    useExpedition();

  const [hasStarted, setHasStarted] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [showOakDialog, setShowOakDialog] = useState(false);
  const [showTeamTutorialDialog, setShowTeamTutorialDialog] = useState(false);
  const [hasShownTeamTutorial, setHasShownTeamTutorial] = useState(false);
  const [firstRecruitedPokemon, setFirstRecruitedPokemon] = useState<string | null>(null);

  const handleAddToParty = (pokemon: Parameters<typeof addToParty>[0]) => {
    const isFirstPokemon = party.length === 0;
    const added = addToParty(pokemon);
    if (added && isFirstPokemon && !hasShownTeamTutorial) {
      setFirstRecruitedPokemon(pokemon.displayName);
      setHasShownTeamTutorial(true);
      setShowTeamTutorialDialog(true);
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#f8fafc] font-sans select-none">
      {/* Welcome Screen & Spinning Pokeball Loading Screen */}
      {!hasStarted && (
        <WelcomeScreen
          isLoading={loading}
          error={error}
          onRetry={retryLoad}
          onStartAdventure={() => {
            setHasStarted(true);
            setShowOakDialog(true);
          }}
        />
      )}

      {/* Professor Oak Welcoming Dialog (Intro on Start Adventure) */}
      <AnimatePresence>
        {hasStarted && showOakDialog && (
          <ProfessorOakDialog onClose={() => setShowOakDialog(false)} />
        )}
      </AnimatePresence>

      {/* Professor Oak Explaining Team Button Dialog (Triggered on 1st Pokemon recruited) */}
      <AnimatePresence>
        {hasStarted && showTeamTutorialDialog && (
          <ProfessorOakDialog
            imageSrc="/images/professor-oak-explaining.png"
            title="Profesor Oak · ¡Primer Pokémon!"
            speech={
              `¡Magnífica elección, explorador!\n\n` +
              `Has reclutado a ${firstRecruitedPokemon || "tu primer Pokémon"} para la expedición. ¿Notaste que en la barra superior se acaba de habilitar el botón «EQUIPO»?\n\n` +
              `Al pulsarlo podrás consultar el Diagnóstico Táctico en tiempo real: balance elemental, coberturas, debilidades y fortalezas ante otros tipos.\n\n` +
              `¡Puedes formar un equipo de hasta 6 Pokémon! ¡Continúa investigando los biomas!`
            }
            actionButtonText="Ver Equipo"
            onAction={() => {
              setShowTeamTutorialDialog(false);
              setIsTeamModalOpen(true);
            }}
            onClose={() => setShowTeamTutorialDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Top HUD Controls & Weather */}
      <RadarHud
        activeBiome={activeBiome}
        onSelectBiome={selectBiome}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        totalSpotted={totalSpotted}
        filteredEntities={entities}
        selectedPokemonId={selectedPokemon?.id ?? null}
        onSelectPokemon={selectPokemon}
        party={party}
        activeWeather={weatherByBiome[activeBiome.id] ?? null}
        onOpenTeamAnalysis={() => setIsTeamModalOpen(true)}
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
        isDrawerOpen={isDrawerOpen}
      />

      {/* Lateral Detail Drawer (Pokemon Stats & Audio) */}
      <DetailDrawer
        pokemon={selectedPokemon}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onAddToParty={handleAddToParty}
        onRemoveFromParty={removeFromParty}
        isInParty={selectedPokemon ? isInParty(selectedPokemon.id) : false}
        isPartyFull={isPartyFull}
      />

      {/* Team Diagnosis and Analysis Modal */}
      <TeamAnalysisModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        party={party}
      />
    </main>
  );
}
