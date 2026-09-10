import iconSet from '@iconify-json/ri/icons.json'

export type IconName = keyof typeof iconSet.icons

export interface IconData {
  body: string
  viewBox: string
}

/** Remix Icon names. Browse https://icon-sets.iconify.design/ri/ (omit the `ri:` prefix). */
export function getIcon(name: IconName): IconData {
  const icon = iconSet.icons[name] as { body: string }
  if (!icon) throw new Error(`Icon "${name}" was not found in the Remix Icon set.`)
  return { body: icon.body, viewBox: '0 0 24 24' }
}
