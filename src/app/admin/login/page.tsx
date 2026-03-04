'use client'

import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Invalid email or password',
  'Email not confirmed': 'Email not confirmed',
  'Invalid email': 'Invalid email',
  'Weak password': 'Password must be at least 8 characters',
  'over_request_rate_limit': 'Too many requests, please try again later',
}

export default function AdminLoginPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isChecking, setIsChecking] = useState(true) // Track if we're checking auth status
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // SECURITY: Secondary protection layer - check if user is already authenticated
  // If yes, redirect to dashboard immediately (catches case where middleware might miss it)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser()
        
        if (user) {
          window.location.href = '/admin'
          return
        }
        
        // No user logged in - safe to show login form
        setIsChecking(false)
      } catch {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [])

  const validateInputs = (): boolean => {
    if (!email.trim()) {
      toast.error('Require email', { description: 'Email cannot be empty' })
      return false
    }
    if (!password.trim()) {
      toast.error('Require password', { description: 'Password cannot be empty' })
      return false
    }
    if (password.length < 6) {
      toast.error('Password too short', { description: 'Password must be at least 6 characters' })
      return false
    }
    return true
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate inputs before sending request
    if (!validateInputs()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // Map Supabase error codes to English messages
        const message = ERROR_MESSAGES[authError.message] || authError.message || 'Unknown error'
        setError(message)
        toast.error('Login failed', {
          description: message,
        })
        setLoading(false)
        return
      }

      // CRITICAL: Verify session is active before redirecting
      // This ensures the auth tokens are properly set in middleware
      const { error: sessionError } = await supabaseClient.auth.getUser()
      if (sessionError) {
        toast.error('Authentication error', {
          description: 'Could not verify login session',
        })
        setLoading(false)
        return
      }

      // Show success notification with English message
      toast.success('Login successful!', {
        description: 'Redirecting to dashboard...',
      })

      // CRITICAL: Get session to ensure cookies are set
      // This triggers Supabase to set cookies in the browser
      const { error: getSessionError } = await supabaseClient.auth.getSession()

      window.location.href = '/admin'
    } catch (err: any) {
      const message = err?.message || 'An unexpected error occurred'
      setError(message)
      toast.error('Error', { description: message })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {isChecking ? (
        // Show loading state while checking authentication
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          <p className="text-center text-gray-600">Checking access rights...</p>
        </div>
      ) : (
        // Show login form only if not authenticated
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            Admin Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          {/* Demo credentials — for recruiter review only */}
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-xs text-gray-500">
            <p className="mb-1 font-semibold uppercase tracking-widest text-gray-400">Demo Access</p>
            <p>Email: <span className="font-mono text-gray-700">giabao@gmail.com</span></p>
            <p>Password: <span className="font-mono text-gray-700">123456</span></p>
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        </div>
      )}
    </div>
  )
}