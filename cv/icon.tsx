/** @jsxImportSource react */
import { Svg } from '@formepdf/react'
import { getIcon, type IconName } from '../shared/icons'

/**
 * Remix Icon for PDFs. Browse https://icon-sets.iconify.design/ri/.
 * Use the icon name without the `ri:` prefix. Size is in PDF points.
 * @example <PdfIcon name="home-line" size={15} />
 */
export function PdfIcon({ name, size = 15, color = '#000000' }: { name: IconName; size?: number; color?: string }) {
  const { body, viewBox } = getIcon(name)
  return <Svg width={size} height={size} viewBox={viewBox} content={body.replaceAll('currentColor', color)} />
}
