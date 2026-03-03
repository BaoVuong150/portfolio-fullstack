'use client'

import { supabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function AdminHeader() {
  async function handleLogout() {
    try {
      // Step 1: Sign out at the client
      await supabaseClient.auth.signOut()
      
      // Step 2: Show toast notification
      toast.success('Logged out!', {
        description: 'Redirecting to login page...',
      })
      
      // Step 3: Full page reload to clear ALL Next.js caches
      // window.location.href forces browser to reload from server
      setTimeout(() => {
        window.location.href = '/admin/login'
      }, 500)
    } catch (err: any) {
      toast.error('Logout failed', {
        description: err?.message || 'Cannot log out',
      })
    }
  }

  return (
    <div className="flex justify-between items-center p-4 border-b bg-white shadow-sm">
      <div className="font-semibold text-gray-800">Admin Dashboard</div>
      <div className="flex gap-4 items-center">
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          View Public Site
        </a>
        <Button variant="destructive" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  )
}