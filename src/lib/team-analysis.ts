import { PokemonRadarEntity } from "@/types/pokemon";
import { POKEMON_TYPE_NAMES_ES, translateTypeToSpanish } from "@/lib/utils";

const ALL_TYPES = Object.keys(POKEMON_TYPE_NAMES_ES);

interface TypeEffectivenessRule {
  strongAgainst: string[];
  weakAgainst: string[];
  immuneTo?: string[];
}

// Official Gen 6+ offensive type effectiveness matrix
const OFFENSIVE_TYPE_CHART: Record<string, TypeEffectivenessRule> = {
  normal: {
    strongAgainst: [],
    weakAgainst: ["rock", "steel"],
    immuneTo: ["ghost"],
  },
  fire: {
    strongAgainst: ["grass", "ice", "bug", "steel"],
    weakAgainst: ["fire", "water", "rock", "dragon"],
  },
  water: {
    strongAgainst: ["fire", "ground", "rock"],
    weakAgainst: ["water", "grass", "dragon"],
  },
  electric: {
    strongAgainst: ["water", "flying"],
    weakAgainst: ["electric", "grass", "dragon"],
    immuneTo: ["ground"],
  },
  grass: {
    strongAgainst: ["water", "ground", "rock"],
    weakAgainst: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"],
  },
  ice: {
    strongAgainst: ["grass", "ground", "flying", "dragon"],
    weakAgainst: ["fire", "water", "ice", "steel"],
  },
  fighting: {
    strongAgainst: ["normal", "ice", "rock", "dark", "steel"],
    weakAgainst: ["poison", "flying", "psychic", "bug", "fairy"],
    immuneTo: ["ghost"],
  },
  poison: {
    strongAgainst: ["grass", "fairy"],
    weakAgainst: ["poison", "ground", "rock", "ghost"],
    immuneTo: ["steel"],
  },
  ground: {
    strongAgainst: ["fire", "electric", "poison", "rock", "steel"],
    weakAgainst: ["grass", "bug"],
    immuneTo: ["flying"],
  },
  flying: {
    strongAgainst: ["grass", "fighting", "bug"],
    weakAgainst: ["electric", "rock", "steel"],
  },
  psychic: {
    strongAgainst: ["fighting", "poison"],
    weakAgainst: ["psychic", "steel"],
    immuneTo: ["dark"],
  },
  bug: {
    strongAgainst: ["grass", "psychic", "dark"],
    weakAgainst: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"],
  },
  rock: {
    strongAgainst: ["fire", "ice", "flying", "bug"],
    weakAgainst: ["fighting", "ground", "steel"],
  },
  ghost: {
    strongAgainst: ["psychic", "ghost"],
    weakAgainst: ["dark"],
    immuneTo: ["normal"],
  },
  dragon: {
    strongAgainst: ["dragon"],
    weakAgainst: ["steel"],
    immuneTo: ["fairy"],
  },
  dark: {
    strongAgainst: ["psychic", "ghost"],
    weakAgainst: ["fighting", "dark", "fairy"],
  },
  steel: {
    strongAgainst: ["ice", "rock", "fairy"],
    weakAgainst: ["fire", "water", "electric", "steel"],
  },
  fairy: {
    strongAgainst: ["fighting", "dragon", "dark"],
    weakAgainst: ["fire", "poison", "steel"],
  },
};

export function getAttackMultiplier(attackType: string, defenderTypes: string[]): number {
  const rule = OFFENSIVE_TYPE_CHART[attackType.toLowerCase()];
  if (!rule) return 1;

  let multiplier = 1;
  for (const defType of defenderTypes) {
    const normalizedDef = defType.toLowerCase();
    if (rule.immuneTo?.includes(normalizedDef)) return 0;
    if (rule.strongAgainst.includes(normalizedDef)) multiplier *= 2;
    else if (rule.weakAgainst.includes(normalizedDef)) multiplier *= 0.5;
  }
  return multiplier;
}

export interface MemberTacticalProfile {
  pokemon: PokemonRadarEntity;
  roleLabel: string;
  roleDetail: string;
  totalStats: number;
  strongestStatLabel: string;
  strongestStatValue: number;
  weaknesses: { type: string; multiplier: number }[];
  resistances: string[];
  offensiveCoverage: string[];
  summaryText: string;
}

