/** @jsxImportSource react */
import { describe, expect, test } from 'bun:test'
import { renderCv } from './render'
import { checkCv } from './check'

describe('CV document', () => {
  test('renders as exactly two A4 pages', async () => {
    const { pdf, layout, profileJson, resumeJson } = await renderCv()

    expect(layout.pages).toHaveLength(2)
    expect(pdf.byteLength).toBeGreaterThan(0)
    await checkCv(pdf, profileJson, resumeJson)
  })
})
