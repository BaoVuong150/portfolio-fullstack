'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const navLinks = [
  { href: '#about',    label: 'About',    num: '01' },
  { href: '#skills',   label: 'Skills',   num: '02' },
  { href: '#projects', label: 'Projects', num: '03' },
  { href: '#cv',       label: 'CV',       num: '04' },
  { href: '#contact',  label: 'Contact',  num: '05' },
]

const SECTION_IDS = navLinks.map(l => l.href.replace('#', ''))

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, href: string, setActive: (id: string) => void) {
  e.preventDefault()
  const id = href.replace('#', '')
  const el = document.getElementById(id)
  if (!el) return

  setActive(id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenis = (window as any).__lenis
  if (lenis) {
    lenis.scrollTo(el, {
      offset: -64,
      duration: 1.2,
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
        rootMargin: '-64px 0px -70% 0px',
        threshold: 0,
      })

      obs.observe(el)
      observers.push(obs)
    })

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
    <header className="fixed top-0 left-0 right-0 z-50 border-b-4 border-black bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">

        {/* Logo / Name */}
        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          {/* Geometric mark */}
          <div className="relative flex h-8 w-8 items-center justify-center border-2 border-black transition-colors duration-150 group-hover:bg-[#FF3000] group-hover:border-[#FF3000]">
            <span className="text-xs font-black text-black transition-colors duration-150 group-hover:text-white">P</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-black">
            Portfolio
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main navigation">
          {navLinks.map(({ href, label, num }) => {
            const id = href.replace('#', '')
            const isActive = active === id
            return (
              <a
                key={href}
                href={href}
                onClick={e => scrollToSection(e, href, setActive)}
                aria-current={isActive ? 'location' : undefined}
                className={[
                  'relative px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-150',
                  isActive
                    ? 'bg-black text-white'
                    : 'text-black hover:bg-[#FF3000] hover:text-white',
                ].join(' ')}
              >
                <span className={`mr-1.5 ${isActive ? 'text-[#FF3000]' : 'text-[#999]'} transition-colors duration-150`}>
                  {num}
                </span>
                {label}
              </a>
            )
          })}
        </nav>

        {/* ── Mobile nav ── */}
        <nav className="flex items-center gap-0 sm:hidden" aria-label="Mobile navigation">
          {navLinks.map(({ href, label }) => {
            const id = href.replace('#', '')
            const isActive = active === id
            return (
              <a
                key={href}
                href={href}
                onClick={e => scrollToSection(e, href, setActive)}
                className={[
                  'px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-150',
                  isActive
                    ? 'bg-black text-white'
                    : 'text-black',
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
