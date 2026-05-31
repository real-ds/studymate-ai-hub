"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { THEME_PRESETS, type ThemeColors } from "@/lib/theme-config"

interface ThemeContextType {
  theme: string
  customColors: ThemeColors
  setTheme: (themeId: string) => void
  setCustomColors: (colors: ThemeColors) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const DEFAULT_CUSTOM_COLORS: ThemeColors = {
  background: "#FAF8F4",
  foreground: "#1C1C1E",
  card: "#FFFFFF",
  cardForeground: "#1C1C1E",
  primary: "#C8A96E",
  primaryForeground: "#FFFFFF",
  border: "#E5E5E7",
  mutedText: "#6B6B6B",
  muted: "#F2F2F7",
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<string>("warm-light")
  const [customColors, setCustomColorsState] = useState<ThemeColors>(DEFAULT_CUSTOM_COLORS)
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("studymate-theme") || "warm-light"
    const savedCustom = localStorage.getItem("studymate-custom-theme-colors")
    
    setThemeState(savedTheme)
    if (savedCustom) {
      try {
        setCustomColorsState(JSON.parse(savedCustom))
      } catch {
        // ignore parsing error
      }
    }
    setMounted(true)
  }, [])

  // Apply theme classes and custom properties to documentElement
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement

    // 1. Set the theme ID attribute
    root.setAttribute("data-theme", theme)

    // 2. Set the custom CSS properties
    let activeColors: ThemeColors
    if (theme === "custom") {
      activeColors = customColors
    } else {
      activeColors = THEME_PRESETS[theme]?.colors || THEME_PRESETS["warm-light"].colors
    }

    // Apply variables to style
    root.style.setProperty("--background", activeColors.background)
    root.style.setProperty("--foreground", activeColors.foreground)
    root.style.setProperty("--card", activeColors.card)
    root.style.setProperty("--card-foreground", activeColors.cardForeground)
    root.style.setProperty("--primary", activeColors.primary)
    root.style.setProperty("--primary-foreground", activeColors.primaryForeground)
    root.style.setProperty("--border", activeColors.border)
    root.style.setProperty("--muted-text", activeColors.mutedText)
    root.style.setProperty("--muted", activeColors.muted)

    // Sync with localStorage
    localStorage.setItem("studymate-theme", theme)
  }, [theme, customColors, mounted])

  const setTheme = (themeId: string) => {
    setThemeState(themeId)
  }

  const setCustomColors = (colors: ThemeColors) => {
    setCustomColorsState(colors)
    localStorage.setItem("studymate-custom-theme-colors", JSON.stringify(colors))
  }

  return (
    <ThemeContext.Provider value={{ theme, customColors, setTheme, setCustomColors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
