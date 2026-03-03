'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface RevealOnScrollProps {
  children: ReactNode
  /** Stagger delay in seconds (default 0) */
  delay?: number
  /** y offset to start from in px (default 32) */
  y?: number
  className?: string
}

export function RevealOnScroll({
  children,
  delay = 0,
  y = 32,
  className,
}: RevealOnScrollProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98], // custom cubic — fast start, gentle end
      }}
    >
      {children}
    </motion.div>
  )
}
