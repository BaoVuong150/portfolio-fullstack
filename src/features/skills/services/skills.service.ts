import { supabaseClient } from "@/lib/supabase/client"
import { supabaseAdmin } from "@/lib/supabase/server"
import { Skill } from "../types/index"

export const SkillsService = {
  getAll() {
    return supabaseClient.from('skills')
      .select('*')
      .order('level', { ascending: false })
  },

  async getAllPublic(): Promise<Skill[]> {
    const { data } = await supabaseAdmin
      .from('skills')
      .select('*')
      .order('level', { ascending: false })
    return data ?? []
  },

  create(data: Partial<Skill>) {
    return supabaseAdmin
      .from('skills')
      .insert(data)
  }
}
