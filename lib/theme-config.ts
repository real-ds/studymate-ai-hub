export interface ThemeColors {
  background: string
  foreground: string
  card: string
  cardForeground: string
  primary: string
  primaryForeground: string
  border: string
  mutedText: string
  muted: string
}

export const THEME_PRESETS: Record<string, { label: string; colors: ThemeColors }> = {
  "warm-light": {
    label: "Warm Light (Default)",
    colors: {
      background: "#FAF8F4",
      foreground: "#1C1C1E",
      card: "#FFFFFF",
      cardForeground: "#1C1C1E",
      primary: "#C8A96E",
      primaryForeground: "#FFFFFF",
      border: "#E5E5E7",
      mutedText: "#6B6B6B",
      muted: "#F2F2F7",
    },
  },
  "pure-light": {
    label: "Pure Light (Sky Blue)",
    colors: {
      background: "#F9FAFB",
      foreground: "#111827",
      card: "#FFFFFF",
      cardForeground: "#111827",
      primary: "#3B82F6",
      primaryForeground: "#FFFFFF",
      border: "#E5E7EB",
      mutedText: "#4B5563",
      muted: "#F3F4F6",
    },
  },
  "warm-dark": {
    label: "Warm Dark",
    colors: {
      background: "#0F0F10",
      foreground: "#F4F4F5",
      card: "#18181B",
      cardForeground: "#F4F4F5",
      primary: "#C8A96E",
      primaryForeground: "#0F0F10",
      border: "#27272A",
      mutedText: "#A1A1AA",
      muted: "#27272A",
    },
  },
  "slate-dark": {
    label: "Slate Dark",
    colors: {
      background: "#0B0F19",
      foreground: "#E2E8F0",
      card: "#1E293B",
      cardForeground: "#E2E8F0",
      primary: "#38BDF8",
      primaryForeground: "#0B0F19",
      border: "#334155",
      mutedText: "#94A3B8",
      muted: "#334155",
    },
  },
  "midnight-blue": {
    label: "Midnight Ambient",
    colors: {
      background: "#121824",
      foreground: "#F1F5F9",
      card: "#1E293B",
      cardForeground: "#F1F5F9",
      primary: "#F59E0B",
      primaryForeground: "#121824",
      border: "#334155",
      mutedText: "#94A3B8",
      muted: "#334155",
    },
  },
  "forest-ambient": {
    label: "Forest Ambient",
    colors: {
      background: "#0F1715",
      foreground: "#ECFDF5",
      card: "#1A2E26",
      cardForeground: "#ECFDF5",
      primary: "#10B981",
      primaryForeground: "#0F1715",
      border: "#2E4D40",
      mutedText: "#A7F3D0",
      muted: "#2E4D40",
    },
  },
}
