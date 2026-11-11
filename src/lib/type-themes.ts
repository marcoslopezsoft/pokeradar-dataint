export interface TypeTheme {
  from: string;
  to: string;
  badgeBg: string;
  accentColor: string;
}

export const DEFAULT_TYPE_THEME: TypeTheme = {
  from: "#3b82f6",
  to: "#1d4ed8",
  badgeBg: "bg-white/25",
  accentColor: "#3b82f6",
};

export const TYPE_THEMES: Record<string, TypeTheme> = {
  grass: {
    from: "#48d0b0",
    to: "#38b293",
    badgeBg: "bg-white/25",
    accentColor: "#48d0b0",
  },
  fire: {
    from: "#fb6c6c",
    to: "#e64a4a",
    badgeBg: "bg-white/25",
    accentColor: "#fb6c6c",
  },
  water: {
    from: "#77befe",
    to: "#58a0e8",
    badgeBg: "bg-white/25",
    accentColor: "#77befe",
  },
  electric: {
    from: "#ffd86f",
    to: "#e6be48",
    badgeBg: "bg-white/25",
    accentColor: "#ffd86f",
  },
  bug: {
    from: "#a8b820",
    to: "#8d9a1b",
    badgeBg: "bg-white/25",
    accentColor: "#a8b820",
  },
  normal: {
    from: "#a8a878",
    to: "#8a8a60",
    badgeBg: "bg-white/25",
    accentColor: "#a8a878",
  },
  poison: {
    from: "#a040a0",
    to: "#803380",
    badgeBg: "bg-white/25",
    accentColor: "#a040a0",
  },
  ground: {
    from: "#e0c068",
    to: "#cbb050",
    badgeBg: "bg-white/25",
    accentColor: "#e0c068",
  },
  fairy: {
    from: "#ee99ac",
    to: "#d87c91",
    badgeBg: "bg-white/25",
    accentColor: "#ee99ac",
  },
  fighting: {
    from: "#c03028",
    to: "#9f2720",
    badgeBg: "bg-white/25",
    accentColor: "#c03028",
  },
  psychic: {
    from: "#f85888",
    to: "#d43a6a",
    badgeBg: "bg-white/25",
    accentColor: "#f85888",
  },
  rock: {
    from: "#b8a038",
    to: "#968228",
    badgeBg: "bg-white/25",
    accentColor: "#b8a038",
  },
  ghost: {
    from: "#705898",
    to: "#564278",
    badgeBg: "bg-white/25",
    accentColor: "#705898",
  },
  ice: {
    from: "#98d8d8",
    to: "#74bcbc",
    badgeBg: "bg-white/25",
    accentColor: "#98d8d8",
  },
  dragon: {
    from: "#7038f8",
    to: "#5324c4",
    badgeBg: "bg-white/25",
    accentColor: "#7038f8",
  },
  steel: {
    from: "#b8b8d0",
    to: "#9999b4",
    badgeBg: "bg-white/25",
    accentColor: "#b8b8d0",
  },
  dark: {
    from: "#705848",
    to: "#503f34",
    badgeBg: "bg-white/25",
    accentColor: "#705848",
  },
  flying: {
    from: "#8fa8ff",
    to: "#6884eb",
    badgeBg: "bg-white/25",
    accentColor: "#8fa8ff",
  },
};

/** Resolves primary and optional distinct secondary elemental color themes for a Pokémon. */
export function resolvePokemonTypeThemes(types: string[]): {
  primary: TypeTheme;
  secondary: TypeTheme | null;
} {
  const primaryType = types[0]?.toLowerCase() || "normal";
  const secondaryType = types[1]?.toLowerCase();
  const primary = TYPE_THEMES[primaryType] || DEFAULT_TYPE_THEME;
  const secondary =
    secondaryType && secondaryType !== primaryType
      ? TYPE_THEMES[secondaryType] || DEFAULT_TYPE_THEME
      : null;

  return { primary, secondary };
}

/** Builds a crisp CSS gradient for 1 or 2 elemental types with a solid white diagonal seam. */
export function buildElementalBackground(
  primary: TypeTheme,
  secondary?: TypeTheme | null
): string {
  if (!secondary) {
    return `linear-gradient(135deg, ${primary.from} 0%, ${primary.to} 100%)`;
  }
  return `linear-gradient(135deg, ${primary.from} 0%, ${primary.to} calc(50% - 1.5px), #ffffff calc(50% - 1px), #ffffff calc(50% + 1px), ${secondary.from} calc(50% + 1.5px), ${secondary.to} 100%)`;
}
