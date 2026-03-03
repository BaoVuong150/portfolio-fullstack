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
        <p className="text-gray-400">Profile not found.</p>
      </section>
    )
  }

  const renderAvatar = () => {
    if (!profile.avatar_url) {
      // Initials fallback
      return (
        <div className="flex h-48 w-48 items-center justify-center rounded-full border-2 border-gray-100 bg-gray-50">
          <span className="text-5xl font-bold text-gray-200">
            {profile.full_name.charAt(0).toUpperCase()}
          </span>
        </div>
      )
    }

    // Google Drive images cannot be proxied by Next.js Image Optimization
    if (isGoogleDriveUrl(profile.avatar_url)) {
      return (
        <div className="relative h-48 w-48 overflow-hidden rounded-full border-2 border-gray-100">
          <img
            src={transformGoogleDriveUrl(profile.avatar_url)}
            alt={profile.full_name}
            className="h-full w-full object-cover"
          />
        </div>
      )
    }

    return (
      <div className="relative h-48 w-48 overflow-hidden rounded-full border-2 border-gray-100">
        <Image
          src={getPublicFaceCropUrl(profile.avatar_url) || profile.avatar_url}
          alt={profile.full_name}
          fill
          sizes="192px"
          className="object-cover"
          priority
        />
      </div>
    )
  }

  return (
    <section
      id="about"
      className="flex min-h-[90vh] items-center border-b border-gray-100"
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-24">
        <div className="flex flex-col-reverse gap-12 sm:flex-row sm:items-center sm:justify-between">
          {/* Text Content */}
          <div className="flex flex-col gap-5 sm:max-w-lg">
            <div className="flex flex-col gap-5">
              <span className="text-sm font-medium uppercase tracking-widest text-gray-400">
                Hello, I&apos;m
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
                {profile.full_name}
              </h1>
              {profile.title && (
                <p className="text-lg font-medium text-gray-500">{profile.title}</p>
              )}
            </div>

            {profile.bio && (
              <p className="leading-relaxed text-gray-600">{profile.bio}</p>
            )}

            {profile.goal && (
              <p className="text-sm italic text-gray-400">{profile.goal}</p>
            )}

            {/* Social links */}
            <div className="mt-2 flex flex-wrap gap-3">
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-black transition-all hover:bg-black hover:text-white"
                >
                  GitHub ↗
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-black transition-all hover:bg-black hover:text-white"
                >
                  LinkedIn ↗
                </a>
              )}
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-black transition-all hover:bg-black hover:text-white"
                >
                  Email ↗
                </a>
              )}
              <a
                href="#contact"
                className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white transition-all hover:opacity-80"
              >
                Get in touch →
              </a>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex-shrink-0">
            {renderAvatar()}
          </div>
        </div>
      </div>
    </section>
  )
}
