import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure once — these are server-only environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string | null) ?? 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed.' }, { status: 400 })
    }

    // Validate file size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds the 5 MB limit.' }, { status: 400 })
    }

    // Convert File → ArrayBuffer → Buffer for the Cloudinary SDK
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload via stream — works in Edge-compatible runtime
    const result = await new Promise<{
      public_id: string
      secure_url: string
      width: number
      height: number
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          // Auto-detect face for smart cropping on delivery
          // (g_face is applied at URL level, not during upload)
          resource_type: 'image',
          // Eager transformation: pre-generate a 500×500 face-crop variant
          eager: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face', fetch_format: 'auto', quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error('Upload failed'))
          else resolve(result as typeof result & { width: number; height: number })
        }
      )
      stream.end(buffer)
    })

    return NextResponse.json({
      publicId: result.public_id,
      url: result.secure_url,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[/api/upload]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Increase body size limit to accept image uploads
export const config = {
  api: {
    bodyParser: false,
  },
}
