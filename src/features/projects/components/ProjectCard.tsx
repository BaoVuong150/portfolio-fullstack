'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Project } from '@/features/projects/types'
import { getProjectThumbnail } from '@/lib/utils/image'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isImgHovered, setIsImgHovered] = useState(false)
  const descRef = useRef<HTMLParagraphElement>(null)
  const thumbnail = getProjectThumbnail(project.image_url)

  // Only show "See more" if description is long enough to actually clamp
  const isLong = (project.description?.length ?? 0) > 120

  return (
    <SpotlightCard className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:border-gray-300 hover:shadow-md">
      {/* Image — aspect-video enforces strict 16:9; zoom via local state (not CSS group) */}
      <div
        className="relative aspect-video w-full flex-shrink-0 overflow-hidden bg-gray-50"
        onMouseEnter={() => setIsImgHovered(true)}
        onMouseLeave={() => setIsImgHovered(false)}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-transform duration-500 ${isImgHovered ? 'scale-110' : 'scale-100'}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs font-medium uppercase tracking-widest text-gray-300">
              No preview
            </span>
          </div>
        )}

        {project.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-black px-2 py-0.5 text-xs font-medium text-white">
            Featured
          </span>
        )}
      </div>

      {/* Content — flex-1 so it fills remaining card height */}
      <div className="relative z-20 flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-base font-semibold leading-tight text-black">
          {project.title}
        </h3>

        {project.description && (
          <div className="mb-4">
            <p
              ref={descRef}
              className={`text-sm leading-relaxed text-gray-500 transition-all duration-300 ${!isExpanded ? 'line-clamp-3' : ''}`}
            >
              {project.description}
            </p>
            {isLong && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
                className="mt-1 text-xs font-medium text-indigo-500 transition-colors hover:text-indigo-700"
              >
                {isExpanded ? '↑ See less' : '↓ See more'}
              </button>
            )}
          </div>
        )}

        {/* Footer — always pinned to the bottom of the card via mt-auto */}
        <div className="mt-auto flex flex-col gap-3">
          {/* Tech Stack */}
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-gray-100 pt-3">
              {project.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          <div className={`flex items-center gap-4 ${!project.tech_stack?.length ? 'border-t border-gray-100 pt-3' : ''}`}>
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-gray-500 transition-colors hover:text-black"
                title="View Source on GitHub"
              >
                GitHub ↗
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-gray-500 transition-colors hover:text-black"
                title="View Live Demo"
              >
                Live Demo ↗
              </a>
            )}
            {!project.github_url && !project.demo_url && (
              <span className="text-xs text-gray-300">No links provided</span>
            )}
          </div>
        </div>
      </div>
    </SpotlightCard>
  )
}
