import type { NotFoundHandler } from 'hono'
import { ErrorPage } from '@/components/error-page'

const handler: NotFoundHandler = (c) => {
  c.status(404)
  return c.render(
    <ErrorPage
      code="404"
      title="Page not found"
      description="This chunk hasn't generated yet."
    />,
    {
      title: 'Ivan Avdeyev | Page not found',
      description: 'The requested page could not be found.',
      robots: 'noindex, nofollow'
    }
  )
}

export default handler
