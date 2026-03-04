'use client'

import { useState } from 'react'
import { Project } from '@/features/projects/types'
import { ProjectCard } from './ProjectCard'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { useDragScroll } from '@/hooks/useDragScroll'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProjectsSectionProps {
  projects: Project[]
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const { ref: scrollRef, canScrollLeft, canScrollRight, scrollBy } = useDragScroll<HTMLDivElement>()
  const [isScrollerHovered, setIsScrollerHovered] = useState(false)

  return (
    <section id="projects" className="border-b border-gray-100">
      <div className="mx-auto max-w-5xl px-6 py-20">
        {/* Heading */}
        <RevealOnScroll>
          <div className="mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
              Projects
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              A selection of work I&apos;ve built
            </p>
          </div>
        </RevealOnScroll>

        {projects.length === 0 ? (
          <p className="text-sm text-gray-400">No projects to display yet.</p>
        ) : (
          <div
            className="relative -mx-6 w-[calc(100%+3rem)] sm:mx-0 sm:w-full"
            onMouseEnter={() => setIsScrollerHovered(true)}
            onMouseLeave={() => setIsScrollerHovered(false)}
          >
            {/* Navigation Arrows — visible on hover + can scroll, z-30 above masks */}
            <button
              onPointerDown={(e) => {
                // Prevent wrapper onMouseLeave from firing before click registers
                e.stopPropagation()
                scrollBy(-370)
              }}
              className={[
                'absolute left-3 top-1/2 z-30 -translate-y-1/2',
                'hidden sm:flex items-center justify-center',
                'h-9 w-9 rounded-full bg-white shadow-md ring-1 ring-gray-200',
                'transition-all duration-200 hover:bg-gray-50 hover:scale-105 active:scale-95',
                canScrollLeft && isScrollerHovered
                  ? 'opacity-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none',
              ].join(' ')}
              aria-label="Scroll left"
              tabIndex={canScrollLeft ? 0 : -1}
            >
              <ChevronLeft className="h-4 w-4 text-gray-700" strokeWidth={2.5} />
            </button>

            <button
              onPointerDown={(e) => {
                e.stopPropagation()
                scrollBy(370)
              }}
              className={[
                'absolute right-3 top-1/2 z-30 -translate-y-1/2',
                'hidden sm:flex items-center justify-center',
                'h-9 w-9 rounded-full bg-white shadow-md ring-1 ring-gray-200',
                'transition-all duration-200 hover:bg-gray-50 hover:scale-105 active:scale-95',
                canScrollRight && isScrollerHovered
                  ? 'opacity-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none',
              ].join(' ')}
              aria-label="Scroll right"
              tabIndex={canScrollRight ? 0 : -1}
            >
              <ChevronRight className="h-4 w-4 text-gray-700" strokeWidth={2.5} />
            </button>

            {/* Edge fade masks — z-10, pointer-events-none so arrows above still clickable */}
            <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-10 bg-gradient-to-r from-white to-transparent sm:w-16" />
            <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-10 bg-gradient-to-l from-white to-transparent sm:w-16" />

            {/* Scroll container */}
            <div
              ref={scrollRef}
              className="flex w-full items-stretch snap-x snap-mandatory scroll-smooth overscroll-x-contain gap-6 overflow-x-auto overflow-y-hidden px-6 pb-12 pt-4 sm:px-8 cursor-grab active:cursor-grabbing touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {projects.map((project, i) => (
                <div
                  key={project.id}
                  className="flex h-auto flex-col w-[85vw] flex-shrink-0 snap-center whitespace-normal sm:w-[350px]"
                >
                  <RevealOnScroll delay={i * 0.08} className="flex flex-1 flex-col">
                    <ProjectCard project={project} />
                  </RevealOnScroll>
                </div>
              ))}
              {/* Trailing spacer so last card isn't flush with the right edge */}
              <div className="w-1 shrink-0 px-2 sm:px-4" />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
