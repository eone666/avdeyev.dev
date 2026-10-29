import { expect, test } from 'bun:test'
import resumeSource from '../cv/resume.json'
import { jsonResume, personJsonLd, jsonForHtml, RESUME_URL } from './resume'
import { validateResume } from './resume-validation'

test('JSON Resume validates against the pinned official schema', () => {
  const resume = jsonResume()
  expect(() => validateResume(resume)).not.toThrow()
  expect(resume.work[0].name).toBe(resumeSource.work[0].name)
  expect(resume.work[0]).not.toHaveProperty('endDate')
  expect(resume.work[1].location).toBe('Remote')
  expect(resume.projects.length).toBeGreaterThan(12)
  expect(() => validateResume({ ...resume, profileVersion: 3 })).toThrow()
  expect(() => validateResume({ ...resume, work: [{ startDate: 'Feb 2024' }] })).toThrow()
})

test('JSON-LD exposes public profile identity, skills, and profile links', () => {
  const person = personJsonLd()
  expect(person['@type']).toBe('Person')
  expect(person.name).toBe(resumeSource.basics.name)
  expect(person.knowsAbout).toContain('React')
  expect(person.subjectOf.map(item => item.url)).toContain(RESUME_URL)
  expect(person.address.addressCountry).toBe('KZ')
})

test('JSON-LD serialization prevents closing the HTML script element', () => {
  const value = { name: '</script><script>alert(1)</script>' }
  const encoded = jsonForHtml(value)
  expect(encoded).not.toContain('</script>')
  expect(JSON.parse(encoded)).toEqual(value)
})
