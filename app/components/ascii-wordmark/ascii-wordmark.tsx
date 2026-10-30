import { cva } from 'class-variance-authority'
import { asciiWordmark } from '@/lib/terminal'

const wordmarkStyles = cva('wordmark inline-block shrink-0 leading-ascii text-primary drop-shadow-ascii', {
  variants: { size: {
    identity: 'mx-auto my-0 text-[clamp(8px,1.1vw,15px)] narrow:text-[clamp(6px,2vw,11px)] wide:text-base',
    error: 'my-9 text-[clamp(14px,3vw,24px)]',
  } }, defaultVariants: { size: 'identity' },
})
export type AsciiWordmarkProps = { text: string; size?: 'identity' | 'error' }

/** Draw the ASCII cell grid without platform-dependent block-glyph fallbacks. */
export function AsciiWordmark({ text, size }: AsciiWordmarkProps) {
  const rows = asciiWordmark(text).split('\n')
  const columns = rows[0].length
  // Match the mono font's 0.6em advance and the original 1.05em row height.
  const cellWidth = 6
  const cellHeight = 10.5
  const width = columns * cellWidth
  const height = rows.length * cellHeight
  const path = rows.flatMap((row, index) => Array.from(row.matchAll(/█+/g), run => {
    const x = run.index * cellWidth
    const y = index * cellHeight
    const length = run[0].length * cellWidth
    return `M${x} ${y}h${length}v${cellHeight}h-${length}z`
  })).join('')
  return <svg
    class={wordmarkStyles({ size })}
    width={`${width / 10}em`} height={`${height / 10}em`}
    viewBox={`0 0 ${width} ${height}`} fill="currentColor"
    shape-rendering="crispEdges" aria-hidden="true" focusable="false"
  ><path d={path} /></svg>
}
