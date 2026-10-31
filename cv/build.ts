/** Render archival PDF and public JSON exports from local source data. */
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { renderCv } from './render'
import { checkCv } from './check'

const publicDirectory = new URL('../public/', import.meta.url)
const { pdf, resumeJson } = await renderCv()
await checkCv(pdf, resumeJson)
await mkdir(publicDirectory, { recursive: true })
await rm(new URL('profile.json', publicDirectory), { force: true })
await Promise.all([
  writeFile(new URL('cv.pdf', publicDirectory), pdf),
  writeFile(new URL('resume.json', publicDirectory), resumeJson),
])
console.log(`Built PDF/A-3u candidate (${pdf.length} bytes), validated resume.json.`)
