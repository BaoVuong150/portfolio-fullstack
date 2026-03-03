'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { CV } from '@/features/cv/types'
import { isGoogleDriveUrl } from '@/lib/utils/image'

// ssr:false — pdfjs uses DOMMatrix/canvas/ResizeObserver which don't exist in Node
const PDFViewer = dynamic(
  () => import('./PDFViewer').then(m => m.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full animate-pulse items-center justify-center bg-gray-50">
        <span className="text-sm text-gray-300">Loading CV...</span>
      </div>
    ),
  }
)

interface CVSectionProps {
  cv: CV | null
}

const LOCAL_CV_PATH = '/cv-giabao.pdf'
const COLLAPSED_H   = 480   // px shown when collapsed

export function CVSection({ cv }: CVSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  if (!cv) {
    return (
      <section id="cv" className="border-b border-gray-100 scroll-mt-16">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">CV</h2>
          <p className="mt-6 text-sm text-gray-400">CV is not available yet.</p>
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
    <section ref={sectionRef} id="cv" className="border-b border-gray-100 scroll-mt-16">
      <div className="mx-auto max-w-5xl px-6 py-20">

        {/* ── Heading ── */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
            {cv.title ?? 'Curriculum Vitae'}
          </h2>
          {cv.summary && (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-500">
              {cv.summary}
            </p>
          )}
        </div>

        {/* ── Drive warning ── */}
        {isDriveSource && (
          <p className="mb-4 text-xs text-gray-400">
            ⚠ The CV stored in the database uses a Google Drive link which cannot be
            previewed here. Serving from local file instead.{' '}
            <span className="font-medium text-black">
              Drop <code>cv-giabao.pdf</code> into <code>/public</code> to enable the preview.
            </span>
          </p>
        )}

        {/* ── Download button ── */}
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="mb-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-all hover:opacity-75 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download CV
        </a>

        {/* ── Collapsible PDF preview ── */}
        <div className="relative rounded-xl border border-gray-100 shadow-sm">

          {/* Animated height wrapper */}
          <motion.div
            initial={false}
            animate={{ height: expanded ? 'auto' : COLLAPSED_H }}
            transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <PDFViewer url={fileUrl} title={cv.title ?? 'CV'} />

            {/* Rich text fallback */}
            {cv.content && (
              <div className="p-8">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                  {cv.content}
                </pre>
              </div>
            )}
          </motion.div>

          {/* Gradient fade overlay — appears when collapsed */}
          <AnimatePresence>
            {!expanded && (
              <motion.div
                key="gradient"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-36 rounded-b-xl bg-gradient-to-t from-white via-white/75 to-transparent"
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── Toggle button — sits beneath the card ── */}
        <div className="mt-5 flex justify-center">
          {!expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:shadow-md active:scale-95"
            >
              <ChevronDown />
              View Full CV
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCollapse}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:shadow-md active:scale-95"
            >
              <ChevronUp />
              Collapse View
            </button>
          )}
        </div>

      </div>
    </section>
  )
}

// ── Inline micro-icons ───────────────────────────────────────────────────────

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
