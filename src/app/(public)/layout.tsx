import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>

      {/* ── Swiss grid background ───────────────────────────────────────
          Subtle 24px grid pattern + noise texture on pure white canvas.
          No gradients, no blobs — just structured flatness.
      ────────────────────────────────────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        {/* Grid texture */}
        <div className="absolute inset-0 swiss-grid-pattern" />
        {/* Noise overlay */}
        <div className="swiss-noise absolute inset-0" />
      </div>

      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
    </SmoothScrollProvider>
  )
}
