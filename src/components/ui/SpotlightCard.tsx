'use client'

import { useRef, MouseEvent, ReactNode, CSSProperties } from 'react'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
}

/**
 * Wraps children in a card that shows a soft radial spotlight
 * following the mouse cursor inside the card boundary.
 *
 * How it works:
 *  - onMouseMove: compute relative X/Y and store as CSS vars
 *  - ::before pseudo-element uses those vars in a radial-gradient
 *    (we inject this via a style prop instead to avoid needing CSS-in-JS)
 */
export function SpotlightCard({ children, className = '' }: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    card.style.setProperty('--mx', `${x}%`)
    card.style.setProperty('--my', `${y}%`)
  }

  function handleMouseLeave() {
    const card = cardRef.current
    if (!card) return
    // Reset so spotlight fades out gracefully via CSS transition
    card.style.setProperty('--mx', '50%')
    card.style.setProperty('--my', '50%')
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
      onMouseLeave={handleMouseLeave}
    >
      {/* Spotlight overlay — rendered as an absolutely positioned div */}
      <div
        aria-hidden="true"
        className="spotlight-glow pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {children}
    </div>
  )
}
