import { Skill } from '@/features/skills/types'

interface SkillCardProps {
  skill: Skill
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <div className="group border-2 border-black bg-white p-5 transition-all duration-150 hover:bg-black hover:text-white">
      {/* Header */}
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-bold uppercase tracking-wider text-black transition-colors duration-150 group-hover:text-white">
          {skill.name}
        </span>
        <span className="text-2xl font-black tabular-nums text-black transition-colors duration-150 group-hover:text-[#FF3000]">
          {skill.level}
        </span>
      </div>

      {/* Level bar — Swiss style: thick, no rounded corners */}
      <div className="h-1 w-full bg-[#F2F2F2] transition-colors duration-150 group-hover:bg-white/20">
        <div
          className="h-full bg-black transition-all duration-500 group-hover:bg-[#FF3000]"
          style={{ width: `${skill.level}%` }}
        />
      </div>

      {/* Category label */}
      {skill.category && (
        <span className="mt-3 inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] transition-colors duration-150 group-hover:text-white/50">
          {skill.category}
        </span>
      )}
    </div>
  )
}
