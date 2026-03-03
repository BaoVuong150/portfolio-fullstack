
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // SECURITY: Server-side session check - "Double Gate" protection
  // Even if middleware fails, this prevents unauthorized access
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // If not authenticated, redirect immediately on server
  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 min-h-screen bg-gray-50">
        <AdminHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
