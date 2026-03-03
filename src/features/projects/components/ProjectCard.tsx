import Image from 'next/image'
import { Project } from '@/features/projects/types'
import { getProjectThumbnail } from '@/lib/utils/image'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const thumbnail = getProjectThumbnail(project.image_url)

  return (
    <SpotlightCard className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:border-gray-300 hover:shadow-md">
      {/* Image — aspect-video enforces strict 16:9 */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
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

      {/* Content */}
      <div className="relative z-20 flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-base font-semibold text-black leading-tight">
          {project.title}
        </h3>

        {project.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-gray-500">
            {project.description}
          </p>
        )}

        {/* Tech Stack */}
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
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
        <div className="mt-2 flex items-center gap-3 border-t border-gray-50 pt-3">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-gray-500 transition-colors hover:text-black"
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
            >
              Live Demo ↗
            </a>
          )}
          {!project.github_url && !project.demo_url && (
            <span className="text-xs text-gray-300">No links provided</span>
          )}
        </div>
      </div>
    </SpotlightCard>
  )
}
