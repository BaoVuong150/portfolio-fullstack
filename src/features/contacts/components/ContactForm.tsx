'use client'

import { useState, FormEvent, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface FormState {
  name: string
  email: string
  message: string
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validateForm(form: FormState): string | null {
  const name    = form.name.trim()
  const email   = form.email.trim()
  const message = form.message.trim()

  if (name.length < 2)
    return 'Name must be at least 2 characters.'

  if (email.length === 0)
    return 'Invalid email. Please provide a valid email so I can respond!'

  if (!email.includes('@'))
    return 'Invalid email. Please provide a valid email so I can respond!'

  if (!EMAIL_RE.test(email))
    return 'Invalid email. Please provide a valid email so I can respond!'

  if (message.length < 10)
    return `Message is too short — must be at least 10 characters (currently ${message.length}).`

  return null
}

function isFormReadyToSubmit(form: FormState): boolean {
  return (
    form.name.trim().length >= 2 &&
    EMAIL_RE.test(form.email.trim()) &&
    form.message.trim().length >= 10
  )
}

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

    if (isAdmin) {
      toast.error(
        '⚠️ You are an Admin, please do not send test messages here!',
        { id: 'admin-block', duration: 5000 }
      )
      return
    }

    const err = validateForm(form)
    if (err) {
      toast.error(err)
      setStatus('error')
      return
    }

    const payload = {
      name:    form.name.trim(),
      email:   form.email.trim(),
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>

      {/* Success banner — Swiss style */}
      {status === 'success' && (
        <div className="flex items-start gap-4 border-l-4 border-[#FF3000] bg-[#F2F2F2] px-6 py-4">
          <span className="mt-0.5 text-sm font-black text-[#FF3000]" aria-hidden="true">✓</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-black">Message Sent</p>
            <p className="mt-1 text-xs text-[#999]">I&apos;ll get back to you as soon as possible.</p>
          </div>
        </div>
      )}

      {/* Name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-name" className="text-xs font-bold uppercase tracking-[0.2em] text-black">
          Name <span className="text-[#FF3000]">*</span>
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
            'border-b-2 bg-transparent px-0 py-3 text-sm font-medium text-black outline-none transition-all duration-150',
            'placeholder:text-[#CCC] disabled:opacity-50',
            'focus:border-[#FF3000]',
            status === 'error' && form.name.trim().length < 2
              ? 'border-[#FF3000]'
              : 'border-black',
          ].join(' ')}
        />
        {form.name.trim().length > 0 && form.name.trim().length < 2 && (
          <p className="text-xs font-bold uppercase tracking-wider text-[#FF3000]">
            At least 2 characters required.
          </p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-email" className="text-xs font-bold uppercase tracking-[0.2em] text-black">
          Email <span className="text-[#FF3000]">*</span>
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
            'border-b-2 bg-transparent px-0 py-3 text-sm font-medium text-black outline-none transition-all duration-150',
            'placeholder:text-[#CCC] disabled:opacity-50',
            'focus:border-[#FF3000]',
            status === 'error' && !EMAIL_RE.test(form.email.trim())
              ? 'border-[#FF3000]'
              : 'border-black',
          ].join(' ')}
        />
        {form.email.trim().length > 0 && !EMAIL_RE.test(form.email.trim()) && (
          <p className="text-xs font-bold uppercase tracking-wider text-[#FF3000]">
            {!form.email.includes('@') ? 'Missing @ character.' : 'Invalid email format.'}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className="text-xs font-bold uppercase tracking-[0.2em] text-black">
          Message <span className="text-[#FF3000]">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          minLength={10}
          disabled={isLoading}
          value={form.message}
          onChange={handleChange}
          placeholder="What would you like to talk about?"
          className={[
            'resize-none border-2 bg-transparent p-4 text-sm font-medium text-black outline-none transition-all duration-150',
            'placeholder:text-[#CCC] disabled:opacity-50',
            'focus:border-[#FF3000]',
            status === 'error' && msgLen < 10
              ? 'border-[#FF3000]'
              : 'border-black',
          ].join(' ')}
        />
        <div className="flex items-center justify-between">
          {msgLen > 0 && msgLen < 10 && (
            <p className="text-xs font-bold uppercase tracking-wider text-[#FF3000]">
              Need {10 - msgLen} more characters.
            </p>
          )}
          <span className={[
            'ml-auto text-xs font-bold tabular-nums uppercase tracking-wider',
            msgLen > 0 && msgLen < 10 ? 'text-[#FF3000]' : 'text-[#CCC]',
          ].join(' ')}>
            {msgLen} / 2000
          </span>
        </div>
      </div>

      {/* Submit — Swiss CTA */}
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
          'mt-2 inline-flex items-center justify-center gap-3 border-2 px-8 py-4 text-xs font-bold uppercase tracking-[0.15em]',
          'transition-all duration-150',
          isAdmin
            ? 'border-[#CCC] bg-[#F2F2F2] text-[#CCC] cursor-not-allowed'
            : ready && !isLoading
            ? 'border-[#FF3000] bg-[#FF3000] text-white hover:bg-black hover:border-black'
            : 'border-[#CCC] bg-[#F2F2F2] text-[#CCC] cursor-not-allowed',
        ].join(' ')}
      >
        {isLoading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Sending…
          </>
        ) : (
          'Send Message →'
        )}
      </button>

      {/* Admin warning */}
      {isAdmin && (
        <div className="flex items-center gap-3 border-l-4 border-[#FF3000] px-4 py-3">
          <svg className="h-4 w-4 shrink-0 text-[#FF3000]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF3000]">
            Admin cannot send messages.
          </span>
        </div>
      )}

    </form>
  )
}
