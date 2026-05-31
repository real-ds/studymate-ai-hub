"use client"

import { useTheme } from "@/components/ThemeProvider"
import { THEME_PRESETS, type ThemeColors } from "@/lib/theme-config"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"

export default function ThemeSelectorCard() {
  const { theme, customColors, setTheme, setCustomColors } = useTheme()

  const handleCustomColorChange = (key: keyof ThemeColors, value: string) => {
    const updated = {
      ...customColors,
      [key]: value,
    }
    // Auto-calculate muted hover color based on card/border
    if (key === "border") {
      updated.muted = value
    }
    setCustomColors(updated)
  }

  return (
    <Card className="border border-stone-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-darkPrimary">Color Themes & Schemes</CardTitle>
        <CardDescription className="text-sm text-stone-500">
          Personalize your workspace. Choose a pre-defined theme or design your own custom color scheme.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(THEME_PRESETS).map(([id, preset]) => {
            const isActive = theme === id
            return (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`relative flex flex-col items-start rounded-xl border-2 p-3 text-left transition-all hover:bg-stone-50 hover:shadow-sm ${
                  isActive ? "border-warmAmber font-semibold" : "border-stone-200 font-normal"
                }`}
                style={{ backgroundColor: preset.colors.card }}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className="text-xs"
                    style={{ color: preset.colors.foreground }}
                  >
                    {preset.label}
                  </span>
                  {isActive && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-warmAmber text-white">
                      <Check className="size-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                {/* Visual preview dots */}
                <div className="mt-3 flex gap-1">
                  <div
                    className="size-3.5 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.colors.background }}
                    title="Background"
                  />
                  <div
                    className="size-3.5 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.colors.primary }}
                    title="Accent"
                  />
                  <div
                    className="size-3.5 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.colors.foreground }}
                    title="Text"
                  />
                </div>
              </button>
            )
          })}

          {/* Custom Theme selection */}
          <button
            onClick={() => setTheme("custom")}
            className={`relative flex flex-col items-start rounded-xl border-2 p-3 text-left transition-all hover:bg-stone-50 hover:shadow-sm bg-white ${
              theme === "custom" ? "border-warmAmber font-semibold" : "border-stone-200 font-normal"
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-xs text-stone-700">Custom Theme</span>
              {theme === "custom" && (
                <span className="flex size-4 items-center justify-center rounded-full bg-warmAmber text-white">
                  <Check className="size-2.5 stroke-[3]" />
                </span>
              )}
            </div>
            {/* Visual preview dots for Custom */}
            <div className="mt-3 flex gap-1">
              <div
                className="size-3.5 rounded-full border border-black/10"
                style={{ backgroundColor: customColors.background }}
                title="Background"
              />
              <div
                className="size-3.5 rounded-full border border-black/10"
                style={{ backgroundColor: customColors.primary }}
                title="Accent"
              />
              <div
                className="size-3.5 rounded-full border border-black/10"
                style={{ backgroundColor: customColors.foreground }}
                title="Text"
              />
            </div>
          </button>
        </div>

        {/* Custom Theme Color Pickers */}
        {theme === "custom" && (
          <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <h4 className="text-sm font-semibold text-stone-700">Design Your Scheme</h4>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="color-primary" className="text-xs font-medium text-stone-600">
                  Primary Accent
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="color-primary"
                    value={customColors.primary}
                    onChange={(e) => handleCustomColorChange("primary", e.target.value)}
                    className="size-8 cursor-pointer rounded border border-stone-300 bg-transparent p-0"
                  />
                  <span className="font-mono text-xs uppercase text-stone-500">
                    {customColors.primary}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="color-background" className="text-xs font-medium text-stone-600">
                  Page Background
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="color-background"
                    value={customColors.background}
                    onChange={(e) => handleCustomColorChange("background", e.target.value)}
                    className="size-8 cursor-pointer rounded border border-stone-300 bg-transparent p-0"
                  />
                  <span className="font-mono text-xs uppercase text-stone-500">
                    {customColors.background}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="color-card" className="text-xs font-medium text-stone-600">
                  Card & Sidebar
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="color-card"
                    value={customColors.card}
                    onChange={(e) => {
                      const val = e.target.value
                      handleCustomColorChange("card", val)
                    }}
                    className="size-8 cursor-pointer rounded border border-stone-300 bg-transparent p-0"
                  />
                  <span className="font-mono text-xs uppercase text-stone-500">
                    {customColors.card}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="color-foreground" className="text-xs font-medium text-stone-600">
                  Primary Text
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="color-foreground"
                    value={customColors.foreground}
                    onChange={(e) => {
                      const val = e.target.value
                      handleCustomColorChange("foreground", val)
                      handleCustomColorChange("cardForeground", val)
                    }}
                    className="size-8 cursor-pointer rounded border border-stone-300 bg-transparent p-0"
                  />
                  <span className="font-mono text-xs uppercase text-stone-500">
                    {customColors.foreground}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="color-mutedText" className="text-xs font-medium text-stone-600">
                  Muted Text
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="color-mutedText"
                    value={customColors.mutedText}
                    onChange={(e) => handleCustomColorChange("mutedText", e.target.value)}
                    className="size-8 cursor-pointer rounded border border-stone-300 bg-transparent p-0"
                  />
                  <span className="font-mono text-xs uppercase text-stone-500">
                    {customColors.mutedText}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="color-border" className="text-xs font-medium text-stone-600">
                  Borders
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="color-border"
                    value={customColors.border}
                    onChange={(e) => handleCustomColorChange("border", e.target.value)}
                    className="size-8 cursor-pointer rounded border border-stone-300 bg-transparent p-0"
                  />
                  <span className="font-mono text-xs uppercase text-stone-500">
                    {customColors.border}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
