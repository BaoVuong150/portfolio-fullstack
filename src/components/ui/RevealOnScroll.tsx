'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface RevealOnScrollProps {
  children: ReactNode
  /** Stagger delay in seconds (default 0) */
  delay?: number
  /** y offset to start from in px (default 24) */
  y?: number
  className?: string
}

/**
 * Swiss-style reveal: snappy, mechanical, precise.
 * Uses ease-out with short duration — no elastic/spring.
 */
export function RevealOnScroll({
  children,
  delay = 0,
  y = 24,
  className,
}: RevealOnScrollProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.35,
        delay,
        ease: [0.33, 0, 0, 1], // fast-out, instant feel
      }}
    >
      {children}
    </motion.div>
  )
}
