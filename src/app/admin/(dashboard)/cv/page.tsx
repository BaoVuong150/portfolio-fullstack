'use client'

import { useEffect, useState } from 'react'
import { PageWrapper } from '@/components/admin/page-wrapper'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { UploadCloud, FileText, Loader2, X, Link as LinkIcon } from 'lucide-react'
import supabaseClient from '@/lib/supabase/client'

export interface CV {
  id: string
  title: string | null
  summary: string | null
  content: string | null
  file_url: string | null
  updated_at: string
}

export default function AdminCVPage() {
  const [cv, setCv] = useState<CV | null>(null)
  const [form, setForm] = useState<Partial<CV>>({})
  const [isUploading, setIsUploading] = useState(false)

  async function loadCV() {
    const res = await fetch('/api/cv')
    const data = await res.json()

    if (data) {
      setCv(data)
      setForm(data)
    }
  }

  useEffect(() => {
    loadCV()
  }, [])

  async function handleSave() {
    const saveReq = cv?.id
      ? fetch('/api/cv', { method: 'PUT', body: JSON.stringify({ ...form, id: cv.id }) })
      : fetch('/api/cv', { method: 'POST', body: JSON.stringify(form) })

    await toast.promise(
      saveReq.then(async res => { if (!res.ok) throw new Error(); await loadCV() }),
      {
        loading: 'Saving CV...',
        success: 'CV updated successfully!',
        error: 'Failed to save. Please try again.',
      }
    )
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large. Please select a file under 5MB.')
      return
    }

    if (file.type !== 'application/pdf') {
      toast.error('System only accepts .pdf files.')
      return
    }

    setIsUploading(true)
    const toastId = toast.loading('Uploading CV...')

    try {
      const fileName = 'my-cv.pdf'
      const filePath = `public/${fileName}`

      const { error: uploadError } = await supabaseClient.storage
        .from('cvs')
        .upload(filePath, file, { 
          upsert: true,
          cacheControl: '3600'
        })

      if (uploadError) throw new Error(uploadError.message)

      const { data: { publicUrl } } = supabaseClient.storage
        .from('cvs')
        .getPublicUrl(filePath)

      // Add timestamp to prevent browser caching of the old PDF
      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`

      setForm(prev => ({ ...prev, file_url: urlWithCacheBuster }))
      toast.success('CV uploaded successfully!', { id: toastId })
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Error uploading CV!', { id: toastId })
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  return (
    <PageWrapper title="CV" description="Manage your CV">
      <div className="space-y-6 max-w-3xl">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Display Title</label>
          <Input
            placeholder="e.g., Fullstack Developer / UI Designer"
            value={form.title || ''}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Short Summary</label>
          <Textarea
            placeholder="Short summary about yourself..."
            value={form.summary || ''}
            onChange={e => setForm({ ...form, summary: e.target.value })}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Content (Markdown / Rich text)</label>
          <Textarea
            placeholder="Detailed skills and experiences..."
            className="min-h-[200px]"
            value={form.content || ''}
            onChange={e => setForm({ ...form, content: e.target.value })}
          />
        </div>

        <div className="p-5 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <FileText size={16} className="text-red-500" />
              CV Document (PDF)
            </label>
            <p className="text-xs text-gray-400 mt-1">Use the upload button below to select a PDF from your device. Save form after uploading.</p>
          </div>
          
          {form.file_url ? (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm w-fit max-w-full">
              <div className="p-2 bg-red-50 rounded-lg text-red-500 shrink-0">
                <FileText size={20} />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0 pr-4">
                <span className="text-sm font-medium pr-4 truncate text-gray-700">
                  {form.file_url.split('?')[0].split('/').pop() || 'PDF Attached'}
                </span>
                <div className="flex items-center gap-3 mt-0.5">
                  <a href={form.file_url} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1">
                    <LinkIcon size={10} /> View Current CV
                  </a>
                </div>
              </div>
              <Button type="button" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0" onClick={() => setForm({ ...form, file_url: '' })}>
                <X size={16} />
              </Button>
            </div>
          ) : null}

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('cv-upload')?.click()}
              disabled={isUploading}
              className="gap-2 focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              {isUploading ? 'Processing...' : 'Upload File (PDF)'}
            </Button>
            <input
              id="cv-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
            {form.file_url && (
              <span className="text-xs text-gray-500">Or replace current file. Max 5MB.</span>
            )}
            {!form.file_url && (
              <span className="text-xs text-gray-500">Supports .pdf max 5MB.</span>
            )}
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-200">
            {cv ? 'Update CV' : 'Create CV'}
          </Button>
        </div>
      </div>
    </PageWrapper>
  )
}
