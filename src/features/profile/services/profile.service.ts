import { supabaseClient } from '@/lib/supabase/client'
import { supabaseAdmin } from '@/lib/supabase/server'
import { Profile } from '../types/index'

export const ProfileService = {
  async getPublic(): Promise<Profile | null> {
    const { data } = await supabaseAdmin
      .from('profile')
      .select('*')
      .single()

    return data
  },

  async update(profile: Partial<Profile>) {
    return supabaseAdmin
      .from('profile')
      .update(profile)
      .eq('id', profile.id)
  }
}
