import { supabaseClient } from "@/lib/supabase/client"
import { supabaseAdmin } from "@/lib/supabase/server"
import { CV } from "../types/index"

export const CVService = {
  async get() {
    return supabaseClient.from('cv').select('*')
  },

  async getPublic(): Promise<CV | null> {
    const { data } = await supabaseAdmin
      .from('cv')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
    return data ?? null
  },

  async update(data: Partial<CV>) {
    return supabaseAdmin.from('cv').update(data)
  }
}
