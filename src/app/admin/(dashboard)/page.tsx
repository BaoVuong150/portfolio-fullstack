'use client'

import { useEffect, useState } from 'react'
import { PageWrapper } from '@/components/admin/page-wrapper'
import { DashboardData } from '@/lib/types/dashboard'
import { 
  Briefcase, 
  Star, 
  Cpu, 
  Mail, 
  FileText, 
  UserCircle, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react'
import Link from 'next/link'


export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadDashboard() {
    try {
      const res = await fetch('/api/dashboard')
      const json = await res.json()
      setData(json)
      setData(json as DashboardData)
    } catch (error) {
      console.error("Dashboard load failed:", error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    loadDashboard()
  }, [])

  if (loading) {
    return (
      <PageWrapper title="Dashboard" description="Loading data...">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageWrapper>
    )
  }

  if (!data) return null

  return (
    <PageWrapper title="Dashboard" description="Portfolio system overview">
      <div className="space-y-8">
        {/* Section 1: Key Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard 
            title="Personal Projects" 
            value={data.totalProjects} 
            icon={<Briefcase className="w-6 h-6 text-blue-600" />}
            color="bg-blue-100/50"
            borderColor="border-blue-200"
          />
          <StatCard 
            title="Featured Projects" 
            value={data.featuredProjects} 
            icon={<Star className="w-6 h-6 text-emerald-600" />}
            color="bg-emerald-100/50"
            borderColor="border-emerald-200"
          />
          <StatCard 
            title="Professional Skills" 
            value={data.totalSkills} 
            icon={<Cpu className="w-6 h-6 text-indigo-600" />}
            color="bg-indigo-100/50"
            borderColor="border-indigo-200"
          />
          <StatCard 
            title="Unread Messages" 
            value={data.unreadMessages} 
            icon={<Mail className="w-6 h-6 text-rose-600" />}
            color="bg-rose-100/50"
            borderColor="border-rose-200"
            highlight={data.unreadMessages > 0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section 2: Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <Link href="/admin/projects" className="group flex items-center justify-between bg-white border border-gray-200 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                     <Plus className="w-5 h-5 text-blue-600" />
                   </div>
                   <span className="font-semibold text-gray-800">Add New Project</span>
                 </div>
                 <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
               </Link>
               
               <Link href="/admin/cv" className="group flex items-center justify-between bg-white border border-gray-200 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-300">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                     <FileText className="w-5 h-5 text-indigo-600" />
                   </div>
                   <span className="font-semibold text-gray-800">Update PDF CV</span>
                 </div>
                 <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
               </Link>

               <Link href="/admin/profile" className="group flex items-center justify-between bg-white border border-gray-200 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-violet-300 transition-all duration-300">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-violet-50 rounded-xl group-hover:bg-violet-100 transition-colors">
                     <UserCircle className="w-5 h-5 text-violet-600" />
                   </div>
                   <span className="font-semibold text-gray-800">Edit Profile</span>
                 </div>
                 <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
               </Link>

               <Link href="/admin/contacts" className="group flex items-center justify-between bg-white border border-gray-200 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-rose-300 transition-all duration-300">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-rose-50 rounded-xl group-hover:bg-rose-100 transition-colors">
                     <Mail className="w-5 h-5 text-rose-600" />
                   </div>
                   <span className="font-semibold text-gray-800">Read Messages</span>
                 </div>
                 <div className="flex items-center gap-2">
                   {data.unreadMessages > 0 && (
                     <span className="flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                       {data.unreadMessages}
                     </span>
                   )}
                   <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
                 </div>
               </Link>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mt-8">
              <FileText className="w-5 h-5 text-gray-600" />
              Core Data Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatusCard
                title="Personal Profile"
                status={data.hasProfile}
                icon={<UserCircle className="w-6 h-6" />}
                description="Information displayed on the homepage and about sections."
              />
              <StatusCard
                title="CV File (PDF)"
                status={data.hasCV}
                icon={<FileText className="w-6 h-6" />}
                description="The latest CV document for recruiters to download."
              />
            </div>
          </div>

          {/* Section 3: System Widget */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              System Status
            </h3>
            <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                 <ShieldCheck className="w-32 h-32" />
               </div>
               
               <div className="relative z-10 space-y-6">
                 <div>
                   <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Core Database</p>
                   <div className="flex items-center gap-2">
                     <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                     <span className="font-medium">Supabase Online</span>
                   </div>
                 </div>

                 <div>
                   <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Media Acceleration</p>
                   <div className="flex items-center gap-2">
                     <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                     <span className="font-medium">Cloudinary Active (q_auto)</span>
                   </div>
                 </div>

                 <div>
                   <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Admin Security</p>
                   <div className="flex items-center gap-2 text-slate-300">
                     <ShieldCheck className="w-4 h-4 text-emerald-400" />
                     <span className="font-medium text-sm">Protected by Middleware Email Whitelist</span>
                   </div>
                 </div>
                 
                 <div className="pt-4 mt-2 border-t border-slate-700/50">
                    <div className="text-xs text-slate-400 flex justify-between items-center">
                      <span>Server Region: Global (Edge)</span>
                      <span className="font-mono bg-slate-800 px-2 py-1 rounded">200 OK</span>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

// --- Sub-components ---

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  borderColor: string
  highlight?: boolean
}

function StatCard({ title, value, icon, color, borderColor, highlight }: StatCardProps) {
  return (
    <div className={`group rounded-3xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-${color.replace('bg-', '').split('-')[0]}-500/10 hover:-translate-y-1 relative overflow-hidden`}>
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-50 transition-transform duration-500 group-hover:scale-150 ${color}`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-2xl ${color} border ${borderColor} shadow-inner`}>
            {icon}
          </div>
          {highlight && (
            <span className="flex h-3 w-3 rounded-full bg-rose-500 animate-pulse ring-4 ring-rose-500/20" />
          )}
        </div>
        <div className="mt-5">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
          <div className="flex items-end gap-2">
             <p className="text-4xl font-black text-gray-900 leading-none">{value}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatusCardProps {
  title: string
  status: boolean
  icon: React.ReactNode
  description: string
}

function StatusCard({ title, status, icon, description }: StatusCardProps) {
  return (
    <div className={`group flex items-start gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${status ? 'hover:border-emerald-300' : 'hover:border-rose-300 border-rose-100 bg-rose-50/30'}`}>
      <div className={`mt-1 p-2 rounded-xl border ${status ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-500 bg-rose-50 border-rose-100'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="font-bold text-gray-900 truncate pr-2">{title}</h4>
          {status ? (
            <div className="shrink-0 flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-1.5 rounded-lg uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Ready
            </div>
          ) : (
            <div className="shrink-0 flex items-center text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-1.5 rounded-lg uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5 mr-1" /> Missing
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500/90 leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  )
}
