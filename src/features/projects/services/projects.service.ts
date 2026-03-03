import { Project } from "../types"
import { supabaseClient } from "@/lib/supabase/client"
import { supabaseAdmin } from "@/lib/supabase/server"

export const ProjectsService = {
  getAll() {
    return supabaseClient.from('projects').select('*')
  },

  getFeatured() {
    return supabaseClient
      .from('projects')
      .select('*')
      .eq('is_featured', true)
  },

  async getAllPublic(): Promise<Project[]> {
    const { data } = await supabaseAdmin
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    return data ?? []
  },

  async getFeaturedPublic(): Promise<Project[]> {
    const { data } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
    return data ?? []
  },

  create(data: Partial<Project>) {
    return supabaseAdmin.from('projects').insert(data)
  }
}
