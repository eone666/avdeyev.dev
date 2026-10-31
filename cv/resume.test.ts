import { expect, test } from 'bun:test'
import resume from './resume.json'
import presentation from './presentation.json'
import { validateResume } from './lib/resume-validation'

test('the complete machine-readable source conforms to JSON Resume', () => {
  expect(() => validateResume(resume)).not.toThrow()
  expect(resume.work).toHaveLength(4)
  expect(resume.projects.some(item => item.name === 'mc-telegram-notifier — dev')).toBe(true)
  expect(resume.projects.some(item => item.entity === 'LLC Rating')).toBe(true)
  expect(resume.projects.flatMap(item => item.highlights ?? []).some(text => text.includes('1000+ downloads'))).toBe(true)
})

test('displayed jobs and projects resolve to the complete resume', () => {
  for (const visible of presentation.work) {
    expect(resume.work.find(job => job.name === visible.name)).toBeDefined()
  }
  expect(presentation.work.some(job => job.name === 'LLC Megagroup IT')).toBe(false)
  for (const visible of presentation.projects) {
    expect(resume.projects.find(project => project.name === visible.name)?.url).toBe(visible.url)
  }
})

test('employment dates retain month precision and chronological order', () => {
  for (const job of resume.work) {
    expect(job.startDate).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/)
    if (job.endDate) {
      expect(job.endDate).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/)
      expect(job.endDate >= job.startDate).toBe(true)
    }
  }
})
