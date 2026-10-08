export const colors = {
  primary: "#C41E3A",
  primaryDark: "#8B0000",
  primaryLight: "#FFF0F2",
  primaryBorder: "#FECDD3",
  green: "#166534",
  greenSolid: "#166534",
  greenDark: "#14532D",
  greenLight: "#F0F9F0",
  teal: "#0891B2",
  tealLight: "#ECFEFF",
  purple: "#7C3AED",
  purpleLight: "#F5F3FF",
  amber: "#F59E0B",
  amberLight: "#FFFBEB",
  brown: "#B45309",
  red: "#DC2626",
  redSolid: "#DC2626", // solid danger surface carrying white text
  redLight: "#FFF0F2",
  background: "#F5F7F5",
  card: "#FFFFFF",
  foreground: "#1A1F1A",
  muted: "#F3F4F6",
  mutedForeground: "#9CA3AF",
  border: "#E5E7EB",
  white: "#FFFFFF",
  black: "#000000",
  darkBg: "#0d0d0d",

  // ── Semantic tokens for UI states (soft tints, borders, secondary text).
  // These exist so hardcoded palette hexes can be themed; LIGHT values match
  // the original hexes exactly, DARK values are readable equivalents.
  textSecondary: "#6B7280", // gray-500 meta text
  textMuted: "#4B5563", // gray-600 meta text
  borderStrong: "#D1D5DB", // gray-300 stronger lines / disabled borders
  successBg: "#F0FDF4", // soft green surface
  successBorder: "#BBF7D0",
  successTint: "#DCFCE7", // green-100 fill (charts, chips)
  warningBg: "#FFFBEB", // soft amber surface
  warningBorder: "#FDE68A",
  warningText: "#92400E",
  warningSoftBg: "#FFF7ED", // orange-50 surface
  warningSoftBorder: "#FED7AA", // orange-200 border
  amberBorder: "#FCD34D", // saturated amber border on tinted cards
  dangerBorderSoft: "#FECACA", // red-200 border on soft-danger buttons
  redTint: "#FEE2E2", // red-100 fill
  pinkTint: "#FFE4E8", // selected-chip surface
  redDeepText: "#B91C1C", // red-700 error text/icons
  redDeeperText: "#991B1B", // red-800 error text
  roseDeep: "#9F1239", // rose-800 accent text
  dangerBright: "#EF4444", // bright red destructive text
  subtleBg: "#F7FAFC", // near-white secondary surface
  slateBg: "#E2E8F0", // slate-200 chip surface
  tabBarBg: "rgba(255,255,255,0.97)", // translucent tab bar surface
};

export const gradients = {
  header: ["#C41E3A", "#8B0000", "#166534"] as const,
  header2: ["#C41E3A", "#8B0000"] as const,
  greenGrad: ["#166534", "#14532D"] as const,
  redGrad: ["#C41E3A", "#8B0000"] as const,
  darkRedGrad: ["#1a0a0e", "#2d1b1e", "#0a1a0e"] as const,
};

/**
 * Dark palette. Brand surfaces (primary red, gradients, solid buttons) stay
 * identical so the app keeps its identity; backgrounds, cards, tints, borders
 * and secondary text flip to dark equivalents with readable contrast.
 */
export const darkColors: typeof colors = {
  primary: "#C41E3A",
  primaryDark: "#8B0000",
  primaryLight: "#2A1216",
  primaryBorder: "#5C2530",
  green: "#4ADE80", // success text/icons read clearly on dark cards
  greenSolid: "#15803D", // solid badges keep white text on top
  greenDark: "#14532D",
  greenLight: "#101F16",
  teal: "#22D3EE",
  tealLight: "#10222A",
  purple: "#A78BFA",
  purpleLight: "#1E1A2E",
  amber: "#F59E0B",
  amberLight: "#261D0C",
  brown: "#FBBF24",
  red: "#F87171",
  redSolid: "#DC2626", // solid danger surface carrying white text
  redLight: "#2A1216",
  background: "#0F1410",
  card: "#171C18",
  foreground: "#E9EDE9",
  muted: "#242A24",
  mutedForeground: "#9CA3AF",
  border: "#2F362F",
  white: "#FFFFFF", // still used as text on gradients/brand buttons
  black: "#000000",
  darkBg: "#0d0d0d",

  textSecondary: "#A7B0A7",
  textMuted: "#B8C0B8",
  borderStrong: "#3A423A",
  successBg: "#0E1F14",
  successBorder: "#1E4630",
  successTint: "#12281A",
  warningBg: "#241B08",
  warningBorder: "#4C3D14",
  warningText: "#FBBF24",
  warningSoftBg: "#2A1E0C",
  warningSoftBorder: "#5C411A",
  amberBorder: "#6B5316",
  dangerBorderSoft: "#4A1E1E",
  redTint: "#2E1515",
  pinkTint: "#2B1219",
  redDeepText: "#FCA5A5",
  redDeeperText: "#F87171",
  roseDeep: "#FDA4AF",
  dangerBright: "#F87171",
  subtleBg: "#1C221D",
  slateBg: "#252C26",
  tabBarBg: "rgba(23,28,24,0.97)", // dark card at the same translucency
};

// Gradients keep the brand identity in both modes (headers sit on top of the
// status bar in light and dark alike).
export const darkGradients = gradients;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 6,
  },
};

/**
 * A palette bundle for one mode: the color map plus the gradients.
 * Defined here (not in ThemeContext) so theme.ts has no circular imports.
 */
export interface ThemePalette {
  colors: typeof colors;
  gradients: typeof gradients;
}

// Resolve the palette for a mode. Used by ThemeContext; exported here so
// theme logic stays in one place.
export function getPalette(mode: "light" | "dark"): ThemePalette {
  return mode === "dark"
    ? { colors: darkColors, gradients: darkGradients }
    : { colors, gradients };
}
