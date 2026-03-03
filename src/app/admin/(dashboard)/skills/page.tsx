'use client'

import { useEffect, useState } from 'react'
import { PageWrapper } from '@/components/admin/page-wrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

// ── Constants ──────────────────────────────────────────────────────────────
const CATEGORIES = ['Backend', 'Frontend', 'Database', 'Other'] as const
type Category = typeof CATEGORIES[number]

type Skill = {
  id: string
  name: string
  level: number
  category: Category | null
}

type SkillForm = {
  name: string
  level: string
  category: Category
}

const EMPTY_FORM: SkillForm = { name: '', level: '', category: 'Other' }

// ── Category badge colours ─────────────────────────────────────────────────
const CAT_STYLES: Record<Category, string> = {
  Backend:  'bg-violet-100 text-violet-700',
  Frontend: 'bg-sky-100 text-sky-700',
  Database: 'bg-emerald-100 text-emerald-700',
  Other:    'bg-gray-100 text-gray-600',
}

// ── Category Select ────────────────────────────────────────────────────────
function CategorySelect({
  value,
  onChange,
}: {
  value: Category
  onChange: (v: Category) => void
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as Category)}
      className="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-black"
    >
      {CATEGORIES.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [form, setForm] = useState<SkillForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formError, setFormError] = useState('')
  const [editError, setEditError] = useState('')

  function validateLevel(raw: string): number | null {
    const n = Number(raw)
    if (!raw || isNaN(n) || n < 0 || n > 100) return null
    return n
  }
  const [editForm, setEditForm] = useState<SkillForm>(EMPTY_FORM)

  async function loadSkills() {
    const res = await fetch('/api/skills')
    const data = await res.json()
    setSkills(data)
  }

  useEffect(() => { loadSkills() }, [])

  // CREATE
  async function addSkill() {
    setFormError('')
    if (!form.name.trim()) { setFormError('Please enter a skill name.'); return }
    const level = validateLevel(form.level)
    if (level === null) { setFormError('Level must be an integer between 0 and 100.'); return }
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        body: JSON.stringify({ name: form.name.trim(), level, category: form.category }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setFormError(body?.error ?? 'Server error. Please try again.')
        return
      }
      setForm(EMPTY_FORM)
      loadSkills()
    } catch {
      setFormError('Cannot connect to server.')
    }
  }

  // DELETE
  async function deleteSkill(id: string) {
    toast('Confirm deleting this skill?', {
      action: {
        label: 'Delete',
        onClick: () => {
          setSkills(prev => prev.filter(s => s.id !== id))
          toast.promise(
            fetch('/api/skills', { method: 'DELETE', body: JSON.stringify({ id }) })
              .then(res => { if (!res.ok) throw new Error() }),
            { loading: 'Deleting...', success: 'Skill deleted.', error: 'Error deleting!' }
          )
        }
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    })
  }

  // EDIT
  function startEdit(skill: Skill) {
    setEditingId(skill.id)
    setEditForm({
      name: skill.name,
      level: String(skill.level),
      category: (skill.category as Category) ?? 'Other',
    })
  }

  async function updateSkill() {
    setEditError('')
    if (!editingId) return
    if (!editForm.name.trim()) { setEditError('Please enter a skill name.'); return }
    const level = validateLevel(editForm.level)
    if (level === null) { setEditError('Level must be an integer between 0 and 100.'); return }
    try {
      const res = await fetch('/api/skills', {
        method: 'PUT',
        body: JSON.stringify({ id: editingId, name: editForm.name.trim(), level, category: editForm.category }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setEditError(body?.error ?? 'Server error. Please try again.')
        return
      }
      setEditingId(null)
      loadSkills()
    } catch {
      setEditError('Cannot connect to server.')
    }
  }

  // ── Group skills by category for display ──────────────────────────────
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {})

  // Show categories in preferred order, then any extras alphabetically
  const orderedCats = [
    ...CATEGORIES.filter(c => grouped[c]),
    ...Object.keys(grouped).filter(c => !CATEGORIES.includes(c as Category)).sort(),
  ]

  return (
    <PageWrapper title="Skills" description="Manage technical skills">

      {/* ── Add form ── */}
      <div className="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">＋ Add New Skill</h2>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Skill Name (e.g. React)"
            value={form.name}
            onChange={e => { setFormError(''); setForm({ ...form, name: e.target.value }) }}
            className={`min-w-[160px] flex-1 ${formError ? 'border-red-400' : ''}`}
            onKeyDown={e => e.key === 'Enter' && addSkill()}
          />
          <Input
            placeholder="Level (0–100)"
            type="number"
            min={0}
            max={100}
            value={form.level}
            onChange={e => { setFormError(''); setForm({ ...form, level: e.target.value }) }}
            className={`w-32 ${formError ? 'border-red-400' : ''}`}
          />
          <CategorySelect
            value={form.category}
            onChange={cat => setForm({ ...form, category: cat })}
          />
          <Button onClick={addSkill}>Add</Button>
        </div>
        {formError && (
          <p className="mt-2 text-xs font-medium text-red-500">⚠ {formError}</p>
        )}
      </div>

      {/* ── Skill list grouped by category ── */}
      <div className="space-y-8">
        {orderedCats.length === 0 ? (
          <p className="text-sm text-gray-400">No skills added yet. Add your first skill!</p>
        ) : (
          orderedCats.map(cat => (
            <div key={cat}>
              {/* Category heading */}
              <div className="mb-3 flex items-center gap-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {cat}
                </h3>
                <span className="text-xs text-gray-300">
                  {grouped[cat].length} skills
                </span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>

              {/* Skills in this category */}
              <ul className="space-y-2">
                {grouped[cat].map(skill => (
                  <li
                    key={skill.id}
                    className={`rounded-xl border p-3 transition-all ${
                      editingId === skill.id
                        ? 'border-amber-300 bg-amber-50'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    {editingId === skill.id ? (
                      /* ── Inline edit row ── */
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Input
                            value={editForm.name}
                            onChange={e => { setEditError(''); setEditForm({ ...editForm, name: e.target.value }) }}
                            className={`min-w-[140px] flex-1 ${editError ? 'border-red-400' : ''}`}
                          />
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={editForm.level}
                            onChange={e => { setEditError(''); setEditForm({ ...editForm, level: e.target.value }) }}
                            className={`w-24 ${editError ? 'border-red-400' : ''}`}
                          />
                          <CategorySelect
                            value={editForm.category}
                            onChange={cat => setEditForm({ ...editForm, category: cat })}
                          />
                          <Button size="sm" onClick={updateSkill}>💾 Save</Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setEditError('') }}>
                            ✕ Cancel
                          </Button>
                        </div>
                        {editError && (
                          <p className="text-xs font-medium text-red-500">⚠ {editError}</p>
                        )}
                      </div>
                    ) : (
                      /* ── Read row ── */
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          {/* Category badge */}
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            CAT_STYLES[(skill.category as Category) ?? 'Other']
                          }`}>
                            {skill.category ?? 'Other'}
                          </span>

                          {/* Skill name */}
                          <span className="truncate font-medium text-gray-900">{skill.name}</span>

                          {/* Level bar */}
                          <div className="hidden flex-1 sm:flex items-center gap-2">
                            <div className="h-1.5 flex-1 rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-black transition-all"
                                style={{ width: `${skill.level}%` }}
                              />
                            </div>
                            <span className="w-8 shrink-0 text-right text-xs text-gray-400">
                              {skill.level}%
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(skill)}>
                            ✏️ Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteSkill(skill.id)}>
                            🗑
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </PageWrapper>
  )
}
