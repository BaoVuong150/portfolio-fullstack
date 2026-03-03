'use client'

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
          <div className="group relative -mx-6 w-[calc(100%+3rem)] sm:mx-0 sm:w-full">
            {/* Navigation Arrows (Desktop Only) */}
            <button 
              onClick={() => scrollBy(-350)}
              className={`absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2.5 text-black shadow-lg backdrop-blur-sm sm:flex transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95 ${canScrollLeft ? 'opacity-0 group-hover:opacity-100' : 'pointer-events-none opacity-0'}`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => scrollBy(350)}
              className={`absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2.5 text-black shadow-lg backdrop-blur-sm sm:flex transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95 ${canScrollRight ? 'opacity-0 group-hover:opacity-100' : 'pointer-events-none opacity-0'}`}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            </button>

            {/* Left/Right fading masks */}
            <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-white to-transparent sm:w-16" />
            <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-white to-transparent sm:w-16" />

            <div 
              ref={scrollRef}
              className="flex w-full whitespace-nowrap snap-x snap-mandatory scroll-smooth overscroll-x-contain gap-6 overflow-x-auto overflow-y-hidden px-6 pb-12 pt-4 sm:px-8 cursor-grab active:cursor-grabbing touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {projects.map((project, i) => (
                <div key={project.id} className="w-[85vw] sm:w-[350px] flex-shrink-0 whitespace-normal snap-center">
                  <RevealOnScroll delay={i * 0.08}>
                    <ProjectCard project={project} />
                  </RevealOnScroll>
                </div>
              ))}
              {/* Spacer for last item */}
              <div className="w-1 shrink-0 px-2 sm:px-4" />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
