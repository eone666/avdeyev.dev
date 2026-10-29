/** @jsxImportSource react */
import { describe, expect, test } from 'bun:test'
import { renderCv } from './render'
import { checkCv } from './check'
import type { ElementInfo } from '@formepdf/core'

describe('CV document', () => {
  test('renders as exactly two A4 pages', async () => {
    const { pdf, layout, resumeJson } = await renderCv()

    expect(layout.pages).toHaveLength(2)
    expect(pdf.byteLength).toBeGreaterThan(0)
    const finalPage = layout.pages[layout.pages.length - 1]
    const footer = finalPage.elements.find(element => element.nodeType === 'FixedFooter')
    expect(footer).toBeDefined()
    const bodyBottom = Math.max(...finalPage.elements
      .filter(element => element.nodeType !== 'FixedFooter')
      .map(element => element.y + element.height))
    expect(footer!.y - bodyBottom).toBeGreaterThanOrEqual(12)
    const elements = (nodes: ElementInfo[]): ElementInfo[] => nodes.flatMap(node => [node, ...elements(node.children)])
    const skillsGrid = elements(finalPage.elements).find(node =>
      node.children.length === 6 && node.children.every(child => child.width > 200))
    expect(skillsGrid).toBeDefined()
    for (let index = 0; index < 6; index += 2) {
      const [left, right] = skillsGrid!.children.slice(index, index + 2)
      expect(left.y).toBeCloseTo(right.y)
      expect(left.height).toBeCloseTo(right.height)
    }
    await checkCv(pdf, resumeJson)
  })
})