export interface TypeThreatMetric {
  type: string;
  weakCount: number;
  resistCount: number;
  maxMultiplier: number;
}

export interface TeamTacticalDiagnosis {
  memberCount: number;
  avgLevel: number;
  avgStats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
    total: number;
  };
  uniqueElementalTypes: string[];
  offensiveCoverageTypes: string[];
  criticalWeaknesses: TypeThreatMetric[];
  defensiveStrengths: { type: string; resistCount: number }[];
  recommendedTypes: string[];
  members: MemberTacticalProfile[];
  executiveSummary: string;
  synergyNotes: string[];
}

function getStat(pokemon: PokemonRadarEntity, key: string): number {
  return pokemon.stats[key] ?? 0;
}

function formatTypeListEs(types: string[], limit = 3): string {
  return types
    .slice(0, limit)
    .map((t) => translateTypeToSpanish(t))
    .join(", ");
}

export function analyzeMemberProfile(pokemon: PokemonRadarEntity): MemberTacticalProfile {
  const hp = getStat(pokemon, "hp");
  const atk = getStat(pokemon, "attack");
  const def = getStat(pokemon, "defense");
  const spAtk = getStat(pokemon, "special-attack");
  const spDef = getStat(pokemon, "special-defense");
  const speed = getStat(pokemon, "speed");
  const totalStats = hp + atk + def + spAtk + spDef + speed;

  const statEntries = [
    { key: "hp", label: "HP", value: hp },
    { key: "attack", label: "Ataque", value: atk },
    { key: "defense", label: "Defensa", value: def },
    { key: "special-attack", label: "Atq. Esp.", value: spAtk },
    { key: "special-defense", label: "Def. Esp.", value: spDef },
    { key: "speed", label: "Velocidad", value: speed },
  ].sort((a, b) => b.value - a.value);

  const strongest = statEntries[0];
  const offensiveMax = Math.max(atk, spAtk);
  const defensiveAvg = (hp + def + spDef) / 3;

  let roleLabel = "Equilibrado";
  let roleDetail = "Aporte balanceado entre ataque y resistencia";

  if (speed >= 95 && speed >= offensiveMax - 10) {
    roleLabel = "Velocista";
    roleDetail = "Toma la iniciativa y presiona primero";
  } else if (defensiveAvg > offensiveMax + 10 || hp >= 105) {
    roleLabel = "Tanque";
    roleDetail = "Absorbe castigo y sostiene la línea";
  } else if (atk >= spAtk + 15) {
    roleLabel = "Atacante Físico";
    roleDetail = "Daño directo de alto impacto físico";
  } else if (spAtk >= atk + 15) {
    roleLabel = "Atacante Especial";
    roleDetail = "Control elemental a media y larga distancia";
  }

  const weaknesses: { type: string; multiplier: number }[] = [];
  const resistances: string[] = [];

  for (const atkType of ALL_TYPES) {
    const mult = getAttackMultiplier(atkType, pokemon.types);
    if (mult >= 2) {
      weaknesses.push({ type: atkType, multiplier: mult });
    } else if (mult < 1) {
      resistances.push(atkType);
    }
  }
  weaknesses.sort((a, b) => b.multiplier - a.multiplier);

  const offensiveSet = new Set<string>();
  for (const stabType of pokemon.types) {
    const rule = OFFENSIVE_TYPE_CHART[stabType.toLowerCase()];
    rule?.strongAgainst.forEach((target) => offensiveSet.add(target));
  }
  const offensiveCoverage = Array.from(offensiveSet);

  const typesEs = pokemon.types.map(translateTypeToSpanish).join("/");
  const weakText =
    weaknesses.length > 0
      ? `Cuidado ante ${weaknesses
          .slice(0, 3)
          .map((w) => `${translateTypeToSpanish(w.type)}${w.multiplier >= 4 ? " (×4)" : ""}`)
          .join(", ")}.`
      : "Sin debilidades directas marcadas.";

  const offText =
    offensiveCoverage.length > 0
      ? `Presiona bien a ${formatTypeListEs(offensiveCoverage, 3)}.`
      : "Cobertura ofensiva neutra.";

  const summaryText = `Perfil ${roleLabel.toLowerCase()} de tipo ${typesEs} (${totalStats} pts base; destaca en ${strongest.label} ${strongest.value}). ${offText} ${weakText}`;

  return {
    pokemon,
    roleLabel,
    roleDetail,
    totalStats,
    strongestStatLabel: strongest.label,
    strongestStatValue: strongest.value,
    weaknesses,
    resistances,
    offensiveCoverage,
    summaryText,
  };
}

