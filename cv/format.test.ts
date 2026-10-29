import { expect, test } from 'bun:test'
import { workDateText } from './format'
import resume from './resume.json'

test('normalized work dates retain the existing visible date ranges', () => {
  expect(resume.work.map(item => `${workDateText(item.startDate)}–${workDateText(item.endDate ?? null)}`)).toEqual([
    'Feb 2024–Present', 'Jul 2022–Aug 2023', 'Sep 2020–Jul 2022', 'Apr 2019–May 2020',
  ])
})

test('remote work uses the standard JSON Resume location field', () => {
  expect(resume.work[1].location).toBe('Remote')
  expect(resume.basics.location.countryCode).toBe('KZ')
})
