"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  onError?: () => void
}

const AvatarContext = React.createContext<{
  size: "sm" | "md" | "lg"
  hasError: boolean
  setHasError: (v: boolean) => void
} | null>(null)

function Avatar({
  className,
  size = "md",
  children,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false)

  return (
    <AvatarContext.Provider value={{ size, hasError, setHasError }}>
      <div
        data-slot="avatar"
        data-size={size}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          "data-[size=sm]:size-8 data-[size=md]:size-10 data-[size=lg]:size-14",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AvatarContext.Provider>
  )
}

function AvatarImage({ className, onError, ...props }: AvatarImageProps) {
  const ctx = React.useContext(AvatarContext)
  const [imgError, setImgError] = React.useState(false)

  if (imgError) return null

  return (
    <img
      data-slot="avatar-image"
      className={cn("aspect-square h-full w-full object-cover", className)}
      onError={() => {
        setImgError(true)
        ctx?.setHasError(true)
        onError?.()
      }}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(AvatarContext)

  if (ctx && !ctx.hasError) return null

  return (
    <div
      data-slot="avatar-fallback"
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground",
        "data-[size=sm]:text-xs data-[size=md]:text-sm data-[size=lg]:text-base",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
