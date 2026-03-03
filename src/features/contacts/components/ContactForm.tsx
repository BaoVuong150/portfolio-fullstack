'use client'

import { useState, FormEvent, useRef, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface FormState {
  name: string
  email: string
  message: string
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

// ── Validation helpers ──────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validateForm(form: FormState): string | null {
  const name    = form.name.trim()
  const email   = form.email.trim()
  const message = form.message.trim()

  if (name.length < 2)
    return 'Name must be at least 2 characters.'

  // ── Email is now REQUIRED ────────────────────────────────────────────────
  if (email.length === 0)
    return 'Invalid email. Please provide a valid email so I can respond!'

  if (!email.includes('@'))
    return 'Invalid email. Please provide a valid email so I can respond!'

  if (!EMAIL_RE.test(email))
    return 'Invalid email. Please provide a valid email so I can respond!'

  if (message.length < 10)
    return `Message is too short — must be at least 10 characters (currently ${message.length}).`

  return null   // all good
}

// ── Derived disabled logic (for the button) ─────────────────────────────────
function isFormReadyToSubmit(form: FormState): boolean {
  return (
    form.name.trim().length >= 2 &&
    EMAIL_RE.test(form.email.trim()) &&
    form.message.trim().length >= 10
  )
}

// ── Supabase lazy init ──────────────────────────────────────────────────────
let supabaseInstance: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseInstance
}

export function ContactForm() {
  const supabase = getSupabase()
  const [form, setForm]     = useState<FormState>({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [isAdmin, setIsAdmin] = useState(false)

  // ── Detect admin by email ────────────────────────────────────────────────
  const ADMIN_EMAIL = 'giabao@gmail.com'

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setIsAdmin(user.email === ADMIN_EMAIL)
    })
  }, [supabase])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (status === 'error') setStatus('idle')
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // ── Admin guard — runs before any Supabase call ──────────────────────────
    if (isAdmin) {
      toast.error(
        '⚠️ You are an Admin, please do not send test messages here!',
        { id: 'admin-block', duration: 5000 }  // deduped — multiple clicks = 1 toast
      )
      return   // ⛔ Hard stop — supabase.from().insert() is NEVER reached
    }

    // ── Strict validation ────────────────────────────────────────────────
    const err = validateForm(form)
    if (err) {
      toast.error(err)
      setStatus('error')
      return
    }

    const payload = {
      name:    form.name.trim(),
      email:   form.email.trim(),   // always present — email is now required
      message: form.message.trim(),
    }

    setStatus('loading')

    await toast.promise(
      (async () => {
        const { error } = await supabase
          .from('contact_messages')
          .insert(payload, { count: 'estimated' })
        if (error) throw new Error(error.message)
      })(),
      {
        loading: 'Sending message…',
        success: () => {
          setStatus('success')
          setForm({ name: '', email: '', message: '' })
          return 'Message sent! I will get back to you as soon as possible. 🎉'
        },
        error: (err: Error) => {
          setStatus('error')
          return err.message || 'Failed to send. Please try again.'
        },
      }
    )
  }

  const ready     = isFormReadyToSubmit(form) && !isAdmin
  const isLoading = status === 'loading'
  const msgLen    = form.message.trim().length

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

      {/* Success banner */}
      {status === 'success' && (
        <div className="flex items-start gap-3 border-l-2 border-black bg-gray-50 px-4 py-3">
          <span className="mt-px text-black" aria-hidden="true">✓</span>
          <div>
            <p className="text-sm font-medium text-black">Message sent</p>
            <p className="text-xs text-gray-500">I&apos;ll get back to you as soon as possible.</p>
          </div>
        </div>
      )}

      {/* Name — required, min 2 chars */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          minLength={2}
          disabled={isLoading}
          value={form.name}
          onChange={handleChange}
          placeholder="John Doe"
          className={[
            'rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none transition-all placeholder:text-gray-300 focus:border-black disabled:opacity-50',
            status === 'error' && form.name.trim().length < 2
              ? 'border-red-300'
              : 'border-gray-200',
          ].join(' ')}
        />
        {form.name.trim().length > 0 && form.name.trim().length < 2 && (
          <p className="text-xs text-red-400">At least 2 characters required.</p>
        )}
      </div>

      {/* Email — now REQUIRED */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Email (Required) <span className="text-red-400">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          disabled={isLoading}
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className={[
            'rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none transition-all placeholder:text-gray-300 focus:border-black disabled:opacity-50',
            status === 'error' && !EMAIL_RE.test(form.email.trim())
              ? 'border-red-300'
              : 'border-gray-200',
          ].join(' ')}
        />
        {/* Inline hint — shown as soon as the user starts typing something invalid */}
        {form.email.trim().length > 0 && !EMAIL_RE.test(form.email.trim()) && (
          <p className="text-xs text-red-400">
            {!form.email.includes('@') ? 'Missing @ character.' : 'Invalid email format.'}
          </p>
        )}
      </div>

      {/* Message — required, min 10 chars */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          minLength={10}
          disabled={isLoading}
          value={form.message}
          onChange={handleChange}
          placeholder="What would you like to talk about?"
          className={[
            'resize-none rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none transition-all placeholder:text-gray-300 focus:border-black disabled:opacity-50',
            status === 'error' && msgLen < 10
              ? 'border-red-300'
              : 'border-gray-200',
          ].join(' ')}
        />
        {/* Character counter — turns red below minimum */}
        <div className="flex items-center justify-between">
          {msgLen > 0 && msgLen < 10 && (
            <p className="text-xs text-red-400">Need {10 - msgLen} more characters.</p>
          )}
          <span className={[
            'ml-auto text-xs tabular-nums',
            msgLen > 0 && msgLen < 10 ? 'text-red-400' : 'text-gray-300',
          ].join(' ')}>
            {msgLen} / 2000
          </span>
        </div>
      </div>

      {/* Submit — glowing CTA button */}
      <button
        type="submit"
        disabled={isLoading || !ready}
        title={
          isAdmin
            ? 'Admin account cannot send messages'
            : !ready
            ? 'Please fill out all required fields'
            : undefined
        }
        className={[
          'send-btn mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white',
          'transition-all duration-200 active:scale-95',
          isAdmin
            ? 'opacity-30 cursor-not-allowed'
            : ready && !isLoading
            ? 'hover:scale-105 hover:shadow-[0_0_20px_4px_rgba(0,200,255,0.45)] shadow-[0_0_12px_2px_rgba(0,200,255,0.25)] animate-glow-pulse'
            : 'opacity-40 cursor-not-allowed',
        ].join(' ')}
      >
        {isLoading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Sending…
          </>
        ) : (
          'Send Message →'
        )}
      </button>

      {/* Admin warning — prominent red caption shown only when logged in as admin */}
      {isAdmin && (
        <p className="-mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500">
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
          Admin cannot send messages.
        </p>
      )}

    </form>
  )
}
