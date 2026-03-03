import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { validateApiSession } from '@/lib/auth/api-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // SECURITY: Verify user is authenticated
  const { user, response: authError } = await validateApiSession(request)
  if (!user) return authError
  try {
    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data || [])
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  // SECURITY: Verify user is authenticated
  const { user, response: authError } = await validateApiSession(req)
  if (!user) return authError
  try {
    const { id, is_read } = await req.json()
    const { error } = await supabaseAdmin
      .from('contact_messages')
      .update({ is_read })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  // SECURITY: Verify user is authenticated
  const { user, response: authError } = await validateApiSession(req)
  if (!user) return authError
  try {
    const { id } = await req.json()
    const { error } = await supabaseAdmin
      .from('contact_messages')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}