'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PDFViewerProps {
  url: string
  title?: string
}

export function PDFViewer({ url, title }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)
  // Container width drives the Page width so canvas fills available space
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Measure container width on mount + resize  
  useEffect(() => {
    function measure() {
      if (wrapperRef.current) setContainerWidth(wrapperRef.current.clientWidth)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    return () => ro.disconnect()
  }, [])

  const onLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }, [])

  const onLoadError = useCallback((err: Error) => {
    setError(err.message)
    setLoading(false)
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 py-16 text-center">
        <p className="text-sm text-gray-400">Could not load CV preview.</p>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="text-sm font-medium text-black underline underline-offset-2 hover:opacity-70">
          Open PDF directly ↗
        </a>
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="w-full">
      {loading && (
        <div className="flex h-64 w-full animate-pulse items-center justify-center rounded-xl bg-gray-50">
          <span className="text-sm text-gray-300">Loading CV...</span>
        </div>
      )}

      <Document
        file={url}
        onLoadSuccess={onLoadSuccess}
        onLoadError={onLoadError}
        loading={null}
        aria-label={title ?? 'CV document'}
        className="flex flex-col items-center gap-0"
      >
        {containerWidth > 0 && Array.from({ length: numPages }, (_, i) => (
          <div
            key={i}
            className={`w-full bg-white ${i > 0 ? 'border-t border-gray-100' : ''}`}
            // Sharp canvas: override image-rendering for crisp text
            style={{ imageRendering: '-webkit-optimize-contrast' } as React.CSSProperties}
          >
            <Page
              pageNumber={i + 1}
              // width × devicePixelRatio = 2× canvas resolution → crisp text on retina
              width={containerWidth * Math.min(window.devicePixelRatio ?? 1, 2)}
              scale={1 / Math.min(window.devicePixelRatio ?? 1, 2)}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="!w-full [&_canvas]:!w-full [&_canvas]:!h-auto"
            />
          </div>
        ))}
      </Document>
    </div>
  )
}
