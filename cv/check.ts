import assert from 'node:assert/strict'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { PDFDocument, PDFName, PDFDict, PDFArray, PDFRawStream, decodePDFRawStream } from 'pdf-lib'
import profile from './profile.json'
import { workDateText } from './format'
import { PROFILE_URL } from '../shared/resume'
import { validateResume } from '../shared/resume-validation'

/** Inspect the rendered file using an independent PDF parser, not layout metadata. */
export async function checkCv(pdfBytes: Uint8Array, expectedProfile: string, expectedResume: string) {
  const pdf = await getDocument({ data: pdfBytes.slice(), useSystemFonts: true, isEvalSupported: false, verbosity: 0 }).promise
  try {
    const texts: string[] = []
    const links: string[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      texts.push(content.items.map(item => 'str' in item ? item.str : '').join(' ').replace(/\s+/g, ' '))
      const annotations = await page.getAnnotations()
      assert.equal(annotations.some(item => item.url === PROFILE_URL), i === pdf.numPages, 'Profile link must appear only on the final page')
      for (const annotation of annotations) {
        if (annotation.url) links.push(annotation.url)
      }
    }
    const text = texts.join(' ')
    assert.ok(text.includes(profile.basics.name), 'Candidate name missing from text layer')
    assert.ok(text.includes(profile.basics.email), 'Email missing from text layer')
    for (const heading of ['Professional Summary', 'Work Experience', 'Education', 'Technical Skills', 'Selected Projects']) {
      assert.ok(text.includes(heading), `Missing heading: ${heading}`)
    }
    let previousJob = -1
    for (const job of profile.work) {
      const company = text.indexOf(job.company)
      assert.ok(company > previousJob, `Work history reading order is incorrect: ${job.company}`)
      const date = `${workDateText(job.startDate)}–${workDateText(job.endDate)}`
      assert.ok(text.indexOf(date, company) > company, `Dates missing after company: ${job.company}`)
      for (const highlight of job.highlights) assert.ok(text.includes(highlight), `Missing work highlight: ${highlight}`)
      previousJob = company
    }
    for (const selected of profile.selectedProjects) {
      assert.ok(text.includes(selected.name), `Missing project: ${selected.name}`)
      assert.ok(links.includes(new URL(selected.url).href), `Missing project link: ${selected.name}`)
    }
    assert.ok(links.includes(PROFILE_URL), 'Public profile URL missing from PDF links')
    assert.ok(text.includes('avdeyev.dev/profile.json'), 'Public profile URL missing from PDF text')
    const files = await pdf.getAttachments()
    assert.ok(files, 'PDF attachments missing')
    const decoder = new TextDecoder()
    assert.equal(decoder.decode(files['profile.json']?.content), expectedProfile)
    assert.equal(decoder.decode(files['resume.json']?.content), expectedResume)
    validateResume(JSON.parse(decoder.decode(files['resume.json'].content)))
  } finally {
    await pdf.destroy()
  }
  const structure = await PDFDocument.load(pdfBytes, { updateMetadata: false })
  assert.ok(structure.catalog.has(PDFName.of('StructTreeRoot')), 'Tagged PDF structure missing')
  const associated = structure.catalog.lookup(PDFName.of('AF'), PDFArray)
  assert.equal(associated.size(), 2)
  const expectedRelationships: Record<string, string> = { 'profile.json': '/Supplement', 'resume.json': '/Alternative' }
  for (const ref of associated.asArray()) {
    const file = structure.context.lookup(ref, PDFDict)
    const name = file.get(PDFName.of('F'))
    assert.ok(name && 'decodeText' in name)
    const filename = (name as { decodeText(): string }).decodeText()
    assert.equal(file.get(PDFName.of('AFRelationship'))?.toString(), expectedRelationships[filename])
    const stream = structure.context.lookup(file.lookup(PDFName.of('EF'), PDFDict).get(PDFName.of('F')))
    assert.ok(stream instanceof PDFRawStream)
    assert.equal(stream.dict.get(PDFName.of('Subtype'))?.toString(), '/application#2Fjson')
  }
  const metadata = structure.context.lookup(structure.catalog.get(PDFName.of('Metadata')))
  assert.ok(metadata instanceof PDFRawStream)
  const xmp = new TextDecoder().decode(decodePDFRawStream(metadata).decode())
  assert.match(xmp, /pdfaid:part[^>]*>3</)
  assert.match(xmp, /pdfaid:conformance[^>]*>U</)
}
