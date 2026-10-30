import { expect, test } from 'bun:test'
import postcss from 'postcss'
// @ts-expect-error Build-only JavaScript plugin, covered by integration below.
import pixelsToRem from '../config/pixels-to-rem.mjs'

test('generated Tailwind utilities scale in rem while hairlines, URLs and opt-outs stay intact', async () => {
  const source = 'a{padding:12px;border:1px solid;transform:translateX(-24px);width:calc(100% - 32px);background:url("image-24px.png");height:/* no-px2rem */20px}@media(max-width:680px){a{margin:16px}}'
  const { css } = await postcss([pixelsToRem()]).process(source, { from: undefined })
  expect(css).toContain('padding:0.75rem')
  expect(css).toContain('border:1px solid')
  expect(css).toContain('translateX(-1.5rem)')
  expect(css).toContain('calc(100% - 2rem)')
  expect(css).toContain('image-24px.png')
  expect(css).toContain('*/20px')
  expect(css).toContain('max-width:42.5rem')
})


test('the Tailwind pipeline converts generated arbitrary utilities and responsive breakpoints', async () => {
  // @ts-expect-error Build configuration is JavaScript.
  const { default: config } = await import('../postcss.config.mjs')
  const file = new URL('../app/style.css', import.meta.url)
  const { css } = await postcss(config.plugins).process(await Bun.file(file).text(), { from: file.pathname })
  expect(css).toMatch(/grid-template-columns:\s*1\.125rem/)
  expect(css).toContain('42.5rem')
  expect(css).not.toMatch(/grid-template-columns:\s*18px/)
})
