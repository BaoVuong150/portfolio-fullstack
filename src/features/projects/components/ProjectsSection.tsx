'use client'

import { Project } from '@/features/projects/types'
import { ProjectCard } from './ProjectCard'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

interface ProjectsSectionProps {
  projects: Project[]
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="projects" className="border-b-4 border-black">
      <div className="mx-auto max-w-6xl px-6">

        {/* Section header */}
        <div className="border-b border-black/10 py-6">
          <span className="swiss-section-number">03. Projects</span>
        </div>

        <div className="py-16 lg:py-24">
          {/* Heading — asymmetric with sidebar text */}
          <RevealOnScroll>
            <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <h2 className="swiss-heading text-5xl text-black sm:text-7xl lg:text-8xl">
                  Selected<br />
                  <span className="text-[#FF3000]">Work</span>
                </h2>
              </div>
              <div className="flex items-end lg:col-span-4">
                <div className="flex flex-col gap-3">
                  <p className="text-sm leading-relaxed text-[#666]">
                    A curated selection of projects that demonstrate my range of
                    skills and creative problem-solving approach.
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-black/10" />
                    <span className="text-3xl font-black tabular-nums text-black">
                      {String(projects.length).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#999]">
                      Projects
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {projects.length === 0 ? (
            <p className="text-xs font-bold uppercase tracking-widest text-[#999]">
              No projects to display yet.
            </p>
          ) : (
            /* Grid layout — visible structure, not carousel */
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, i) => (
                <RevealOnScroll key={project.id} delay={i * 0.06}>
                  <ProjectCard project={project} index={i} />
                </RevealOnScroll>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
