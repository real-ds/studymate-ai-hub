"use client"

import React from "react"

interface FeatureGuardProps {
  children: React.ReactNode
}

export default function FeatureGuard({ children }: FeatureGuardProps) {
  return <>{children}</>
}
