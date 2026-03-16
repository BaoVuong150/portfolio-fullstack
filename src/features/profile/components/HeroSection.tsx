import Image from 'next/image'
import { Profile } from '@/features/profile/types'
import { isGoogleDriveUrl, transformGoogleDriveUrl, getPublicFaceCropUrl } from '@/lib/utils/image'

interface HeroSectionProps {
  profile: Profile | null
}

export function HeroSection({ profile }: HeroSectionProps) {
  if (!profile) {
    return (
      <section id="about" className="flex min-h-[90vh] items-center justify-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#999]">Profile not found.</p>
      </section>
    )
  }

  const renderAvatar = () => {
    if (!profile.avatar_url) {
      // Geometric initial fallback
      return (
        <div className="flex h-full w-full items-center justify-center border-4 border-black bg-[#F2F2F2]">
          <span className="text-7xl font-black uppercase text-black">
            {profile.full_name.charAt(0)}
          </span>
        </div>
      )
    }

    if (isGoogleDriveUrl(profile.avatar_url)) {
      return (
        <div className="relative h-full w-full overflow-hidden border-4 border-black">
          <img
            src={transformGoogleDriveUrl(profile.avatar_url)}
            alt={profile.full_name}
            className="h-full w-full object-cover grayscale transition-all duration-300 hover:grayscale-0"
          />
        </div>
      )
    }

    return (
      <div className="relative h-full w-full overflow-hidden border-4 border-black">
        <Image
          src={getPublicFaceCropUrl(profile.avatar_url) || profile.avatar_url}
          alt={profile.full_name}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover grayscale transition-all duration-300 hover:grayscale-0"
          priority
        />
      </div>
    )
  }

  return (
    <section
      id="about"
      className="relative min-h-screen border-b-4 border-black"
    >
      <div className="mx-auto max-w-6xl px-6">

        {/* ── Section number ── */}
        <div className="border-b border-black/10 py-6">
          <span className="swiss-section-number">01. About</span>
        </div>

        {/* ── Main content: asymmetric grid ── */}
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-12">

          {/* Left column — text (8 cols) */}
          <div className="flex flex-col justify-center border-b border-black/10 py-12 lg:col-span-7 lg:border-b-0 lg:border-r lg:border-black/10 lg:py-24 lg:pr-12">

            {/* Greeting label */}
            <span className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-[#999]">
              Hello, I&apos;m
            </span>

            {/* Massive name */}
            <h1 className="swiss-heading mb-6 text-6xl text-black sm:text-8xl lg:text-[7rem] xl:text-[9rem]">
              {profile.full_name}
            </h1>

            {/* Title */}
            {profile.title && (
              <div className="mb-8 flex items-center gap-4">
                <div className="h-1 w-12 bg-[#FF3000]" />
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-black">
                  {profile.title}
                </p>
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <p className="mb-6 max-w-lg text-sm leading-relaxed text-[#666]" style={{ textAlign: 'left' }}>
                {profile.bio}
              </p>
            )}

            {/* Goal */}
            {profile.goal && (
              <p className="mb-8 border-l-4 border-[#FF3000] pl-4 text-xs font-medium uppercase tracking-wider text-[#999]">
                {profile.goal}
              </p>
            )}

            {/* Social links — Swiss buttons */}
            <div className="flex flex-wrap gap-3">
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-black bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition-all duration-150 hover:bg-black hover:text-white"
                >
                  GitHub ↗
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-black bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition-all duration-150 hover:bg-black hover:text-white"
                >
                  LinkedIn ↗
                </a>
              )}
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2 border-2 border-black bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition-all duration-150 hover:bg-black hover:text-white"
                >
                  Email ↗
                </a>
              )}
              <a
                href="#contact"
                className="inline-flex items-center gap-2 border-2 border-[#FF3000] bg-[#FF3000] px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition-all duration-150 hover:bg-black hover:border-black"
              >
                Get in Touch →
              </a>
            </div>
          </div>

          {/* Right column — geometric composition + avatar (4 cols) */}
          <div className="relative flex items-center justify-center py-12 lg:col-span-5 lg:py-24 lg:pl-12">
            <div className="relative w-full max-w-[400px]">

              {/* Main avatar container */}
              <div className="relative aspect-[3/4] w-full">
                {renderAvatar()}
              </div>

              {/* Geometric accent elements */}
              <div className="absolute -bottom-4 -left-4 h-16 w-16 border-4 border-[#FF3000] bg-transparent" />
              <div className="absolute -right-4 -top-4 h-12 w-12 bg-black" />
              <div className="absolute -right-2 bottom-1/4 h-24 w-1 bg-[#FF3000]" />

              {/* Dot pattern overlay on corner */}
              <div className="absolute -left-8 top-0 h-32 w-32 swiss-dots opacity-50" />
            </div>
          </div>

        </div>

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-2 border-t-4 border-black sm:grid-cols-4">
          {[
            { value: '∞', label: 'Passion' },
            { value: '24/7', label: 'Dedication' },
            { value: '100%', label: 'Commitment' },
            { value: '→', label: 'Forward' },
          ].map(({ value, label }, i) => (
            <div
              key={label}
              className={`group flex flex-col gap-1 px-6 py-6 transition-colors duration-150 hover:bg-black hover:text-white ${
                i < 3 ? 'border-r border-black/10' : ''
              }`}
            >
              <span className="text-3xl font-black text-black transition-colors duration-150 group-hover:text-[#FF3000] sm:text-4xl">
                {value}
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#999] transition-colors duration-150 group-hover:text-white/60">
                {label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
