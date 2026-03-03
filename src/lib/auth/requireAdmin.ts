import { supabaseAdmin } from "@/lib/supabase/server";

export async function requireAdmin(token: string) {
  const { data } = await supabaseAdmin.auth.getUser(token);
  if (!data.user) throw new Error("Unauthorized");
  if (data.user.app_metadata.role !== "admin") {
    throw new Error("Forbidden: You are not an admin");
  }

  return data.user;
}
