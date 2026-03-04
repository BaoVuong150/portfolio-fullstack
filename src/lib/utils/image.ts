/**
 * Detects whether a URL points to Google Drive.
 * Google Drive share links cannot be fetched by the Next.js Image Optimization
 * server because they return 403/CORS errors when accessed server-side.
 */
export function isGoogleDriveUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    return hostname === 'drive.google.com' || hostname === 'docs.google.com'
  } catch {
    return false
  }
}

/**
 * Transforms a Google Drive share link into a direct embed URL.
 * NOTE: Use a plain <img> tag for Drive URLs — Next/Image can't proxy them.
 */
export function transformGoogleDriveUrl(url: string): string {
  try {
    const match = url.match(/\/file\/d\/([^/]+)/)
    if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`
    const urlObj = new URL(url)
    const id = urlObj.searchParams.get('id')
    if (id) return `https://drive.google.com/uc?export=view&id=${id}`
  } catch {
    // fall through
  }
  return url
}

// ---------------------------------------------------------------------------
// Cloudinary helpers
// ---------------------------------------------------------------------------

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'ddfxi9d4l'
const CDN_BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`

/**
 * Returns a smart-crop URL that centres on a detected face.
 * Falls back to centre-gravity cropping if no face is detected.
 *
 * @param publicId  The Cloudinary public_id returned after upload
 *                  e.g. "avatars/abc123"
 * @param size      Output pixel size (square). Default 500.
 */
export function getSmartCropUrl(publicId: string, size = 500): string {
  const transforms = `c_fill,g_face,w_${size},h_${size},f_auto,q_auto`
  return `${CDN_BASE}/${transforms}/${publicId}`
}

/**
 * Returns a plain auto-quality/format URL without any cropping.
 * Good for project thumbnail images (non-square).
 *
 * @param publicId  Cloudinary public_id
 * @param width     Output width. Height is auto-calculated.
 */
export function getOptimizedUrl(publicId: string, width = 800): string {
  const transforms = `f_auto,q_auto,w_${width}`
  return `${CDN_BASE}/${transforms}/${publicId}`
}

/** Returns true if the URL is from Cloudinary */
export function isCloudinaryUrl(url: string): boolean {
  try {
    return new URL(url).hostname === 'res.cloudinary.com'
  } catch {
    return false
  }
}

/**
 * Helper to safely inject or replace Cloudinary transforms without brittle regex.
 */
function injectCloudinaryTransform(url: string, newTransform: string): string | null {
  if (!url) return null
  if (!isCloudinaryUrl(url)) return url

  const parts = url.split('/upload/')
  if (parts.length !== 2) return url

  let imagePath = parts[1]
  const segments = imagePath.split('/')
  
  // Detect if the first segment is an existing transform (contains ',' or '_' but not a version string like 'v1234')
  if (segments.length > 1 && (segments[0].includes(',') || (segments[0].includes('_') && !/^v\d+$/.test(segments[0])))) {
    imagePath = segments.slice(1).join('/')
  }

  return `${parts[0]}/upload/${newTransform}/${imagePath}`
}

/**
 * Returns a 16:9 auto-cropped Cloudinary URL for project thumbnails.
 * Injects: c_fill,w_400,h_225,g_auto,q_auto,f_auto
 */
export function getProjectThumbnail(url: string | null | undefined): string | null {
  if (!url) return null
  return injectCloudinaryTransform(url, 'c_fill,w_400,h_225,g_auto,q_auto,f_auto')
}

/**
 * Returns a 16:9 auto-cropped Cloudinary URL optimized specifically for the Admin panel.
 * Uses a smaller width (400) to save bandwidth.
 * Injects: c_fill,g_auto,w_400,h_225,q_auto,f_auto
 */
export function getAdminOptimizedUrl(url: string | null | undefined): string | null {
  if (!url) return null
  return injectCloudinaryTransform(url, 'c_fill,g_auto,w_400,h_225,q_auto,f_auto')
}

/**
 * Returns a 16:9 auto-cropped Cloudinary URL optimized specifically for the Admin Project List.
 * Uses a small width (300x169) for fast loading thumbnails.
 * Injects: c_fill,w_300,h_169,g_auto,q_auto:eco,f_auto
 */
export function getAdminListThumbnailUrl(url: string | null | undefined): string | null {
  if (!url) return null
  return injectCloudinaryTransform(url, 'c_fill,w_300,h_169,g_auto,q_auto:eco,f_auto')
}

/**
 * Returns an auto face-crop Cloudinary URL optimized for Admin avatars and covers.
 * Injects: c_fill,ar_16:9,g_auto,q_auto:eco,f_auto
 */
export function getAdminFaceCropUrl(url: string | null | undefined): string | null {
  if (!url) return null
  return injectCloudinaryTransform(url, 'c_fill,ar_16:9,g_auto,q_auto:eco,f_auto')
}

/**
 * Returns an auto face-crop Cloudinary URL optimized for Public avatars.
 *
 * Transform breakdown:
 *  - c_thumb   : smart thumbnail crop (respects gravity)
 *  - g_face    : anchor crop to detected face
 *  - z_0.6     : zoom factor 0.6 = pulls back 40% from face → includes shoulders & background
 *  - h_400,w_400 : 400×400 output for Retina sharpness (displayed at 200px via CSS)
 *  - q_auto,f_auto : auto quality + WebP/AVIF format
 *  - r_max     : full circle crop
 */
export function getPublicFaceCropUrl(url: string | null | undefined): string | null {
  if (!url) return null
  return injectCloudinaryTransform(url, 'c_thumb,g_face,z_0.6,h_400,w_400,q_auto,f_auto,r_max')
}

