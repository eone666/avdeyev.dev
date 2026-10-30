import { expect, test } from 'bun:test'
import { TerminalHome } from '.'
import { personalLinks, terminalProjects } from '../../../shared/site'

test('the server-rendered page contains usable links and tab content without JavaScript', async () => {
  const markup = await TerminalHome().toString()
  for (const link of personalLinks) {
    expect(markup).toContain(`href="${link.url}"`)
    expect(markup).toContain(link.label)
  }
  for (const project of terminalProjects) expect(markup).toContain(project.url)
  const menuStart = markup.indexOf('<nav class="menu ')
  const linksMarkup = markup.slice(menuStart, markup.indexOf('</nav>', menuStart))
  expect(linksMarkup.match(/class="nav-item(?:\s[^"]*)?"/g)).toHaveLength(7)
  expect(markup.match(/class="nav-item(?:\s[^"]*)?"/g)).toHaveLength(12)
  expect(markup).toContain('data-section="about"')
  expect(markup).toContain('data-section="projects"')
  expect(markup).toContain('id="name"')
  expect(markup).not.toContain('<input')
  expect(markup).not.toContain('<canvas')
})
