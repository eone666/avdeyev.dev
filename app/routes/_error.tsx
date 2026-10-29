import type { ErrorHandler } from 'hono'
import { ErrorPage } from '@/components/error-page'

const handler: ErrorHandler = (e, c) => {
  if ('getResponse' in e) {
    return e.getResponse()
  }

  // Log the whole error, not just the message — the stack is what makes a 500
  // debuggable from the container logs.
  console.error(e)

  c.status(500)
  return c.render(
    <ErrorPage
      code="500"
      title="Internal server error"
      description="The process exited unexpectedly. Please try again later."
    />,
    {
      title: 'Ivan Avdeyev | Internal server error',
      description: 'The page is temporarily unavailable.',
      robots: 'noindex, nofollow'
    }
  )
}

export default handler
