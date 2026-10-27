/** Add factual machine-readable context without changing the rendered pages. */
import { readFile, writeFile } from 'node:fs/promises'
import { AFRelationship, PDFDocument } from 'pdf-lib'

const profileUrl = new URL('../cv/profile.json', import.meta.url)
const pdfUrl = new URL('../public/cv.pdf', import.meta.url)
const profileBytes = await readFile(profileUrl)
const profile = JSON.parse(profileBytes.toString('utf8'))
const pdf = await PDFDocument.load(await readFile(pdfUrl), { updateMetadata: false })

pdf.setTitle(`${profile.basics.name} | ${profile.basics.label} | CV`)
pdf.setAuthor(profile.basics.name)
pdf.setSubject(`${profile.basics.summary} Extended project details and sources are attached as profile.json.`)
pdf.setKeywords([
  ...new Set([
    profile.basics.label,
    ...profile.skills.flatMap((group) => group.keywords),
    ...profile.projectDetails.flatMap((project) => [project.name, ...project.technologies]),
  ]),
])
await pdf.attach(profileBytes, 'profile.json', {
  mimeType: 'application/json',
  afRelationship: AFRelationship.Supplement,
  description: 'Ivan Avdeyev: experience, skills, education, project details, and source references.',
})

// Save in place to retain the original page content, links, and structure tree.
await writeFile(pdfUrl, await pdf.save())
console.log(`Embedded profile.json (${profileBytes.length} bytes); preserved ${pdf.getPageCount()} CV pages.`)
