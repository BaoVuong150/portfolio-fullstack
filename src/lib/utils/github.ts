/**
 * Parses a GitHub repo URL and returns { owner, repo }, or null if invalid.
 *
 * Accepted formats:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo/tree/main
 *   github.com/owner/repo
 */
export function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const normalised = url.startsWith('http') ? url : `https://${url}`
    const { hostname, pathname } = new URL(normalised)
    if (!hostname.includes('github.com')) return null
    const parts = pathname.replace(/^\//, '').split('/')
    if (parts.length < 2 || !parts[0] || !parts[1]) return null
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') }
  } catch {
    return null
  }
}

// ── GitHub API fetch helper ──────────────────────────────────────────────────

const GH_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

/**
 * Fetches programming languages used in the repo (sorted by byte count).
 * Returns [] if the repo doesn't exist or is not accessible.
 */
export async function getLanguagesFromRepo(githubUrl: string): Promise<string[]> {
  const parsed = parseGithubUrl(githubUrl)
  if (!parsed) return []
  const { owner, repo } = parsed

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/languages`,
    { headers: GH_HEADERS, signal: AbortSignal.timeout(8000) }
  )
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Repo not found: ${owner}/${repo}`)
    if (res.status === 403) throw new Error('GitHub rate limit exceeded. Try again later.')
    throw new Error(`GitHub API error: ${res.status}`)
  }
  const data: Record<string, number> = await res.json()
  return Object.keys(data)
}

// ── Package.json keyword map ──────────────────────────────────────────────────
//
// Key   = substring to search for inside dependencies / devDependencies keys
// Value = display name to add to tech_stack
//
const PKG_KEYWORD_MAP: Record<string, string> = {
  // Frameworks / meta-frameworks
  next:           'Next.js',
  nuxt:           'Nuxt.js',
  gatsby:         'Gatsby',
  remix:          'Remix',
  astro:          'Astro',
  sveltekit:      'SvelteKit',
  svelte:         'Svelte',
  // UI libraries
  react:          'React',
  'vue':          'Vue.js',
  angular:        'Angular',
  solid:          'SolidJS',
  preact:         'Preact',
  // Styling
  tailwindcss:    'TailwindCSS',
  'styled-components': 'Styled Components',
  'emotion':      'Emotion',
  sass:           'Sass',
  bootstrap:      'Bootstrap',
  'chakra-ui':    'Chakra UI',
  'shadcn':       'shadcn/ui',
  // State management
  redux:          'Redux',
  zustand:        'Zustand',
  jotai:          'Jotai',
  recoil:         'Recoil',
  // Backend / API
  express:        'Express',
  fastify:        'Fastify',
  hono:           'Hono',
  nestjs:         'NestJS',
  trpc:           'tRPC',
  graphql:        'GraphQL',
  'apollo':       'Apollo',
  // Auth
  'next-auth':    'NextAuth.js',
  clerk:          'Clerk',
  lucia:          'Lucia',
  // Database / ORM
  prisma:         'Prisma',
  drizzle:        'Drizzle ORM',
  mongoose:       'Mongoose',
  'typeorm':      'TypeORM',
  // Cloud / infra
  supabase:       'Supabase',
  firebase:       'Firebase',
  '@aws-sdk':     'AWS SDK',
  'cloudinary':   'Cloudinary',
  // Testing
  jest:           'Jest',
  vitest:         'Vitest',
  playwright:     'Playwright',
  cypress:        'Cypress',
  // Build / tooling
  vite:           'Vite',
  webpack:        'Webpack',
  turbo:          'Turborepo',
  // Language extras
  typescript:     'TypeScript',
  zod:            'Zod',
  'react-query':  'React Query',
  'swr':          'SWR',
  'framer-motion':'Framer Motion',
  'react-hook-form': 'React Hook Form',
}

/**
 * Fetches BOTH languages (from /languages) and popular frameworks / libraries
 * (from package.json dependencies) for a GitHub repo.
 *
 * Steps:
 *  A. Parse the URL → owner + repo
 *  B. Fetch /languages → programming language names (TypeScript, Go, …)
 *  C. Fetch /contents/package.json → decode Base64 → extract dep keys
 *  D. Match dep keys against PKG_KEYWORD_MAP → display names
 *  E. Merge both lists, deduplicate (case-insensitive), return
 *
 * Gracefully ignores private repos and missing package.json.
 */
export async function fetchFullTechStack(githubUrl: string): Promise<string[]> {
  const parsed = parseGithubUrl(githubUrl)
  if (!parsed) throw new Error('Invalid GitHub URL.')
  const { owner, repo } = parsed

  const base = `https://api.github.com/repos/${owner}/${repo}`

  // A + B: languages (required — throw if missing)
  const langsRes = await fetch(`${base}/languages`, {
    headers: GH_HEADERS,
    signal: AbortSignal.timeout(8000),
  })
  if (!langsRes.ok) {
    if (langsRes.status === 404) throw new Error(`Repo not found: ${owner}/${repo}`)
    if (langsRes.status === 403) throw new Error('GitHub rate limit exceeded.')
    throw new Error(`GitHub API error: ${langsRes.status}`)
  }
  const langsData: Record<string, number> = await langsRes.json()
  const languages = Object.keys(langsData) // already sorted by bytes desc

  // C: package.json (optional — swallow errors)
  const frameworks: string[] = []
  try {
    const pkgRes = await fetch(`${base}/contents/package.json`, {
      headers: GH_HEADERS,
      signal: AbortSignal.timeout(8000),
    })
    if (pkgRes.ok) {
      const pkgMeta = await pkgRes.json() as { content?: string; encoding?: string }
      if (pkgMeta.encoding === 'base64' && pkgMeta.content) {
        // Decode Base64 → JSON string (GitHub pads with newlines)
        const jsonStr = atob(pkgMeta.content.replace(/\n/g, ''))
        const pkg = JSON.parse(jsonStr) as {
          dependencies?: Record<string, string>
          devDependencies?: Record<string, string>
        }

        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
        }

        // D: match dep keys against the keyword map
        for (const depKey of Object.keys(allDeps)) {
          for (const [keyword, displayName] of Object.entries(PKG_KEYWORD_MAP)) {
            if (depKey === keyword || depKey.startsWith(`${keyword}/`) || depKey.includes(keyword)) {
              if (!frameworks.includes(displayName)) {
                frameworks.push(displayName)
              }
            }
          }
        }
      }
    }
  } catch {
    // package.json is optional — silently skip on any error
  }

  // E: merge + deduplicate (keep languages first, then frameworks)
  const combined = [...languages, ...frameworks]
  const seen = new Set<string>()
  const result: string[] = []
  for (const item of combined) {
    const key = item.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      result.push(item)
    }
  }
  return result
}
