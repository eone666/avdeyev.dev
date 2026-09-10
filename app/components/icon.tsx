import { getIcon, type IconName } from '../../shared/icons'

export type IconProps = {
  name: IconName
  class?: string
  id?: string
  role?: string
  'aria-label'?: string
  'aria-hidden'?: boolean | 'true' | 'false'
}

/**
 * Remix Icon for the site. Browse https://icon-sets.iconify.design/ri/.
 * Use the icon name without the `ri:` prefix.
 * @example <Icon name="settings-3-line" class="h-5 w-5" />
 */
export function Icon({ name, ...props }: IconProps) {
  const { body, viewBox } = getIcon(name)
  const paths = [...body.matchAll(/<path\b([^>]*)\/>/g)].map((match) => match[1])
  if (paths.length !== 1) throw new Error(`Remix icon "${name}" must contain one path.`)
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} width="1em" height="1em"
      fill="currentColor" aria-hidden={props['aria-label'] ? undefined : 'true'} focusable="false" {...props}>
      <path {...Object.fromEntries([...paths[0].matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]))} />
    </svg>
  )
}
