import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>

      {/* ── Mesh gradient background ─────────────────────────────────────
          fixed + -z-10 → sits below all content, persists through scroll.
          All animation is CSS keyframes on the compositor thread (no JS).
          blur-[96px] ensures colours bleed into each other as mesh gradient.
      ─────────────────────────────────────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        {/* Blob 1 — top-left, sky blue, 14s loop */}
        <div className="animate-blob absolute -left-48 -top-48 h-[640px] w-[640px] rounded-full bg-sky-100/70 blur-[96px]" />

        {/* Blob 2 — top-right, violet, starts 2s late */}
        <div className="animate-blob animation-delay-2000 absolute -right-48 -top-24 h-[540px] w-[540px] rounded-full bg-violet-100/60 blur-[96px]" />

        {/* Blob 3 — bottom-center, warm rose, starts 4s late */}
        <div className="animate-blob animation-delay-4000 absolute -bottom-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-rose-50/70 blur-[80px]" />

        {/* Blob 4 — mid-left, amber accent, starts 6s late */}
        <div className="animate-blob animation-delay-6000 absolute left-[10%] top-[45%] h-[360px] w-[360px] rounded-full bg-amber-50/60 blur-[80px]" />

        {/* Grain noise — SVG fractalNoise texture baked into data URI.
            opacity 0.03, mix-blend-mode: overlay → adds film-grain material feel */}
        <div className="noise absolute inset-0" />

        {/* White centre wash — keeps body text fully legible */}
        <div className="absolute inset-0 bg-white/55" />
      </div>

      <Navbar />
      <main className="pt-14">{children}</main>
      <Footer />
    </SmoothScrollProvider>
  )
}
