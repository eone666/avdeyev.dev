import { cva } from 'class-variance-authority'
import { asciiWordmark } from '@/lib/terminal'

const wordmarkStyles = cva('wordmark inline-block text-left font-mono leading-ascii font-normal tracking-normal whitespace-pre text-primary text-shadow-ascii', {
  variants: { size: {
    identity: 'mx-auto my-0 text-[clamp(8px,1.1vw,15px)] narrow:text-[clamp(6px,2vw,11px)] wide:text-base',
    error: 'my-9 text-[clamp(14px,3vw,24px)]',
  } }, defaultVariants: { size: 'identity' },
})
export type AsciiWordmarkProps = { text: string; size?: 'identity' | 'error' }
export function AsciiWordmark({ text, size }: AsciiWordmarkProps) {
  return <pre class={wordmarkStyles({ size })} aria-hidden="true">{asciiWordmark(text)}</pre>
}
