import { Skill } from '@/features/skills/types'

interface SkillCardProps {
  skill: Skill
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <div className="group rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-black">{skill.name}</span>
        <span className="text-xs text-gray-400">{skill.level}%</span>
      </div>
      {/* Level bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-black transition-all duration-500"
          style={{ width: `${skill.level}%` }}
        />
      </div>
      {skill.category && (
        <span className="mt-2 inline-block text-xs text-gray-400">
          {skill.category}
        </span>
      )}
    </div>
  )
}
