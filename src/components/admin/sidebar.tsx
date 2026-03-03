'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const menu = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Profile', href: '/admin/profile' },
  { label: 'Skills', href: '/admin/skills' },
  { label: 'Projects', href: '/admin/projects' },
  { label: 'CV', href: '/admin/cv' },
  { label: 'Contact', href: '/admin/contacts' },
  { label: 'Site Settings', href: '/admin/site-settings' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Admin</h2>

      <nav className="space-y-2">
        {menu.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'block px-3 py-2 rounded hover:bg-slate-700',
              pathname === item.href && 'bg-slate-700'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
