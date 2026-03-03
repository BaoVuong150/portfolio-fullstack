'use client'

import { useEffect, useState, useMemo } from 'react'
import { PageWrapper } from '@/components/admin/page-wrapper'
import { Button } from '@/components/ui/button'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { fetchFullTechStack } from '@/lib/utils/github'
import { toast } from 'sonner'
import { getAdminListThumbnailUrl } from '@/lib/utils/image'

type Project = {
  id: string
  title: string
  description: string
  tech_stack: string[]
  image_url: string
  demo_url: string
  github_url: string
  is_featured: boolean
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [form, setForm] = useState<Partial<Project>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncMsg, setSyncMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function syncLanguages() {
    if (!form.github_url?.trim()) {
      setSyncMsg({ type: 'err', text: 'Enter GitHub URL first.' })
      return
    }
    setSyncLoading(true)
    setSyncMsg(null)
    try {
      const stack = await fetchFullTechStack(form.github_url)
      if (stack.length === 0) {
        setSyncMsg({ type: 'err', text: 'No tech stack found. Check your URL.' })
      } else {
        setForm(prev => ({ ...prev, tech_stack: stack }))
        setSyncMsg({ type: 'ok', text: `Scanned ${stack.length} technologies.` })
      }
    } catch (err: unknown) {
      setSyncMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error scanning repo.' })
    } finally {
      setSyncLoading(false)
    }
  }

  async function loadProjects() {
    const res = await fetch('/api/projects')
    const data = await res.json()
    setProjects(data)
  }

  const [search, setSearch] = useState('')
  const [filterFeatured, setFilterFeatured] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
      const matchFeatured = filterFeatured ? p.is_featured : true
      return matchSearch && matchFeatured
    })
  }, [projects, search, filterFeatured])

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE)
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterFeatured])

  useEffect(() => { loadProjects() }, [])

  async function handleSubmit() {
    if (editingId) {
      await fetch('/api/projects', {
        method: 'PUT',
        body: JSON.stringify({ ...form, id: editingId }),
      })
    } else {
      await fetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify(form),
      })
    }
    setForm({})
    setEditingId(null)
    loadProjects()
  }

  async function handleDelete(id: string) {
    toast('Confirm deleting this project?', {
      action: {
        label: 'Delete',
        onClick: async () => {
          await toast.promise(
            fetch('/api/projects', { method: 'DELETE', body: JSON.stringify({ id }) })
              .then(res => { if (!res.ok) throw new Error(); loadProjects() }),
            { loading: 'Deleting...', success: 'Project deleted.', error: 'Error deleting!' }
          )
        }
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    })
  }

  function handleEdit(project: Project) {
    setEditingId(project.id)
    setForm(project)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancel() {
    setForm({})
    setEditingId(null)
  }

  const isEditing = Boolean(editingId)

  return (
    <PageWrapper title="Projects" description="Manage projects">
      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        {/* ── Form (Left Column, Sticky) ── */}
        <div className="w-full lg:w-[38%] sticky top-6 z-10 shrink-0">
          <div
            className={`space-y-4 rounded-2xl border-2 p-6 transition-all duration-300 shadow-sm ${
              isEditing
                ? 'border-amber-400 bg-amber-50/40 shadow-amber-100'
                : 'border-gray-100 bg-white'
            }`}
          >
        {/* Edit mode banner */}
        {isEditing && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-400/20 px-4 py-2.5">
            <span className="text-base">⚠️</span>
            <p className="text-sm font-semibold text-amber-800 uppercase tracking-wide">
              Editing Project Mode
            </p>
          </div>
        )}

        <h2 className={`text-lg font-bold ${isEditing ? 'text-amber-800' : 'text-gray-900'}`}>
          {isEditing ? '✏️ Edit Project' : '＋ Add New Project'}
        </h2>

        <Input
          placeholder="Title"
          value={form.title || ''}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        <Textarea
          placeholder="Description"
          value={form.description || ''}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Project Image</label>
          <ImageUploader
            value={form.image_url || ''}
            onChange={(url) => setForm({ ...form, image_url: url })}
            folder="projects"
            cropMode="wide"
            aspectHint="16:9"
          />
        </div>

        <Input
          placeholder="Demo URL"
          value={form.demo_url || ''}
          onChange={e => setForm({ ...form, demo_url: e.target.value })}
        />

        <Input
          placeholder="GitHub URL"
          value={form.github_url || ''}
          onChange={e => { setSyncMsg(null); setForm({ ...form, github_url: e.target.value }) }}
        />

        {/* GitHub language sync */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={syncLanguages}
            disabled={syncLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
          >
            {syncLoading ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                Scanning repository...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Auto-sync Tech Stack
              </>
            )}
          </button>
          {syncMsg && (
            <span className={`text-xs font-medium ${ syncMsg.type === 'ok' ? 'text-green-600' : 'text-red-500' }`}>
              {syncMsg.type === 'ok' ? '✓' : '✗'} {syncMsg.text}
            </span>
          )}
        </div>

        {/* Tech stack chips — shows synced/manual tags, each removable */}
        {(form.tech_stack ?? []).length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-500">Tech Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {(form.tech_stack ?? []).map(tech => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, tech_stack: (prev.tech_stack ?? []).filter(t => t !== tech) }))}
                    className="ml-0.5 text-gray-400 hover:text-black"
                    aria-label={`Remove ${tech}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={form.is_featured || false}
            onChange={e => setForm({ ...form, is_featured: e.target.checked })}
            className="h-4 w-4 rounded"
          />
          <label htmlFor="featured" className="cursor-pointer text-sm font-medium">
            Featured
          </label>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            onClick={handleSubmit}
            className={isEditing ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
          >
            {isEditing ? '💾 Save Changes' : 'Add Project'}
          </Button>

          {isEditing && (
            <Button variant="outline" onClick={handleCancel}>
              ✕ Cancel
            </Button>
          )}
        </div>
      </div>
    </div>

      {/* ── Project list (Right Column) ── */}
      <div className="w-full lg:w-[62%] space-y-5 min-w-0">
        
        {/* ── Search & Filter Bar ── */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
            <Input 
              placeholder="Search projects by title..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-10 border-gray-200"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0 px-2 h-10 bg-gray-50 rounded-lg border border-gray-100">
            <input
              type="checkbox"
              id="filter-featured"
              checked={filterFeatured}
              onChange={e => setFilterFeatured(e.target.checked)}
              className="h-4 w-4 rounded ml-2"
            />
            <label htmlFor="filter-featured" className="cursor-pointer text-sm font-medium pr-3 text-gray-700">
              Featured Only
            </label>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="p-10 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No matching projects found.
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedProjects.map(project => (
              <div
                key={project.id}
                className={`group flex flex-col sm:flex-row items-start justify-between gap-4 rounded-xl border p-4 transition-all hover:shadow-md bg-white ${
                  editingId === project.id
                    ? 'ring-2 ring-amber-400 border-transparent shadow-md relative z-20'
                    : 'border-gray-200'
                }`}
              >
                {/* Project Admin Thumbnail */}
                <div 
                  className="shrink-0 relative overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center w-full sm:w-40"
                  style={{ aspectRatio: '16/9' }}
                >
                  {project.image_url ? (
                    <img 
                      src={getAdminListThumbnailUrl(project.image_url) || project.image_url} 
                      alt="" 
                      className="w-full h-full object-cover block"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">No Image</span>
                  )}
                </div>

                <div className="min-w-0 flex-1 w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate text-base">{project.title}</h3>
                    {project.is_featured && (
                      <span className="shrink-0 rounded-full bg-black px-2 py-0.5 text-[10px] font-medium text-white shadow-sm uppercase tracking-wide">
                        Featured
                      </span>
                    )}
                    {editingId === project.id && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                        Editing...
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-sm text-gray-500">{project.description}</p>
                  
                  {project.tech_stack && project.tech_stack.length > 0 && (
                     <div className="flex flex-wrap gap-1 mt-3">
                       {project.tech_stack.slice(0, 4).map(t => (
                         <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                           {t}
                         </span>
                       ))}
                       {project.tech_stack.length > 4 && (
                         <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-400 font-medium">
                           +{project.tech_stack.length - 4}
                         </span>
                       )}
                     </div>
                  )}
                </div>

                <div className="flex sm:flex-col shrink-0 gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100 justify-end">
                  <Button size="sm" variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-black border border-gray-200" onClick={() => handleEdit(project)}>
                    ✏️ Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(project.id)}
                  >
                    🗑 Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-xl border border-gray-100 shadow-sm mt-4">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredProjects.length)}
                </span>{' '}
                of <span className="font-medium">{filteredProjects.length}</span> projects
              </p>
            </div>
            <div className="flex flex-1 justify-between sm:justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

     </div>
    </PageWrapper>
  )
}
