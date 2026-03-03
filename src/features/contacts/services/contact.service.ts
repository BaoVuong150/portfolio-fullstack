import { supabaseClient } from "@/lib/supabase/client"
import { supabaseAdmin } from "@/lib/supabase/server"

export const ContactService = {
 async send(data: { name: string; email: string; message: string }) {
  const res = await supabaseClient
    .from('contact_messages')
    .insert(data)

  return res
},

  async getAll() {
    return supabaseAdmin
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
  }
}
