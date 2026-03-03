'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const navLinks = [
  { href: '#about',    label: 'About'    },
  { href: '#skills',   label: 'Skills'   },
  { href: '#projects', label: 'Projects' },
  { href: '#cv',       label: 'CV'       },
  { href: '#contact',  label: 'Contact'  },
]

const SECTION_IDS = navLinks.map(l => l.href.replace('#', ''))

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, href: string, setActive: (id: string) => void) {
  e.preventDefault()
  const id = href.replace('#', '')
  const el = document.getElementById(id)
  if (!el) return

  // Immediately update active so it doesn't wait for observer
  setActive(id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenis = (window as any).__lenis
  if (lenis) {
    lenis.scrollTo(el, {
      offset: -56,
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export function Navbar() {
  const [active, setActive] = useState<string>('about')

  useEffect(() => {
    const visible = new Set<string>()

    // ── Intersection Observer ─────────────────────────────────────────────
    const observers: IntersectionObserver[] = []

    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return

      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          visible.add(id)
        } else {
          visible.delete(id)
        }
        const first = SECTION_IDS.find(s => visible.has(s))
        if (first) setActive(first)
      }, {
        // -20% top clears the navbar; -70% bottom means section must be in top 30% of screen
        rootMargin: '-56px 0px -70% 0px',
        threshold: 0,
      })

      obs.observe(el)
      observers.push(obs)
    })

    // ── Bottom-of-page → activate Contact ────────────────────────────────
    function onScroll() {
      const atBottom =
        window.scrollY + window.innerHeight >= document.body.scrollHeight - 40
      if (atBottom) setActive('contact')
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observers.forEach(o => o.disconnect())
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">

        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-black transition-opacity hover:opacity-70"
        >
          Portfolio
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden items-center gap-6 sm:flex" aria-label="Main navigation">
          {navLinks.map(({ href, label }) => {
            const id = href.replace('#', '')
            const isActive = active === id
            return (
              <a
                key={href}
                href={href}
                onClick={e => scrollToSection(e, href, setActive)}
                aria-current={isActive ? 'location' : undefined}
                className={[
                  'relative pb-0.5 text-sm transition-colors duration-300',
                  isActive
                    ? 'font-semibold text-black'
                    : 'font-normal text-gray-400 hover:text-gray-700',
                ].join(' ')}
              >
                {label}

                {/* Framer Motion shared underline — slides between links */}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-[18px] left-0 right-0 h-[2.5px] rounded-full bg-black"
                    transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                  />
                )}
              </a>
            )
          })}
        </nav>

        {/* ── Mobile nav ── */}
        <nav className="flex items-center gap-4 sm:hidden" aria-label="Mobile navigation">
          {navLinks.map(({ href, label }) => {
            const id = href.replace('#', '')
            const isActive = active === id
            return (
              <a
                key={href}
                href={href}
                onClick={e => scrollToSection(e, href, setActive)}
                className={[
                  'text-xs transition-all duration-300',
                  isActive ? 'font-semibold text-black' : 'text-gray-400',
                ].join(' ')}
              >
                {label}
              </a>
            )
          })}
        </nav>

      </div>
    </header>
  )
}
