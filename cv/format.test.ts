import { expect, test } from 'bun:test'
import { locationText, workDateText } from './format'
import profile from './profile.json'

test('normalized work dates retain the existing visible date ranges', () => {
  expect(profile.work.map(item => `${workDateText(item.startDate)}–${workDateText(item.endDate)}`)).toEqual([
    'Feb 2024–Present', 'Jul 2022–Aug 2023', 'Sep 2020–Jul 2022', 'Apr 2019–May 2020',
  ])
})

test('remote work is separate from geographic locations', () => {
  expect(locationText(profile.work[1].location, profile.work[1].remote)).toBe('Remote')
  expect(profile.work[1].location).toBeNull()
  expect(locationText(profile.basics.location)).toBe('Almaty, KZ')
  expect(locationText(profile.work[2].location)).toBe('Oskemen, KZ')
})
