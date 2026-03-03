'use client'

import { useEffect, useState } from 'react'
import { PageWrapper } from '@/components/admin/page-wrapper'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Profile } from '@/features/profile'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { toast } from 'sonner'
import Link from 'next/link'
import { FolderGit2, MessagesSquare, Rss, ArrowRight, UserCheck, Settings, Briefcase, FileText, Target, Github, Linkedin, Mail, Save } from 'lucide-react'

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setProfile(data)
        setLoading(false)
      })
  }, [])

  async function handleSave() {
    await toast.promise(
      fetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      }).then(res => { if (!res.ok) throw new Error() }),
      {
        loading: 'Saving...',
        success: 'Profile updated successfully!',
        error: 'Failed to save. Please try again.',
      }
    )
  }

  const updateProfileField = (field: Partial<Profile>) => {
    setProfile(prev => prev ? { ...prev, ...field } : prev)
  }

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="text-sm text-gray-400 animate-pulse">Loading profile...</span>
    </div>
  )
  if (!profile) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="text-sm text-gray-400">Profile not found.</span>
    </div>
  )

  return (
    <PageWrapper
      title="Profile & Dashboard"
      description="Manage your personal information and system overview"
    >
      <div className="w-full">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 lg:p-8 shadow-sm flex flex-col xl:flex-row gap-8 lg:gap-12">
          
          {/* Avatar Sidebar */}
          <div className="w-full xl:w-64 shrink-0 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
              <UserCheck size={16} className="text-blue-500" />
              Profile Picture
            </h3>
            <div className="w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 ring-4 ring-gray-50/50">
              <ImageUploader
                value={profile.avatar_url || ''}
                onChange={url => updateProfileField({ avatar_url: url })}
                folder="avatars"
                cropMode="face"
                aspectHint="16:9"
              />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed text-center xl:text-left mt-2 px-2 xl:px-0">
              Automatically processed to focus on face and fill frame using Cloudinary AI.
            </p>
          </div>

          {/* Form Fields Grid */}
          <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Row 1: Personal Info */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <UserCheck size={14} className="text-gray-400" />
                  Full Name
                </label>
                <Input
                  placeholder="John Doe"
                  value={profile.full_name || ''}
                  onChange={e => updateProfileField({ full_name: e.target.value })}
                  className="h-11 text-sm rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <Briefcase size={14} className="text-gray-400" />
                  Job Title
                </label>
                <Input
                  placeholder="Software Engineer"
                  value={profile.title || ''}
                  onChange={e => updateProfileField({ title: e.target.value })}
                  className="h-11 text-sm rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>

              {/* Row 2: Contact */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <Mail size={14} className="text-gray-400" />
                  Email Contact
                </label>
                <Input
                  type="email"
                  placeholder="hello@domain.com"
                  value={profile.email || ''}
                  onChange={e => updateProfileField({ email: e.target.value })}
                  className="h-11 text-sm rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider opacity-60">
                  <UserCheck size={14} className="text-gray-400" />
                  Phone / Other
                </label>
                <Input
                  disabled
                  placeholder="N/A"
                  className="h-11 text-sm bg-gray-50 opacity-60 cursor-not-allowed rounded-xl border-gray-200"
                />
              </div>

              {/* Row 3: Bio/Goal */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <FileText size={14} className="text-gray-400" />
                  Bio
                </label>
                <Textarea
                  rows={4}
                  placeholder="Short description about yourself..."
                  value={profile.bio || ''}
                  onChange={e => updateProfileField({ bio: e.target.value })}
                  className="text-sm resize-none rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors leading-relaxed p-3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <Target size={14} className="text-gray-400" />
                  Career Goal
                </label>
                <Textarea
                  rows={4}
                  placeholder="Professional goals..."
                  value={profile.goal || ''}
                  onChange={e => updateProfileField({ goal: e.target.value })}
                  className="text-sm resize-none rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors leading-relaxed p-3"
                />
              </div>

              {/* Row 4: Social Media */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <Github size={14} className="text-gray-400" />
                  GitHub URL
                </label>
                <Input
                  placeholder="https://github.com/..."
                  value={profile.github || ''}
                  onChange={e => updateProfileField({ github: e.target.value })}
                  className="h-11 text-sm rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <Linkedin size={14} className="text-gray-400" />
                  LinkedIn URL
                </label>
                <Input
                  placeholder="https://linkedin.com/in/..."
                  value={profile.linkedin || ''}
                  onChange={e => updateProfileField({ linkedin: e.target.value })}
                  className="h-11 text-sm rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>

            </div>

            {/* Actions: Save Button */}
            <div className="mt-8 flex justify-end pt-6 border-t border-gray-100">
              <Button onClick={handleSave} className="h-11 px-10 bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium rounded-xl shadow-lg shadow-blue-200/50 transition-all hover:-translate-y-0.5">
                <Save size={18} /> Save Changes
              </Button>
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  )
}
