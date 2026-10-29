import { expect, test } from 'bun:test'
import { TerminalHome } from './terminal-home'
import { ErrorPage } from './error-page'
import { personalLinks, terminalProjects } from '../../shared/site'
import { asciiWordmark } from '../lib/terminal'

test('the server-rendered page contains usable links and tab content without JavaScript', async () => {
  const markup = await TerminalHome().toString()
  for (const link of personalLinks) {
    expect(markup).toContain(`href="${link.url}"`)
    expect(markup).toContain(link.label)
  }
  for (const project of terminalProjects) expect(markup).toContain(project.url)
  expect(markup.match(/class="menu-row nav-choice"/g)).toHaveLength(7)
  expect(markup).toContain('data-section="about"')
  expect(markup).toContain('data-section="projects"')
  expect(markup).toContain('id="name"')
  expect(markup).not.toContain('<input')
  expect(markup).not.toContain('<canvas')
})

test('ASCII title and error codes preserve a rectangular six-line text grid', () => {
  for (const title of ['AVDEYEV.DEV', '404', '500']) {
    const lines = asciiWordmark(title).split('\n')
    expect(lines).toHaveLength(6)
    expect(new Set(lines.map(line => line.length)).size).toBe(1)
    expect(lines.some(line => line.includes('█'))).toBe(true)
  }
})

test('the terminal error page exposes the error text and a working return link', async () => {
  const markup = await ErrorPage({ code: '404', title: 'Page not found', description: 'No such file or directory.' }).toString()
  expect(markup).toContain('404: Page not found')
  expect(markup).toContain('href="/"')
})