export function buildTeamTacticalDiagnosis(
  party: PokemonRadarEntity[]
): TeamTacticalDiagnosis {
  const members = party.map(analyzeMemberProfile);
  const count = members.length;

  const uniqueElementalTypes = Array.from(new Set(party.flatMap((p) => p.types)));

  const offensiveSet = new Set<string>();
  for (const m of members) {
    m.offensiveCoverage.forEach((t) => offensiveSet.add(t));
  }
  const offensiveCoverageTypes = Array.from(offensiveSet);

  const threatMetrics: TypeThreatMetric[] = [];
  const defensiveStrengths: { type: string; resistCount: number }[] = [];

  for (const atkType of ALL_TYPES) {
    let weakCount = 0;
    let resistCount = 0;
    let maxMultiplier = 1;

    for (const p of party) {
      const mult = getAttackMultiplier(atkType, p.types);
      if (mult >= 2) {
        weakCount += 1;
        maxMultiplier = Math.max(maxMultiplier, mult);
      } else if (mult < 1) {
        resistCount += 1;
      }
    }

    if (weakCount > 0 && (weakCount > resistCount || weakCount >= 2)) {
      threatMetrics.push({ type: atkType, weakCount, resistCount, maxMultiplier });
    }
    if (resistCount > weakCount && resistCount > 0) {
      defensiveStrengths.push({ type: atkType, resistCount });
    }
  }

  threatMetrics.sort(
    (a, b) =>
      b.weakCount - b.resistCount - (a.weakCount - a.resistCount) ||
      b.maxMultiplier - a.maxMultiplier ||
      b.weakCount - a.weakCount
  );
  defensiveStrengths.sort((a, b) => b.resistCount - a.resistCount);

  // Recommend types that resist the team's top threats without already crowding the roster
  const topThreatTypes = threatMetrics.slice(0, 3).map((t) => t.type);
  const recommendedTypes = ALL_TYPES.filter((candidate) => {
    if (uniqueElementalTypes.includes(candidate)) return false;
    return topThreatTypes.some(
      (threat) => getAttackMultiplier(threat, [candidate]) < 1
    );
  }).slice(0, 4);

  const divisor = Math.max(count, 1);
  const avgLevel = count > 0 ? Math.round(party.reduce((s, p) => s + p.level, 0) / divisor) : 0;
  const avgHp = Math.round(party.reduce((s, p) => s + getStat(p, "hp"), 0) / divisor);
  const avgAtk = Math.round(party.reduce((s, p) => s + getStat(p, "attack"), 0) / divisor);
  const avgDef = Math.round(party.reduce((s, p) => s + getStat(p, "defense"), 0) / divisor);
  const avgSpAtk = Math.round(
    party.reduce((s, p) => s + getStat(p, "special-attack"), 0) / divisor
  );
  const avgSpDef = Math.round(
    party.reduce((s, p) => s + getStat(p, "special-defense"), 0) / divisor
  );
  const avgSpeed = Math.round(party.reduce((s, p) => s + getStat(p, "speed"), 0) / divisor);
  const avgTotal =
    count > 0
      ? Math.round(members.reduce((s, m) => s + m.totalStats, 0) / divisor)
      : 0;

  let executiveSummary = "";
  const synergyNotes: string[] = [];

  if (count === 0) {
    executiveSummary =
      "Tu equipo de expedición aún no tiene integrantes. Seleccioná criaturas en el mapa para evaluar sus perfiles y sinergia grupal.";
  } else if (count === 1) {
    const solo = members[0];
    executiveSummary =
      `Actualmente explorás solo con ${solo.pokemon.displayName} (Nv. ${solo.pokemon.level}, rol ${solo.roleLabel} de ${solo.pokemon.biomeName}). ` +
      `Cubre ${offensiveCoverageTypes.length} de 18 tipos por STAB, aunque al estar sin relevos queda expuesto ante ${
        solo.weaknesses.length > 0
          ? formatTypeListEs(solo.weaknesses.map((w) => w.type), 3)
          : "amenazas neutras"
      }.`;

    if (recommendedTypes.length > 0) {
      synergyNotes.push(
        `Sugerencia de reclutamiento: incorporá Pokémon de tipo ${formatTypeListEs(
          recommendedTypes,
          3
        )} para cubrir sus puntos vulnerables.`
      );
    }
  } else {
    const names = members.map((m) => m.pokemon.displayName);
    const namesJoined =
      names.length === 2
        ? `${names[0]} y ${names[1]}`
        : `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;

    const uniqueRoles = Array.from(new Set(members.map((m) => m.roleLabel)));
    const avgOffense = Math.max(avgAtk, avgSpAtk);
    const avgBulk = Math.round((avgHp + avgDef + avgSpDef) / 3);
    const tendency =
      avgSpeed >= 90 && avgOffense >= avgBulk
        ? "una formación veloz orientada a tomar la iniciativa ofensiva"
        : avgOffense > avgBulk + 10
        ? "un bloque ofensivo con fuerte presión de daño"
        : avgBulk > avgOffense + 10
        ? "una escuadra resistente pensada para combates de desgaste"
        : "una formación equilibrada entre resistencia, daño y velocidad";

    const sharedThreats = threatMetrics.filter((t) => t.weakCount >= 2);

    executiveSummary =
      `Tu escuadrón de ${count} Pokémon (${namesJoined}) conforma ${tendency}, promediando ${avgTotal} pts base y cubriendo ${offensiveCoverageTypes.length}/18 tipos ofensivamente. ` +
      (uniqueRoles.length > 1
        ? `Combina ${uniqueRoles.length} roles tácticos distintos (${uniqueRoles.join(", ")}), permitiendo rotar según el enfrentamiento.`
        : `Todos comparten perfil ${uniqueRoles[0]?.toLowerCase()}, por lo que conviene sumar un rol complementario en los lugares libres.`);

    if (sharedThreats.length > 0) {
      synergyNotes.push(
        `Alerta grupal: ${sharedThreats
          .slice(0, 3)
          .map(
            (t) =>
              `${translateTypeToSpanish(t.type)} (${t.weakCount}/${count} débiles)`
          )
          .join(", ")} afectan a varios miembros a la vez.`
      );
    } else if (threatMetrics.length > 0) {
      synergyNotes.push(
        `Buena compensación defensiva: ninguna debilidad supera a un único integrante sin respaldo, aunque conviene vigilar ${formatTypeListEs(
          threatMetrics.map((t) => t.type),
          3
        )}.`
      );
    }

    if (defensiveStrengths.length > 0) {
      synergyNotes.push(
        `Muralla elemental: el equipo resiste o anula con solvencia ataques de tipo ${formatTypeListEs(
          defensiveStrengths.map((d) => d.type),
          4
        )}.`
      );
    }

    if (count < 6 && recommendedTypes.length > 0) {
      synergyNotes.push(
        `Para los ${6 - count} espacios disponibles, sumar tipo ${formatTypeListEs(
          recommendedTypes,
          3
        )} reforzaría los huecos del equipo.`
      );
    }
  }

  return {
    memberCount: count,
    avgLevel,
    avgStats: {
      hp: avgHp,
      attack: avgAtk,
      defense: avgDef,
      spAttack: avgSpAtk,
      spDefense: avgSpDef,
      speed: avgSpeed,
      total: avgTotal,
    },
    uniqueElementalTypes,
    offensiveCoverageTypes,
    criticalWeaknesses: threatMetrics.slice(0, 6),
    defensiveStrengths: defensiveStrengths.slice(0, 6),
    recommendedTypes,
    members,
    executiveSummary,
    synergyNotes,
  };
}
