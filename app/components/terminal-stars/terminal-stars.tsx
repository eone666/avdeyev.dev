const stars = [
  'left-2/10 top-4/10', 'left-7/10 top-2/10',
  'left-8/10 top-6/10', 'left-3/10 top-2/10',
  'left-7/10 top-8/10', 'left-1/10 top-7/10',
  'left-3/10 top-8/10 text-xs', 'left-9/10 top-3/10',
]
export function TerminalStars() {
  return <div class="pointer-events-none absolute inset-0 h-205 overflow-hidden text-base text-primary select-none narrow:h-180 mobile:h-155" aria-hidden="true">
    {stars.map((position, index) => <span class={`absolute opacity-55 narrow:opacity-25 ${position}`}>{index % 2 === 0 ? '+' : '·'}</span>)}
  </div>
}
