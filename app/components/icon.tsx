export type IconProps = {
  class?: string
  id?: string
  role?: string
  'aria-label'?: string
  'aria-hidden'?: boolean | 'true' | 'false'
}

/**
 * Builds an SVG icon component. Sized in `em` and painted with `currentColor`
 * so a `class` on the call site controls both, the same way react-icons
 * behaved.
 *
 * The path is a real element, not injected markup. `raw()` and
 * `dangerouslySetInnerHTML` both render fine on the server but blow up in
 * hono/jsx/dom, so any icon used inside an island has to be built this way.
 */
export function makeIcon(viewBox: string, d: string) {
  return (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={d} />
    </svg>
  )
}
