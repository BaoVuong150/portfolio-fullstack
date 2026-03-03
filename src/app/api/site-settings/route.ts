import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { validateApiSession } from '@/lib/auth/api-auth'

export async function GET(request: Request) {
  // SECURITY: Verify user is authenticated
  const { user, response: authError } = await validateApiSession(request)
  if (!user) return authError
  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('*')
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  // SECURITY: Verify user is authenticated
  const { user, response: authError } = await validateApiSession(req)
  if (!user) return authError
  const body = await req.json()

  const { error } = await supabaseAdmin
    .from('site_settings')
    .insert({
      ...body,
      updated_at: new Date(),
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PUT(req: Request) {
  // SECURITY: Verify user is authenticated
  const { user, response: authError } = await validateApiSession(req)
  if (!user) return authError
  const body = await req.json()
  const { id, ...rest } = body

  const { error } = await supabaseAdmin
    .from('site_settings')
    .update({
      ...rest,
      updated_at: new Date(),
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}