'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { CV } from '@/features/cv/types'
import { isGoogleDriveUrl } from '@/lib/utils/image'

const PDFViewer = dynamic(
  () => import('./PDFViewer').then(m => m.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="swiss-diagonal flex h-64 w-full items-center justify-center bg-[#F2F2F2]">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#999]">
          Loading CV...
        </span>
      </div>
    ),
  }
)

interface CVSectionProps {
  cv: CV | null
}

const LOCAL_CV_PATH = '/cv-giabao.pdf'
const COLLAPSED_H   = 480

export function CVSection({ cv }: CVSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  if (!cv) {
    return (
      <section id="cv" className="border-b-4 border-black scroll-mt-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="border-b border-black/10 py-6">
            <span className="swiss-section-number">04. CV</span>
          </div>
          <div className="py-16">
            <h2 className="swiss-heading text-5xl text-black sm:text-7xl">CV</h2>
            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[#999]">
              CV is not available yet.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const fileUrl = cv.file_url && !isGoogleDriveUrl(cv.file_url)
    ? cv.file_url
    : LOCAL_CV_PATH

  const isDriveSource = cv.file_url ? isGoogleDriveUrl(cv.file_url) : false

  function handleCollapse() {
    setExpanded(false)
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 400)
  }

  return (
    <section ref={sectionRef} id="cv" className="border-b-4 border-black scroll-mt-16">
      <div className="mx-auto max-w-6xl px-6">

        {/* Section header */}
        <div className="border-b border-black/10 py-6">
          <span className="swiss-section-number">04. CV</span>
        </div>

        <div className="py-16 lg:py-24">

          {/* Heading */}
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="swiss-heading text-5xl text-black sm:text-7xl lg:text-8xl">
                Curriculum<br />
                <span className="text-[#FF3000]">Vitae</span>
              </h2>
            </div>
            <div className="flex flex-col justify-end gap-6 lg:col-span-5">
              {cv.summary && (
                <p className="max-w-sm text-sm leading-relaxed text-[#666]">
                  {cv.summary}
                </p>
              )}

              {/* Download button — Swiss CTA */}
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex w-fit items-center gap-3 border-2 border-black bg-black px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-white transition-all duration-150 hover:bg-[#FF3000] hover:border-[#FF3000]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download CV
              </a>
            </div>
          </div>

          {/* Drive warning */}
          {isDriveSource && (
            <div className="mb-6 border-l-4 border-[#FF3000] bg-[#F2F2F2] px-6 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-black">
                ⚠ Google Drive link detected — serving from local file.
              </p>
              <p className="mt-1 text-xs text-[#999]">
                Drop <code className="font-bold text-black">cv-giabao.pdf</code> into{' '}
                <code className="font-bold text-black">/public</code> to enable the preview.
              </p>
            </div>
          )}

          {/* Collapsible PDF preview */}
          <div className="relative border-2 border-black">

            <motion.div
              initial={false}
              animate={{ height: expanded ? 'auto' : COLLAPSED_H }}
              transition={{ duration: 0.4, ease: [0.33, 0, 0, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <PDFViewer url={fileUrl} title={cv.title ?? 'CV'} />

              {cv.content && (
                <div className="p-8">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-[#666]">
                    {cv.content}
                  </pre>
                </div>
              )}
            </motion.div>

            {/* Gradient fade overlay */}
            <AnimatePresence>
              {!expanded && (
                <motion.div
                  key="gradient"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-white via-white/80 to-transparent"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Toggle button */}
          <div className="mt-6 flex justify-center">
            {!expanded ? (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="inline-flex items-center gap-2 border-2 border-black bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition-all duration-150 hover:bg-black hover:text-white"
              >
                <ChevronDown />
                View Full CV
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCollapse}
                className="inline-flex items-center gap-2 border-2 border-black bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition-all duration-150 hover:bg-black hover:text-white"
              >
                <ChevronUp />
                Collapse View
              </button>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}

function ChevronDown() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function ChevronUp() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  )
}
