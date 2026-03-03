import { supabaseAdmin } from '@/lib/supabase/server'
import { SiteSettings } from '../types/index'

export const SiteSettingsService = {
  // LẤY 1 ROW DUY NHẤT
  async get() {
    return supabaseAdmin
      .from('site_settings')
      .select('*')
      .single()
  },

  // UPDATE TOÀN BỘ (VÌ CHỈ CÓ 1 ROW)
  async update(data: Partial<SiteSettings>) {
    return supabaseAdmin
      .from('site_settings')
      .update(data)
  },
}
