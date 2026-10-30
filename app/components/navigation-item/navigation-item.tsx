import { NavigationCursor } from '../navigation-cursor'

export type NavigationItemProps = {
  href: string
  title: string
  detail?: string
  description?: string
  meta?: string
  statusDescription?: string
}

/** One layout and interaction style for every vertically navigable content link. */
export function NavigationItem({ href, title, detail, description, meta, statusDescription }: NavigationItemProps) {
  const email = href.startsWith('mailto:')
  return <a
    class="nav-item group relative grid min-h-12 grid-cols-[18px_minmax(0,1fr)_15px] items-start gap-2 border border-transparent border-b-line bg-transparent p-3 outline-none keyboard:focus-visible:border-primary pointer:active:border-primary pointer:hover:border-primary mobile:min-h-12 mobile:grid-cols-[minmax(0,1fr)_15px] mobile:px-2 mobile:text-xs"
    href={href}
    target={email ? undefined : '_blank'}
    rel={email ? undefined : 'noopener noreferrer'}
    data-description={statusDescription}
  >
    <NavigationCursor />
    <div class="nav-item-content min-w-0">
      <div class="nav-item-heading flex min-h-5 flex-wrap items-center gap-x-3 gap-y-1">
        <span class="nav-item-title min-w-0 font-medium text-foreground wrap-anywhere keyboard:group-focus-visible:text-primary pointer:group-hover:text-primary pointer:group-active:text-primary">{title}</span>
        {detail && <span class="nav-item-detail ml-auto max-w-full text-xs text-muted wrap-anywhere mobile:text-ui-sm">{detail}</span>}
      </div>
      {description && <p class="nav-item-description my-3 text-xs leading-readable text-muted">{description}</p>}
      {meta && <small class="nav-item-meta mt-3 block text-xs text-foreground">{meta}</small>}
    </div>
    <span class="nav-item-target text-right text-xs text-primary" aria-hidden="true">{email ? '✉' : '↗'}</span>
    {!email && <span class="sr-only"> (opens in a new tab)</span>}
  </a>
}
