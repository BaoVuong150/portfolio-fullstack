import { ProfileService } from '@/features/profile/services/profile.service'
import { SkillsService } from '@/features/skills/services/skills.service'
import { ProjectsService } from '@/features/projects/services/projects.service'
import { CVService } from '@/features/cv/services/cv.service'
import { HeroSection } from '@/features/profile/components/HeroSection'
import { SkillsSection } from '@/features/skills/components/SkillsSection'
import { ProjectsSection } from '@/features/projects/components/ProjectsSection'
import { CVSection } from '@/features/cv/components/CVSection'
import { ContactSection } from '@/features/contacts/components/ContactSection'

// Always fetch fresh data — no static cache so admin saves reflect immediately
export const revalidate = 0

export default async function Home() {
  const [profile, skills, projects, cv] = await Promise.all([
    ProfileService.getPublic(),
    SkillsService.getAllPublic(),
    ProjectsService.getAllPublic(),
    CVService.getPublic(),
  ])

  return (
    <>
      <HeroSection profile={profile} />
      <SkillsSection skills={skills} />
      <ProjectsSection projects={projects} />
      <CVSection cv={cv} />
      <ContactSection />
    </>
  )
}
