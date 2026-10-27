/** Render archival PDF and public JSON exports from local source data. */
import { mkdir, writeFile } from 'node:fs/promises'
import { renderCv } from '../cv/render'
import { checkCv } from '../cv/check'

const publicDirectory = new URL('../public/', import.meta.url)
const { pdf, profileJson, resumeJson } = await renderCv()
await checkCv(pdf, profileJson, resumeJson)
await mkdir(publicDirectory, { recursive: true })
await Promise.all([
  writeFile(new URL('cv.pdf', publicDirectory), pdf),
  writeFile(new URL('profile.json', publicDirectory), profileJson),
  writeFile(new URL('resume.json', publicDirectory), resumeJson),
])
console.log(`Built PDF/A-3u candidate (${pdf.length} bytes), profile.json, and validated resume.json.`)
