import profile from '../cv/profile.json'

export const RESUME_SCHEMA_URL = 'https://raw.githubusercontent.com/jsonresume/resume-schema/b25e3f4bbafd349c2c5bbaa62602c03c228762db/schema.json'
export const PROFILE_URL = `${profile.basics.url}/profile.json`
export const RESUME_URL = `${profile.basics.url}/resume.json`

/** Standard fields are projected from the extended author-maintained profile. */
export function jsonResume() {
  return {
    $schema: RESUME_SCHEMA_URL,
    basics: profile.basics,
    work: profile.work.map(job => ({
      name: job.company,
      position: job.position,
      startDate: job.startDate,
      ...(job.endDate ? { endDate: job.endDate } : {}),
      location: job.remote ? 'Remote' : [job.location?.city, job.location?.countryCode].filter(Boolean).join(', '),
      highlights: job.highlights,
    })),
    education: profile.education.map(item => ({
      institution: item.institution, area: item.area, studyType: item.studyType,
      startDate: item.startDate, endDate: item.endDate, courses: item.qualifications,
    })),
    skills: profile.skills.map(({ name, keywords }) => ({ name, keywords })),
    languages: profile.languages.map(({ language, fluency }) => ({ language, fluency })),
    projects: profile.projectDetails.flatMap(project => [
      { name: project.name, url: project.url, description: project.summary, highlights: project.highlights, keywords: project.technologies },
      ...('subprojects' in project ? project.subprojects ?? [] : []).map(sub => ({
        name: sub.name, url: sub.url, description: sub.summary, keywords: sub.technologies,
      })),
    ]),
    meta: { canonical: RESUME_URL, lastModified: profile.reviewedAt },
  }
}

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${profile.basics.url}/#person`,
    name: profile.basics.name,
    url: profile.basics.url,
    image: `${profile.basics.url}/logo.webp`,
    jobTitle: profile.basics.label,
    description: profile.basics.summary,
    email: `mailto:${profile.basics.email}`,
    address: {
      '@type': 'PostalAddress', addressLocality: profile.basics.location.city,
      addressCountry: profile.basics.location.countryCode,
    },
    sameAs: [
      ...profile.basics.profiles.map(item => item.url),
      'https://t.me/eone666', 'https://instagram.com/avdeyev.dev',
    ],
    knowsAbout: profile.skills.flatMap(group => group.keywords),
    knowsLanguage: profile.languages.map(item => ({ '@type': 'Language', name: item.language, alternateName: item.code })),
    subjectOf: [
      { '@type': 'DigitalDocument', name: 'CV', url: `${profile.basics.url}/cv.pdf`, encodingFormat: 'application/pdf' },
      { '@type': 'DigitalDocument', name: 'Extended professional profile', url: PROFILE_URL, encodingFormat: 'application/json' },
      { '@type': 'DigitalDocument', name: 'JSON Resume', url: RESUME_URL, encodingFormat: 'application/json' },
    ],
  }
}

/** Prevent JSON values containing HTML from closing a JSON-LD script element. */
export function jsonForHtml(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
