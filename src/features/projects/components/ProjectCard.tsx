'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Project } from '@/features/projects/types'
import { getProjectThumbnail } from '@/lib/utils/image'

interface ProjectCardProps {
  project: Project
  index: number
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const descRef = useRef<HTMLParagraphElement>(null)
  const thumbnail = getProjectThumbnail(project.image_url)

  const isLong = (project.description?.length ?? 0) > 120
  const num = String(index + 1).padStart(2, '0')

  return (
    <div className="group flex h-full flex-col border-2 border-black bg-white transition-all duration-150">

      {/* Image — strict aspect ratio, no rounded corners */}
      <div className="relative aspect-video w-full flex-shrink-0 overflow-hidden border-b-2 border-black bg-[#F2F2F2]">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="swiss-diagonal flex h-full w-full items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#999]">
              No Preview
            </span>
          </div>
        )}

        {/* Project number overlay */}
        <div className="absolute left-0 top-0 bg-black px-3 py-2">
          <span className="text-xs font-black text-white">{num}</span>
        </div>

        {project.is_featured && (
          <div className="absolute right-0 top-0 bg-[#FF3000] px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-3 text-lg font-black uppercase tracking-tight text-black">
          {project.title}
        </h3>

        {project.description && (
          <div className="mb-4">
            <p
              ref={descRef}
              className={`text-sm leading-relaxed text-[#666] transition-all duration-200 ${!isExpanded ? 'line-clamp-3' : ''}`}
            >
              {project.description}
            </p>
            {isLong && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
                className="mt-2 text-xs font-bold uppercase tracking-wider text-[#FF3000] transition-colors duration-150 hover:text-black"
              >
                {isExpanded ? '↑ Less' : '↓ More'}
              </button>
            )}
          </div>
        )}

        {/* Footer — pinned to bottom */}
        <div className="mt-auto flex flex-col gap-4">
          {/* Tech Stack */}
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t-2 border-black/10 pt-4">
              {project.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="border border-black bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black transition-all duration-150 group-hover:border-[#FF3000] group-hover:text-[#FF3000]"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          <div className={`flex items-center gap-4 ${!project.tech_stack?.length ? 'border-t-2 border-black/10 pt-4' : ''}`}>
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black transition-colors duration-150 hover:text-[#FF3000]"
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
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black transition-colors duration-150 hover:text-[#FF3000]"
                title="View Live Demo"
              >
                Demo ↗
              </a>
            )}
            {!project.github_url && !project.demo_url && (
              <span className="text-xs font-bold uppercase tracking-wider text-[#CCC]">No links</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
