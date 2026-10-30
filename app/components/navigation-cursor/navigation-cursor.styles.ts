import { cva } from 'class-variance-authority'

export const cursorStyles = cva('cursor invisible shrink-0 text-lg leading-none text-primary keyboard:group-focus-visible:visible pointer:group-active:visible pointer:group-hover:visible', {
  variants: { placement: {
    item: 'pt-px mobile:hidden',
    action: 'absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-background',
  } }, defaultVariants: { placement: 'item' },
})
