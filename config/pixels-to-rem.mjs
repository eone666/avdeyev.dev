// Adapted from raison-web-2/lib/px2rem-postcss/plugin.mjs.
// This parser also supports Tailwind's modern media-query range syntax.
import valueParser from 'postcss-value-parser'

export function pluginPixelsToRem({ base = 16, optOutPragma = 'no-px2rem' } = {}) {
  function convert(value) {
    if (!value.includes('px') || value.length > 512) return value
    const parsed = valueParser(value)
    parsed.walk(node => {
      if (node.type === 'function' && node.value.toLowerCase() === 'url') return false
      if (node.type !== 'word') return
      node.value = node.value.replace(/(^|[<>=])(-?(?:\d*\.)?\d+)px\b/g, (match, prefix, number) => {
        const pixels = Number(number)
        return Math.abs(pixels) <= 1 ? match : `${prefix}${pixels / base}rem`
      })
    })
    return parsed.toString()
  }
  return {
    postcssPlugin: 'pixels-to-rem',
    Declaration(decl) {
      if (!(decl.raws.between || '').includes(optOutPragma)) decl.value = convert(decl.value)
    },
    AtRule: {
      media(rule) {
        if (!(rule.raws.afterName || '').includes(optOutPragma)) rule.params = convert(rule.params)
      }
    }
  }
}
export default pluginPixelsToRem
