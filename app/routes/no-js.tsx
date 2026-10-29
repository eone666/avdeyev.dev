import { createRoute } from 'honox/factory'
import { NoJsPage } from '@/components/no-js-page'

export default createRoute(c => c.render(<NoJsPage />, {
  title: 'Ivan Avdeyev | JavaScript disabled',
  robots: 'noindex, follow'
}))
