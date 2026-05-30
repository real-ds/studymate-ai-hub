"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

function usePopover() {
  const ctx = React.useContext(PopoverContext)
  if (!ctx) throw new Error("Popover compound components must be used within Popover")
  return ctx
}

function Popover({ children, defaultOpen = false }: { children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      {children}
    </PopoverContext.Provider>
  )
}

function PopoverTrigger({ children, asChild, ...props }: React.HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { setOpen } = usePopover()
  const child = asChild && React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
        onClick: (e: React.MouseEvent) => {
          ;(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>).props.onClick?.(e)
          setOpen(true)
        },
      })
    : children

  if (asChild) return <>{child}</>

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      {...props}
    >
      {children}
    </button>
  )
}

function PopoverContent({
  className,
  children,
  align = "center",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end" }) {
  const { open, setOpen } = usePopover()
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={ref}
      data-align={align}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-lg border bg-popover p-4 text-sm text-popover-foreground shadow-md",
        "data-[align=center]:left-1/2 data-[align=center]:-translate-x-1/2",
        "data-[align=start]:left-0",
        "data-[align=end]:right-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Popover, PopoverTrigger, PopoverContent }
