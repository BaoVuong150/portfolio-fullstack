'use client'

import { useEffect, useState } from 'react'
import { PageWrapper } from '@/components/admin/page-wrapper'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SiteSettings } from '@/features/site-settings'
import { toast } from 'sonner'

export default function AdminSiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [form, setForm] = useState<Partial<SiteSettings>>({})

  async function loadSettings() {
    const res = await fetch('/api/site-settings')
    const data = await res.json()

    if (data) {
      setSettings(data)
      setForm(data)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  async function handleSave() {
    const saveReq = settings?.id
      ? fetch('/api/site-settings', { method: 'PUT', body: JSON.stringify({ ...form, id: settings.id }) })
      : fetch('/api/site-settings', { method: 'POST', body: JSON.stringify(form) })

    await toast.promise(
      saveReq.then(async res => { if (!res.ok) throw new Error(); await loadSettings() }),
      {
        loading: 'Saving settings...',
        success: 'Settings updated!',
        error: 'Failed to save. Please try again.',
      }
    )
  }

  return (
    <PageWrapper
      title="Site Settings"
      description="Manage overall website configuration"
    >
      <div className="space-y-4 max-w-2xl">

        <Input
          placeholder="Site Name"
          value={form.site_name || ''}
          onChange={e =>
            setForm({ ...form, site_name: e.target.value })
          }
        />

        <Input
          placeholder="Logo URL"
          value={form.logo_url || ''}
          onChange={e =>
            setForm({ ...form, logo_url: e.target.value })
          }
        />

        <Textarea
          placeholder="Footer Text"
          value={form.footer_text || ''}
          onChange={e =>
            setForm({ ...form, footer_text: e.target.value })
          }
        />

        <Input
          placeholder="SEO Title"
          value={form.seo_title || ''}
          onChange={e =>
            setForm({ ...form, seo_title: e.target.value })
          }
        />

        <Textarea
          placeholder="SEO Description"
          value={form.seo_description || ''}
          onChange={e =>
            setForm({ ...form, seo_description: e.target.value })
          }
        />

        <Button onClick={handleSave}>
          {settings ? 'Update Settings' : 'Create Settings'}
        </Button>
      </div>
    </PageWrapper>
  )
}
