import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { validateApiSession } from '@/lib/auth/api-auth'

export async function GET(request: Request) {
  // SECURITY: Verify user is authenticated
  const { user, response: authError } = await validateApiSession(request)
  if (!user) return authError
  const [
    projects,
    featured,
    skills,
    contactsUnread,
    cv,
    profile,
  ] = await Promise.all([
    supabaseAdmin.from('projects').select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('is_featured', true),
    supabaseAdmin.from('skills').select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false),
    supabaseAdmin.from('cv').select('id').limit(1).single(),
    supabaseAdmin.from('profile').select('id').limit(1).single(),
  ])

  return NextResponse.json({
    totalProjects: projects.count || 0,
    featuredProjects: featured.count || 0,
    totalSkills: skills.count || 0,
    unreadMessages: contactsUnread.count || 0,
    hasCV: !!cv.data,
    hasProfile: !!profile.data,
  })
}