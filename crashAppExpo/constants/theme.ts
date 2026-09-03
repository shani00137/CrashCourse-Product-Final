export const colors = {
  primary: "#C41E3A",
  primaryDark: "#8B0000",
  primaryLight: "#FFF0F2",
  primaryBorder: "#FECDD3",
  green: "#166534",
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
};

export const gradients = {
  header: ["#C41E3A", "#8B0000", "#166534"] as const,
  header2: ["#C41E3A", "#8B0000"] as const,
  greenGrad: ["#166534", "#14532D"] as const,
  redGrad: ["#C41E3A", "#8B0000"] as const,
  darkRedGrad: ["#1a0a0e", "#2d1b1e", "#0a1a0e"] as const,
};

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
