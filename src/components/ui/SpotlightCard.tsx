'use client'

import { useRef, useState, MouseEvent, ReactNode, CSSProperties } from 'react'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
}

/**
 * Wraps children in a card that shows a soft radial spotlight
 * following the mouse cursor inside the card boundary.
 *
 * Each card manages its own hover state independently via React state
 * instead of CSS `group-hover` to prevent the "all cards light up" bug
 * when the cursor is inside a parent element marked as `group`.
 */
export function SpotlightCard({ children, className = '' }: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    card.style.setProperty('--mx', `${x}%`)
    card.style.setProperty('--my', `${y}%`)
  }

  function handleMouseEnter() {
    setIsHovered(true)
  }

  function handleMouseLeave() {
    const card = cardRef.current
    if (!card) return
    // Reset so spotlight fades out gracefully via CSS transition
    card.style.setProperty('--mx', '50%')
    card.style.setProperty('--my', '50%')
    setIsHovered(false)
  }

  const style: CSSProperties & Record<string, string> = {
    '--mx': '50%',
    '--my': '50%',
    position: 'relative',
    overflow: 'hidden',
  }

  return (
    <div
      ref={cardRef}
      className={`spotlight-card ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Spotlight overlay — each card self-manages via isHovered (not CSS group) */}
      <div
        aria-hidden="true"
        className="spotlight-glow pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{ opacity: isHovered ? 1 : 0 }}
      />
      {children}
    </div>
  )
}
