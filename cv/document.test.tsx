/** @jsxImportSource react */
import { describe, expect, test } from 'bun:test'
import { renderDocumentWithLayout } from '@formepdf/core'
import document from './document'

describe('CV document', () => {
  test('renders as exactly two A4 pages', async () => {
    const { pdf, layout } = await renderDocumentWithLayout(document)

    expect(layout.pages).toHaveLength(2)
    expect(pdf.byteLength).toBeGreaterThan(0)
  })
})
