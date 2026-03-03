import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { validateApiSession } from '@/lib/auth/api-auth'

export async function GET(request: Request) {
  // SECURITY: Verify user is authenticated
  const { user, response: authError } = await validateApiSession(request)
  if (!user) return authError
  const { data, error } = await supabaseAdmin
    .from('profile')
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(req: Request) {
  // SECURITY: Verify user is authenticated
  const { user, response: authError } = await validateApiSession(req)
  if (!user) return authError
  const body = await req.json()

  const { error } = await supabaseAdmin
    .from('profile')
    .update({
      full_name: body.full_name,
      title:     body.title,
      bio:       body.bio,
      goal:      body.goal,
      avatar_url: body.avatar_url,
      email:     body.email,
      github:    body.github,
      linkedin:  body.linkedin,
      updated_at: new Date()
    })
    .eq('id', body.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}