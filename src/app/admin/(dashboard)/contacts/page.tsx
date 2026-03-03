'use client'

import { useEffect, useState } from 'react'
import { PageWrapper } from '@/components/admin/page-wrapper'
import { Button } from '@/components/ui/button'
import { Contact } from '@/features/contacts'
import { Loader2, Mail, Trash2, CheckCircle2, Eye } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadContacts()
  }, [])

  async function loadContacts() {
    try {
      setIsLoading(true)
      const res = await fetch('/api/contacts')
      if (!res.ok) { setContacts([]); return }
      const data = await res.json()
      setContacts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function markAsRead(id: string) {
    const originalContacts = [...contacts]
    setContacts(prev => prev.map(c => c.id === id ? { ...c, is_read: true } : c))
    try {
      const res = await fetch('/api/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_read: true }),
      })
      if (!res.ok) throw new Error()
      toast.success('Marked as read.')
    } catch {
      setContacts(originalContacts)
      toast.error('Could not update status!')
    }
  }

  async function deleteMessage(id: string) {
    toast('Delete this message?', {
      action: {
        label: 'Delete',
        onClick: async () => {
          const original = [...contacts]
          setContacts(prev => prev.filter(c => c.id !== id))
          setSelected(prev => { const s = new Set(prev); s.delete(id); return s })
          try {
            const res = await fetch('/api/contacts', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id }),
            })
            if (!res.ok) throw new Error()
            toast.success('Message deleted.')
          } catch {
            setContacts(original)
            toast.error('Failed to delete!')
          }
        }
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    })
  }

  // ── Bulk selection ──────────────────────────────────────────────────────────
  const allSelected = contacts.length > 0 && selected.size === contacts.length
  const someSelected = selected.size > 0

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(contacts.map(c => c.id)))
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  async function bulkMarkRead() {
    if (selected.size === 0) return
    setBulkLoading(true)
    const ids = [...selected]
    const originalContacts = [...contacts]
    setContacts(prev =>
      prev.map(c => ids.includes(c.id) ? { ...c, is_read: true } : c)
    )
    try {
      const results = await Promise.all(
        ids.map(id =>
          fetch('/api/contacts', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, is_read: true }),
          })
        )
      )
      const allOk = results.every(r => r.ok)
      if (!allOk) throw new Error()
      toast.success(`Marked ${ids.length} messages as read.`)
    } catch {
      setContacts(originalContacts)
      toast.error('Failed to update in bulk.')
    } finally {
      setSelected(new Set())
      setBulkLoading(false)
    }
  }

  async function bulkDelete() {
    if (selected.size === 0) return
    const count = selected.size
    const ids = [...selected]
    toast(`Delete ${count} selected messages?`, {
      action: {
        label: 'Delete',
        onClick: async () => {
          setBulkLoading(true)
          const originalContacts = [...contacts]
          try {
            const results = await Promise.all(
              ids.map(id => fetch('/api/contacts', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
              }))
            )
            if (!results.every(r => r.ok)) throw new Error('Some items could not be deleted.')
            setContacts(prev => prev.filter(c => !ids.includes(c.id)))
            setSelected(new Set())
            toast.success(`Successfully deleted ${count} messages.`)
          } catch (err: unknown) {
            setContacts(originalContacts)
            toast.error(err instanceof Error ? err.message : 'Bulk delete failed!')
          } finally {
            setBulkLoading(false)
          }
        }
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    })
  }

  return (
    <PageWrapper title="Messages" description="Manage incoming messages">
      {/* ── Floating bulk toolbar ── */}
      {someSelected && (
        <div className="sticky top-4 z-30 mb-4 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/95 px-5 py-3 shadow-xl shadow-black/5 backdrop-blur-sm">
          <span className="text-sm font-semibold text-gray-700">
            {selected.size} selected
          </span>
          <div className="h-4 w-px bg-gray-200" />
          <Button
            size="sm"
            variant="outline"
            disabled={bulkLoading}
            onClick={bulkMarkRead}
            className="gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark as Read
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={bulkLoading}
            onClick={bulkDelete}
            className="gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Selected
          </Button>
          <button
            className="ml-auto text-xs text-gray-400 hover:text-gray-700"
            onClick={() => setSelected(new Set())}
          >
            Deselect All
          </button>
        </div>
      )}

      <div className="space-y-3">
        {/* Select all header */}
        {contacts.length > 0 && !isLoading && (
          <div className="flex items-center gap-3 px-1 pb-1">
            <input
              type="checkbox"
              id="select-all"
              checked={allSelected}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="select-all" className="cursor-pointer text-xs font-medium text-gray-500 uppercase tracking-widest">
              {allSelected ? 'Deselect All' : 'Select All'}
            </label>
            <span className="ml-auto text-xs text-gray-400">
              {contacts.length} messages · {contacts.filter(c => !c.is_read).length} unread
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-gray-50/50 py-20 text-gray-400">
            <Mail className="mb-4 opacity-20" size={64} />
            <p className="text-lg">Inbox is empty</p>
          </div>
        ) : (
          contacts.map(contact => {
            const isSelected = selected.has(contact.id)
            return (
              <div
                key={contact.id}
                className={`group rounded-2xl border p-5 transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-300 bg-blue-50/60 ring-1 ring-blue-200'
                    : contact.is_read
                    ? 'border-gray-100 bg-white opacity-70'
                    : 'border-blue-100 bg-blue-50/40 shadow-sm ring-1 ring-blue-200/40'
                }`}
              >
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <div className="mt-0.5 flex shrink-0 items-start">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(contact.id)}
                      className="h-4 w-4 rounded border-gray-300"
                      aria-label={`Select message from ${contact.name}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {!contact.is_read && (
                          <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                        )}
                        <h3 className="font-bold text-gray-900">{contact.name}</h3>
                        <span className="text-gray-300 text-xs">|</span>
                        <span className="text-sm text-gray-500">{contact.email}</span>
                      </div>

                      <div className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
                        {mounted ? new Date(contact.created_at).toLocaleString('vi-VN') : '---'}
                      </div>

                      <div className="rounded-xl border border-gray-100/60 bg-white/60 p-4">
                        <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                          {contact.message}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-row gap-2 self-end sm:flex-col sm:self-start">
                      {!contact.is_read ? (
                        <Button
                          size="sm"
                          className="bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
                          onClick={() => markAsRead(contact.id)}
                        >
                          <CheckCircle2 className="mr-1.5 h-4 w-4" />
                          Mark as Read
                        </Button>
                      ) : (
                        <div className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-400">
                          <Eye className="mr-1.5 h-3.5 w-3.5" />  Read
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => deleteMessage(contact.id)}
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </PageWrapper>
  )
}
