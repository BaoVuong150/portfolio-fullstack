'use client'

import { useEffect, useRef, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number      // 0 → 1, how far through its lifetime
  maxLife: number   // ms
  born: number      // timestamp
  blur: number
}

// ── Config ─────────────────────────────────────────────────────────────────
const TRAIL_COUNT = 3     // particles per move frame
const BURST_COUNT = 16    // particles on click
const MAX_LIFE    = 700   // ms — trail particles live this long
const BURST_LIFE  = 900   // ms — click burst lives a bit longer

// ── Particle factory ───────────────────────────────────────────────────────
let _id = 0
function makeParticle(
  x: number, y: number,
  isBurst = false,
  now = performance.now()
): Particle {
  const angle   = Math.random() * Math.PI * 2
  const speed   = isBurst
    ? 1.5 + Math.random() * 3.5   // burst: faster spread
    : 0.3 + Math.random() * 0.8   // trail: drifts gently
  const life    = isBurst ? BURST_LIFE : MAX_LIFE

  return {
    id: _id++,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - (isBurst ? 0 : 0.4), // trail floats up slightly
    size: isBurst
      ? 3 + Math.random() * 5
      : 2 + Math.random() * 3,
    opacity: isBurst ? 0.85 : 0.55,
    life: 0,
    maxLife: life,
    born: now,
    blur: isBurst ? Math.random() * 3 : Math.random() * 2,
  }
}

// ── Component ──────────────────────────────────────────────────────────────
export function CursorGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const mouseRef  = useRef({ x: -999, y: -999, visible: false })
  const rafRef    = useRef<number>(0)
  const lastTrail = useRef(0)

  // Spawn particles on every move frame (throttled to ~60fps)
  const handleMove = useCallback((e: PointerEvent) => {
    const mouse = mouseRef.current
    mouse.x = e.clientX
    mouse.y = e.clientY
    mouse.visible = true

    const now = performance.now()
    if (now - lastTrail.current > 16) {   // ~60fps throttle
      lastTrail.current = now
      for (let i = 0; i < TRAIL_COUNT; i++) {
        particles.current.push(makeParticle(e.clientX, e.clientY, false, now))
      }
    }
  }, [])

  // Big burst on click / mousedown
  const handleClick = useCallback((e: MouseEvent) => {
    const now = performance.now()
    for (let i = 0; i < BURST_COUNT; i++) {
      particles.current.push(makeParticle(e.clientX, e.clientY, true, now))
    }
  }, [])

  const handleLeave = useCallback(() => {
    mouseRef.current.visible = false
  }, [])

  useEffect(() => {
    // Disable on touch devices
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Resize canvas to full viewport
    function resize() {
      if (!canvas) return
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // ── RAF draw loop ──────────────────────────────────────────────────────
    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const now = performance.now()
      const alive: Particle[] = []

      for (const p of particles.current) {
        const elapsed = now - p.born
        if (elapsed >= p.maxLife) continue   // expired

        const progress = elapsed / p.maxLife // 0 → 1

        // Ease-out opacity: fade in fast, fade out slow
        const alpha = p.opacity * (1 - Math.pow(progress, 1.5))

        // Update physics
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.015   // subtle gravity

        // Shrink size
        const currentSize = p.size * (1 - progress * 0.6)

        // Draw
        ctx.save()
        if (p.blur > 0) ctx.filter = `blur(${p.blur}px)`
        ctx.globalAlpha = Math.max(0, alpha)
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(0.5, currentSize), 0, Math.PI * 2)
        ctx.fillStyle = '#111111'
        ctx.fill()
        ctx.restore()

        alive.push(p)
      }
      particles.current = alive

      // Draw cursor dot
      const { x, y, visible } = mouseRef.current
      if (visible) {
        ctx.save()
        ctx.globalAlpha = 0.9
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#000'
        ctx.fill()
        ctx.restore()

        // Outer ring
        ctx.save()
        ctx.globalAlpha = 0.12
        ctx.beginPath()
        ctx.arc(x, y, 18, 0, Math.PI * 2)
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 1.2
        ctx.stroke()
        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    document.addEventListener('pointermove', handleMove, { passive: true })
    document.addEventListener('pointerleave', handleLeave)
    document.addEventListener('mousedown', handleClick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      document.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerleave', handleLeave)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [handleMove, handleLeave, handleClick])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ mixBlendMode: 'multiply' }}
    />
  )
}
