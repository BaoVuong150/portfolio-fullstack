'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { getSmartCropUrl, getOptimizedUrl, getAdminOptimizedUrl, getAdminFaceCropUrl } from '@/lib/utils/image'

interface ImageUploaderProps {
  /** Current image URL (from DB or a previous upload) */
  value: string
  /** Called with the final CDN URL after a successful upload */
  onChange: (url: string) => void
  /** Upload folder on Cloudinary e.g. "avatars" or "projects" */
  folder?: string
  /**
   * Crop mode for the returned URL:
   * - "face"   → c_fill,g_face,w_500,h_500 (best for avatars / portraits)
   * - "wide"   → f_auto,q_auto,w_800 (best for project thumbnails)
   */
  cropMode?: 'face' | 'wide'
  /** Aspect ratio hint shown to the user, e.g. "1:1" or "16:9" */
  aspectHint?: string
}

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error'

export function ImageUploader({
  value,
  onChange,
  folder = 'uploads',
  cropMode = 'wide',
  aspectHint,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [preview, setPreview] = useState(value)

  // Sync parent updates (e.g., when clicking 'Edit' on a different project)
  // unless we're in the middle of uploading a local file.
  useEffect(() => {
    if (status !== 'uploading') {
      setPreview(value)
    }
  }, [value, status])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local blob preview instantly
    const blobUrl = URL.createObjectURL(file)
    setPreview(blobUrl)
    setStatus('uploading')
    setErrorMsg('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Upload failed (HTTP ${res.status})`)
      }

      const { publicId, url } = await res.json() as { publicId: string; url: string }

      // Build the smart CDN URL based on cropMode
      const cdnUrl = cropMode === 'face'
        ? getSmartCropUrl(publicId)   // c_fill,g_face,w_500,h_500,f_auto,q_auto
        : getOptimizedUrl(publicId)   // f_auto,q_auto,w_800


      setPreview(cdnUrl)
      onChange(cdnUrl)
      setStatus('done')
    } catch (err: unknown) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed.')
      setPreview(value) // Revert on error
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const hasImage = Boolean(preview)

  return (
    <div className="flex flex-col gap-3">
      {/* Clickable preview area */}
      <div
        className={`relative flex cursor-pointer items-center justify-center border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-gray-400 w-full rounded-xl overflow-hidden min-h-[160px]`}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Click to upload image"
      >
        {hasImage ? (
          <img
            src={
              cropMode === 'wide' && !preview.startsWith('blob:') 
                ? getAdminOptimizedUrl(preview) || preview 
                : cropMode === 'face' && !preview.startsWith('blob:')
                ? getAdminFaceCropUrl(preview) || preview
                : preview
            }
            alt="Preview"
            className="w-full h-auto block"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            {/* Image placeholder icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-xs font-medium">
              Click to upload{aspectHint ? ` · ${aspectHint}` : ''}
            </span>
            <span className="text-xs text-gray-300">
              {cropMode === 'face' ? 'Auto face-crop enabled ✦' : 'JPG · PNG · WEBP'}
            </span>
          </div>
        )}

        {/* Upload in-progress overlay */}
        {status === 'uploading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 backdrop-blur-sm">
            <svg
              className="h-6 w-6 animate-spin text-black"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            <span className="text-xs font-medium text-black">Uploading to Cloudinary…</span>
          </div>
        )}

        {/* Success badge */}
        {status === 'done' && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black px-2.5 py-0.5 text-xs font-medium text-white">
            ✓ Uploaded
          </span>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === 'uploading'}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-black transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {status === 'uploading' ? 'Uploading…' : hasImage ? 'Change image' : 'Upload image'}
        </button>

        {hasImage && status !== 'uploading' && (
          <button
            type="button"
            onClick={() => { setPreview(''); onChange('') }}
            className="text-xs text-gray-400 transition-colors hover:text-black"
          >
            Remove
          </button>
        )}

        <span className="ml-auto text-xs text-gray-300">max 5 MB</span>
      </div>

      {/* Error message */}
      {status === 'error' && (
        <p className="text-xs text-red-500">✗ {errorMsg}</p>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
