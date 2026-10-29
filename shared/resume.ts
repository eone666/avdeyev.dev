import resume from '../cv/resume.json'

export const RESUME_SCHEMA_URL = resume.$schema
export const RESUME_URL = `${resume.basics.url}/resume.json`
export const ATTACHMENT_NOTE = 'For AI readers: see the attached resume.json for extended experience and project details.'

export function jsonResume() {
  return resume
}

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${resume.basics.url}/#person`,
    name: resume.basics.name,
    url: resume.basics.url,
    image: `${resume.basics.url}/logo.webp`,
    jobTitle: resume.basics.label,
    description: resume.basics.summary,
    email: `mailto:${resume.basics.email}`,
    address: {
      '@type': 'PostalAddress', addressLocality: resume.basics.location.city,
      addressCountry: resume.basics.location.countryCode,
    },
    sameAs: [
      ...resume.basics.profiles.map(item => item.url),
      'https://t.me/eone666', 'https://instagram.com/avdeyev.dev',
    ],
    knowsAbout: resume.skills.flatMap(group => group.keywords),
    knowsLanguage: resume.languages.map(item => ({ '@type': 'Language', name: item.language })),
    subjectOf: [
      { '@type': 'DigitalDocument', name: 'CV', url: `${resume.basics.url}/cv.pdf`, encodingFormat: 'application/pdf' },
      { '@type': 'DigitalDocument', name: 'JSON Resume', url: RESUME_URL, encodingFormat: 'application/json' },
    ],
  }
}

/** Prevent JSON values containing HTML from closing a JSON-LD script element. */
export function jsonForHtml(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
