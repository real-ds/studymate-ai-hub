"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: { value: string; label: string }[]
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, options, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-9 w-full appearance-none items-center rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm outline-none transition-colors",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[&>option]:bg-background",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
