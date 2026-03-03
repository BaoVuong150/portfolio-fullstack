'use client'

import { Skill } from '@/features/skills/types'
import { SkillCard } from './SkillCard'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { useDragScroll } from '@/hooks/useDragScroll'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
    <section id="skills" className="border-b border-gray-100">
      <div className="mx-auto max-w-5xl px-6 py-20">
        {/* Heading */}
        <RevealOnScroll>
          <div className="mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
              Skills
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Technologies and tools I work with
            </p>
          </div>
        </RevealOnScroll>

        {skills.length === 0 ? (
          <p className="text-sm text-gray-400">No skills listed yet.</p>
        ) : (
          <div className="flex flex-col gap-10">
            {categories.map((category, catIdx) => (
              <SkillCategoryRow 
                key={category} 
                category={category} 
                skills={grouped[category]} 
                catIdx={catIdx} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// Sub-component to hold individual drag refs per category row
function SkillCategoryRow({ category, skills, catIdx }: { category: string, skills: Skill[], catIdx: number }) {
  const { ref: scrollRef, canScrollLeft, canScrollRight, scrollBy } = useDragScroll<HTMLDivElement>()

  return (
    <div>
      <RevealOnScroll delay={catIdx * 0.05}>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
          {category}
        </h3>
      </RevealOnScroll>
      <div className="group relative -mx-6 w-[calc(100%+3rem)] sm:mx-0 sm:w-full">
        {/* Navigation Arrows (Desktop Only) */}
        <button 
          onClick={() => scrollBy(-280)}
          className={`absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2 text-black shadow-md backdrop-blur-sm sm:flex transition-all hover:bg-white hover:scale-105 active:scale-95 ${canScrollLeft ? 'opacity-0 group-hover:opacity-100' : 'pointer-events-none opacity-0'}`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => scrollBy(280)}
          className={`absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2 text-black shadow-md backdrop-blur-sm sm:flex transition-all hover:bg-white hover:scale-105 active:scale-95 ${canScrollRight ? 'opacity-0 group-hover:opacity-100' : 'pointer-events-none opacity-0'}`}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
        </button>

        {/* Left/Right fading masks */}
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-6 bg-gradient-to-r from-white to-transparent sm:w-12" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-6 bg-gradient-to-l from-white to-transparent sm:w-12" />

        <div 
          ref={scrollRef}
          className="flex w-full whitespace-nowrap snap-x snap-mandatory scroll-smooth overscroll-x-contain gap-4 overflow-x-auto overflow-y-hidden px-6 pb-6 pt-2 sm:px-8 cursor-grab active:cursor-grabbing touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {skills.map((skill, i) => (
            <div key={skill.id} className="w-[75vw] sm:w-[280px] flex-shrink-0 whitespace-normal snap-center">
              <RevealOnScroll delay={catIdx * 0.05 + i * 0.06}>
                <SkillCard skill={skill} />
              </RevealOnScroll>
            </div>
          ))}
          {/* Spacer for last item */}
          <div className="w-1 shrink-0 px-2 sm:px-4" />
        </div>
      </div>
    </div>
  )
}
