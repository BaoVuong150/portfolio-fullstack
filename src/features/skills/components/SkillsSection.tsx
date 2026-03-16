'use client'

import { Skill } from '@/features/skills/types'
import { SkillCard } from './SkillCard'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

interface SkillsSectionProps {
  skills: Skill[]
}

type GroupedSkills = Record<string, Skill[]>

export function SkillsSection({ skills }: SkillsSectionProps) {
  const grouped: GroupedSkills = skills.reduce<GroupedSkills>((acc, skill) => {
    const cat = skill.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {})

  const categories = Object.keys(grouped).sort()

  return (
    <section id="skills" className="border-b-4 border-black">
      <div className="mx-auto max-w-6xl px-6">

        {/* Section header */}
        <div className="border-b border-black/10 py-6">
          <span className="swiss-section-number">02. Skills</span>
        </div>

        <div className="py-16 lg:py-24">
          {/* Heading */}
          <RevealOnScroll>
            <div className="mb-16 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h2 className="swiss-heading text-5xl text-black sm:text-7xl lg:text-8xl">
                  Skills &<br />
                  <span className="text-[#FF3000]">Tools</span>
                </h2>
              </div>
              <div className="flex items-end lg:col-span-5">
                <p className="max-w-sm text-sm leading-relaxed text-[#666]">
                  Technologies and tools I work with daily.
                  Each one carefully selected for maximum productivity and quality output.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          {skills.length === 0 ? (
            <p className="text-xs font-bold uppercase tracking-widest text-[#999]">
              No skills listed yet.
            </p>
          ) : (
            <div className="flex flex-col gap-16">
              {categories.map((category, catIdx) => (
                <div key={category}>
                  {/* Category header */}
                  <RevealOnScroll delay={catIdx * 0.05}>
                    <div className="mb-6 flex items-center gap-4">
                      <div className="h-3 w-3 bg-[#FF3000]" />
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-black">
                        {category}
                      </h3>
                      <div className="h-px flex-1 bg-black/10" />
                      <span className="text-xs font-bold tabular-nums text-[#999]">
                        {grouped[category].length}
                      </span>
                    </div>
                  </RevealOnScroll>

                  {/* Skills grid — proper grid, no carousel */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {grouped[category].map((skill, i) => (
                      <RevealOnScroll key={skill.id} delay={catIdx * 0.05 + i * 0.04}>
                        <SkillCard skill={skill} />
                      </RevealOnScroll>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
