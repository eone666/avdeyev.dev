import { expect, test } from 'bun:test'
import profile from './profile.json'

test('profile dates preserve their known precision and chronological order', () => {
  expect(profile.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  for (const job of profile.work) {
    expect(job.startDate).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/)
    if (job.endDate !== null) {
      expect(job.endDate).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/)
      expect(job.endDate >= job.startDate).toBe(true)
    }
  }
  for (const education of profile.education) {
    expect(education.startDate).toMatch(/^\d{4}$/)
    expect(education.endDate).toMatch(/^\d{4}$/)
  }
})

test('skill names are unique and experience references resolve to profile entries', () => {
  const keywords = profile.skills.flatMap(group => group.keywords)
  expect(new Set(keywords).size).toBe(keywords.length)
  for (const group of profile.skills) {
    for (const ref of group.experienceRefs ?? []) {
      expect(ref).toMatch(/^#\/(work|projectDetails)\/\d+$/)
      const [, collection, index] = ref.split('/')
      const entries = collection === 'work' ? profile.work : profile.projectDetails
      expect(entries[Number(index)]).toBeDefined()
    }
  }
})

test('selected projects have matching expanded entries and confirmed technology lists', () => {
  for (const selected of profile.selectedProjects) {
    const expanded = profile.projectDetails.find(project => project.name === selected.name)
    expect(expanded?.url).toBe(selected.url)
  }
  for (const job of profile.work) {
    expect(job.projects.length).toBeGreaterThan(0)
    for (const project of job.projects) {
      expect(project.role.length).toBeGreaterThan(0)
      for (const technology of project.technologies) {
        expect(job.technologies).toContain(technology)
      }
    }
  }
})
