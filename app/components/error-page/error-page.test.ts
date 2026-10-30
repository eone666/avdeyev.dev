import { expect, test } from 'bun:test'
import { ErrorPage } from '.'

test('the terminal error page exposes the error text and a working return link', async () => {
  const markup = await ErrorPage({ code: '404', title: 'Page not found', description: 'No such file or directory.' }).toString()
  expect(markup).toContain('404: Page not found')
  expect(markup).toContain('href="/"')
})
