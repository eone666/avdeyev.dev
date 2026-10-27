/** @jsxImportSource react */
import { describe, expect, test } from 'bun:test'
import { renderCv } from './render'
import { checkCv } from './check'

describe('CV document', () => {
  test('renders as exactly two A4 pages', async () => {
    const { pdf, layout, profileJson, resumeJson } = await renderCv()

    expect(layout.pages).toHaveLength(2)
    expect(pdf.byteLength).toBeGreaterThan(0)
    const finalPage = layout.pages[layout.pages.length - 1]
    const footer = finalPage.elements.find(element => element.nodeType === 'FixedFooter')
    expect(footer).toBeDefined()
    const bodyBottom = Math.max(...finalPage.elements
      .filter(element => element.nodeType !== 'FixedFooter')
      .map(element => element.y + element.height))
    expect(footer!.y - bodyBottom).toBeGreaterThanOrEqual(12)
    await checkCv(pdf, profileJson, resumeJson)
  })
})
