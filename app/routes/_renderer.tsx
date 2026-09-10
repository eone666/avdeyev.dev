import { jsxRenderer } from 'hono/jsx-renderer'
import { Link } from 'honox/server'

const DEFAULT_TITLE = 'Ivan Avdeyev | Frontend Developer'
const DEFAULT_DESCRIPTION = 'Frontend developer Ivan Avdeyev — projects, professional profiles, contact details and CV.'
const DEFAULT_VIEWPORT = 'width=device-width, initial-scale=1'
const SITE_URL = 'https://avdeyev.dev'
const SOCIAL_IMAGE = `${SITE_URL}/logo.webp`
const manifestFiles = import.meta.glob<{ default: Record<string, { file: string }> }>(
  '/dist/.vite/manifest.json',
  { eager: true }
)
const manifest = Object.values(manifestFiles)[0]?.default
const clientEntry = (source: string) => import.meta.env.PROD
  ? `/${manifest?.[source.replace(/^\//, '')]?.file}`
  : source

export default jsxRenderer(({ children, title, description, canonical, robots, viewport }) => {
  const pageTitle = title ?? DEFAULT_TITLE
  const pageDescription = description ?? DEFAULT_DESCRIPTION
  const pageUrl = canonical ?? SITE_URL
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Ivan Avdeyev',
    url: SITE_URL,
    image: SOCIAL_IMAGE,
    jobTitle: 'Frontend Developer',
    email: 'mailto:contact@avdeyev.dev',
    sameAs: [
      'https://github.com/eone666',
      'https://www.linkedin.com/in/eone666/',
      'https://t.me/eone666',
      'https://instagram.com/avdeyev.dev'
    ]
  }

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content={viewport ?? DEFAULT_VIEWPORT} />
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="theme-color" content="#0e0e0e" />
        {robots && <meta name="robots" content={robots} />}
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="profile" />
        <meta property="og:site_name" content="Avdeyev.dev" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={SOCIAL_IMAGE} />
        <meta property="og:image:width" content="640" />
        <meta property="og:image:height" content="640" />
        <meta property="og:image:alt" content="Avdeyev.dev logo" />
        <meta property="profile:first_name" content="Ivan" />
        <meta property="profile:last_name" content="Avdeyev" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={SOCIAL_IMAGE} />
        <meta name="twitter:image:alt" content="Avdeyev.dev logo" />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon-96.png" type="image/png" sizes="96x96" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <Link href="/app/style.css" rel="stylesheet" />
        <script type="module" src={clientEntry('/app/voxel-background-client.ts')} />
        <script type="module" src={clientEntry('/app/share-client.ts')} />
        <noscript>
          <style>{`.voxel-background{background-image:url('/voxel-background-fallback.webp');filter:none;transform:none}`}</style>
        </noscript>
      </head>
      <body class="antialiased font-mono">{children}</body>
    </html>
  )
})
