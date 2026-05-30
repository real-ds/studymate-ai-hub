"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface SliderProps {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  className?: string
  disabled?: boolean
}

function Slider({
  value,
  defaultValue = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  disabled,
}: SliderProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const currentValue = isControlled ? value : internalValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = [Number(e.target.value)]
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  const percentage = ((currentValue[0] - min) / (max - min)) * 100

  return (
    <div className={cn("relative flex items-center", className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue[0]}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-warmAmber [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-white [&::-webkit-slider-thumb]:transition-all",
          "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-warmAmber [&::-moz-range-thumb]:ring-2 [&::-moz-range-thumb]:ring-white"
        )}
        style={{
          background: `linear-gradient(to right, #C8A96E ${percentage}%, #e5e7eb ${percentage}%)`,
        }}
      />
    </div>
  )
}

export { Slider }
