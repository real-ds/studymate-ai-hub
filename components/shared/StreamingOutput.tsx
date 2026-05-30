"use client"

import { useEffect, useState } from "react"

interface StreamingOutputProps {
  text: string
  speed?: number
}

export default function StreamingOutput({
  text,
  speed = 30,
}: StreamingOutputProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setDisplayedText("")
    setIsComplete(false)
    /* eslint-enable react-hooks/set-state-in-effect */
    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <span>
      {displayedText}
      {!isComplete && (
        <span className="animate-pulse text-warmAmber">|</span>
      )}
    </span>
  )
}
